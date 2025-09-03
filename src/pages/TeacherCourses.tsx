
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Users, Edit, Settings, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function TeacherCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    title: "",
    description: "",
    subject: "",
    level: "",
    institution: "",
    max_students: 50
  });

  // Fetch teacher's courses
  const { data: teacherCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['teacher-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('teacher_courses')
        .select(`
          *,
          course_enrollments(count)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(course => ({
        ...course,
        enrollments_count: course.course_enrollments?.[0]?.count || 0
      })) || [];
    },
    enabled: !!user?.id
  });

  // Fetch course enrollments for approval
  const { data: pendingEnrollments } = useQuery({
    queryKey: ['pending-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          student:student_id!inner(
            full_name,
            avatar_url,
            institution,
            academic_level
          ),
          teacher_courses!inner(
            title
          )
        `)
        .eq('teacher_courses.teacher_id', user.id)
        .eq('status', 'pending')
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourseData) => {
      const { data, error } = await supabase
        .from('teacher_courses')
        .insert({
          ...courseData,
          teacher_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      toast.success("Curso criado com sucesso!");
      setIsCreateDialogOpen(false);
      setNewCourseData({
        title: "",
        description: "",
        subject: "",
        level: "",
        institution: "",
        max_students: 50
      });
    },
    onError: (error) => {
      console.error("Error creating course:", error);
      toast.error("Erro ao criar curso");
    }
  });

  // Handle enrollment approval
  const handleEnrollmentDecision = async (enrollmentId: string, decision: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update({ status: decision })
        .eq('id', enrollmentId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments'] });
      toast.success(`Inscrição ${decision === 'accepted' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast.error("Erro ao processar inscrição");
    }
  };

  const subjects = [
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
    { value: "ensino_medio", label: "Ensino Médio" },
    { value: "graduacao", label: "Graduação" },
    { value: "pos_graduacao", label: "Pós-graduação" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-6">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses">Meus Cursos</TabsTrigger>
            <TabsTrigger value="enrollments">Solicitações de Inscrição</TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meus Cursos</CardTitle>
                    <CardDescription>
                      Gerencie os cursos que você ministra
                    </CardDescription>
                  </div>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Curso
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Curso</DialogTitle>
                        <DialogDescription>
                          Configure seu curso para receber alunos
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título do Curso</Label>
                          <Input
                            id="title"
                            value={newCourseData.title}
                            onChange={(e) => setNewCourseData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ex: Cálculo I - Fundamentos"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={newCourseData.description}
                            onChange={(e) => setNewCourseData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descreva o conteúdo e objetivos do curso..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Disciplina</Label>
                          <Select onValueChange={(value) => setNewCourseData(prev => ({ ...prev, subject: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="level">Nível</Label>
                          <Select onValueChange={(value) => setNewCourseData(prev => ({ ...prev, level: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="institution">Instituição</Label>
                          <Input
                            id="institution"
                            value={newCourseData.institution}
                            onChange={(e) => setNewCourseData(prev => ({ ...prev, institution: e.target.value }))}
                            placeholder="Nome da instituição"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_students">Máximo de Alunos</Label>
                          <Input
                            id="max_students"
                            type="number"
                            min="1"
                            max="500"
                            value={newCourseData.max_students}
                            onChange={(e) => setNewCourseData(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => createCourseMutation.mutate(newCourseData)} disabled={createCourseMutation.isPending}>
                            {createCourseMutation.isPending ? "Criando..." : "Criar Curso"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {coursesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherCourses?.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-lg line-clamp-2">{course.title}</h3>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {course.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{course.subject}</Badge>
                          <Badge variant="outline">{course.level}</Badge>
                          <Badge variant={course.is_active ? "default" : "destructive"}>
                            {course.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.enrollments_count}/{course.max_students} alunos</span>
                          </div>
                          <span>
                            {formatDistanceToNow(new Date(course.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-4 w-4 mr-1" />
                            Conteúdo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!teacherCourses || teacherCourses.length === 0) && (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">Nenhum curso criado</h3>
                      <p className="text-muted-foreground mb-4">
                        Crie seu primeiro curso e comece a ensinar
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Curso
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Enrollment Requests Tab */}
          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Inscrição</CardTitle>
                <CardDescription>
                  Gerencie as solicitações de alunos para seus cursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEnrollments?.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <span className="font-semibold text-primary">
                            {enrollment.student.full_name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{enrollment.student.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.student.institution} • {enrollment.student.academic_level}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Curso: {enrollment.teacher_courses.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEnrollmentDecision(enrollment.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleEnrollmentDecision(enrollment.id, 'accepted')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!pendingEnrollments || pendingEnrollments.length === 0) && (
                    <div className="text-center py-8">
                      <Hourglass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
