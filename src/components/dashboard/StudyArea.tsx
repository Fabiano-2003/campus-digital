
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Play, Users, Clock, Star, Search, Filter, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface TeacherCourse {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  subject: string;
  level: string;
  institution: string | null;
  cover_url: string | null;
  is_active: boolean;
  max_students: number;
  created_at: string;
  teacher?: {
    full_name: string;
    avatar_url: string | null;
  };
  enrollments_count?: number;
  enrollment_status?: 'pending' | 'accepted' | 'rejected' | null;
}

interface CourseContent {
  id: string;
  title: string;
  content_type: 'video' | 'reading' | 'assignment' | 'quiz';
  content_url: string | null;
  content_text: string | null;
  position: number;
  created_at: string;
}

export function StudyArea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Fetch available courses
  const { data: availableCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['available-courses', searchQuery, selectedSubject, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('teacher_courses')
        .select(`
          *,
          teacher:teacher_id!inner(
            full_name,
            avatar_url
          ),
          course_enrollments(count)
        `)
        .eq('is_active', true);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
      }

      if (selectedSubject !== "all") {
        query = query.eq('subject', selectedSubject);
      }

      if (selectedLevel !== "all") {
        query = query.eq('level', selectedLevel);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Check enrollment status for each course
      if (user?.id && data) {
        const coursesWithStatus = await Promise.all(
          data.map(async (course) => {
            const { data: enrollment } = await supabase
              .from('course_enrollments')
              .select('status')
              .eq('course_id', course.id)
              .eq('student_id', user.id)
              .single();

            return {
              ...course,
              enrollments_count: course.course_enrollments?.[0]?.count || 0,
              enrollment_status: enrollment?.status || null
            };
          })
        );
        return coursesWithStatus;
      }

      return data?.map(course => ({
        ...course,
        enrollments_count: course.course_enrollments?.[0]?.count || 0
      })) || [];
    }
  });

  // Fetch enrolled courses
  const { data: enrolledCourses } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          teacher_courses!inner(
            *,
            teacher:teacher_id!inner(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      return data?.map(enrollment => enrollment.teacher_courses) || [];
    },
    enabled: !!user?.id
  });

  // Fetch course content
  const { data: courseContent } = useQuery({
    queryKey: ['course-content', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('position');

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourse
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: user?.id,
          status: 'pending'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
      toast.success("Solicitação de inscrição enviada!");
    },
    onError: (error) => {
      console.error("Error enrolling:", error);
      toast.error("Erro ao solicitar inscrição");
    }
  });

  const subjects = [
    { value: "all", label: "Todas as Disciplinas" },
    { value: "matematica", label: "Matemática" },
    { value: "fisica", label: "Física" },
    { value: "quimica", label: "Química" },
    { value: "biologia", label: "Biologia" },
    { value: "historia", label: "História" },
    { value: "portugues", label: "Português" },
    { value: "filosofia", label: "Filosofia" },
    { value: "informatica", label: "Informática" },
  ];

  const levels = [
    { value: "all", label: "Todos os Níveis" },
    { value: "ensino_medio", label: "Ensino Médio" },
    { value: "graduacao", label: "Graduação" },
    { value: "pos_graduacao", label: "Pós-graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" },
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'reading': return BookOpen;
      case 'assignment': return CheckCircle;
      case 'quiz': return Star;
      default: return BookOpen;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Hourglass className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'accepted':
        return <Badge variant="default" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Inscrito</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Cursos Disponíveis</TabsTrigger>
          <TabsTrigger value="enrolled">Meus Cursos</TabsTrigger>
        </TabsList>

        {/* Available Courses Tab */}
        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Área de Estudo</span>
              </CardTitle>
              <CardDescription>
                Encontre e se inscreva em cursos ministrados por professores qualificados
              </CardDescription>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cursos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {coursesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses?.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg line-clamp-2">{course.title}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {course.teacher?.full_name?.charAt(0)?.toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {course.teacher?.full_name || 'Professor'}
                          </span>
                        </div>
                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {course.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{course.subject}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        {course.institution && (
                          <Badge variant="outline" className="text-xs">
                            {course.institution}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{course.enrollments_count}/{course.max_students}</span>
                        </div>
                        <span>
                          {formatDistanceToNow(new Date(course.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getStatusBadge(course.enrollment_status)}
                        
                        <Button 
                          size="sm"
                          disabled={course.enrollment_status === 'pending' || course.enrollment_status === 'accepted'}
                          onClick={() => enrollMutation.mutate(course.id)}
                        >
                          {course.enrollment_status === 'accepted' ? 'Inscrito' :
                           course.enrollment_status === 'pending' ? 'Pendente' :
                           'Solicitar Inscrição'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!availableCourses || availableCourses.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">Nenhum curso encontrado</h3>
                    <p className="text-muted-foreground">
                      Não há cursos disponíveis com os filtros selecionados
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Enrolled Courses Tab */}
        <TabsContent value="enrolled">
          {selectedCourse ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conteúdo do Curso</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                    Voltar aos Meus Cursos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseContent?.map((content, index) => {
                    const ContentIcon = getContentIcon(content.content_type);
                    return (
                      <div key={content.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          <ContentIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{content.title}</h4>
                          <Badge variant="outline" className="capitalize mt-1">
                            {content.content_type === 'video' ? 'Vídeo-aula' :
                             content.content_type === 'reading' ? 'Leitura' :
                             content.content_type === 'assignment' ? 'Atividade' :
                             'Quiz'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Aula {index + 1}
                        </div>
                        <Button size="sm">
                          {content.content_type === 'video' ? '▶ Assistir' : '📖 Acessar'}
                        </Button>
                      </div>
                    );
                  })}

                  {(!courseContent || courseContent.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Este curso ainda não possui conteúdo disponível</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses?.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6" onClick={() => setSelectedCourse(course.id)}>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-green-600" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg line-clamp-2">{course.title}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {course.teacher?.full_name?.charAt(0)?.toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {course.teacher?.full_name || 'Professor'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{course.subject}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inscrito
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Inscrito {formatDistanceToNow(new Date(course.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!enrolledCourses || enrolledCourses.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">Você não está inscrito em nenhum curso</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore os cursos disponíveis e solicite inscrição nos que interessam
                    </p>
                    <Button onClick={() => document.querySelector('[value="available"]')?.click()}>
                      Explorar Cursos
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
