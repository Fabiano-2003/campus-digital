import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  ExternalLink, 
  Phone, 
  Mail,
  Building,
  GraduationCap,
  Award,
  Wifi
} from "lucide-react";

interface Institution {
  id: string;
  name: string;
  description?: string;
  institution_type: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  established_year?: number;
  student_count?: number;
  faculty_count?: number;
  accreditation?: string[];
  programs?: string[];
  facilities?: string[];
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  social_media?: any;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  user_id: string;
}

export default function InstitutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  useEffect(() => {
    if (id) {
      fetchInstitution();
      fetchReviews();
    }
  }, [id]);

  const fetchInstitution = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setInstitution(data);
    } catch (error) {
      console.error('Error fetching institution:', error);
      toast({
        title: "Erro ao carregar instituição",
        description: "Não foi possível carregar os dados da instituição.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('institution_reviews')
        .select('*')
        .eq('institution_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('institution_reviews')
        .insert([{
          institution_id: id,
          user_id: user.id,
          rating: newReview.rating,
          title: newReview.title || null,
          comment: newReview.comment || null
        }]);

      if (error) throw error;

      toast({
        title: "Avaliação enviada",
        description: "Sua avaliação foi enviada com sucesso!",
      });

      setShowReviewForm(false);
      setNewReview({ rating: 5, title: "", comment: "" });
      fetchReviews();
      fetchInstitution(); // Para atualizar a média de avaliações
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: "Não foi possível enviar sua avaliação.",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      university: "Universidade",
      college: "Faculdade", 
      training_center: "Centro de Formação",
      technical_school: "Escola Técnica"
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Instituição não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A instituição que você está procurando não foi encontrada.
            </p>
            <Button onClick={() => navigate('/institutions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Instituições
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/institutions')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Instituições
          </Button>

          {/* Header da Instituição */}
          <Card className="mb-8">
            {institution.cover_image_url && (
              <div className="h-48 w-full overflow-hidden rounded-t-lg">
                <img 
                  src={institution.cover_image_url} 
                  alt={`Capa ${institution.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start gap-6">
                {institution.logo_url && (
                  <img 
                    src={institution.logo_url} 
                    alt={`Logo ${institution.name}`}
                    className="h-20 w-20 rounded-lg object-cover border"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-3xl">{institution.name}</CardTitle>
                    {institution.is_verified && (
                      <Badge variant="secondary">Verificado ✓</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-4">
                    {getTypeLabel(institution.institution_type)}
                  </Badge>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{institution.city}, {institution.state}</span>
                    </div>
                    {institution.established_year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Fundada em {institution.established_year}</span>
                      </div>
                    )}
                    {institution.student_count && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{institution.student_count.toLocaleString()} estudantes</span>
                      </div>
                    )}
                    {institution.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{institution.rating.toFixed(1)} ({institution.reviews_count} avaliações)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Descrição */}
          {institution.description && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sobre a Instituição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {institution.description}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Programas/Cursos */}
            {institution.programs && institution.programs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Programas e Cursos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {institution.programs.map((program, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {institution.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{institution.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {institution.city}, {institution.state} - {institution.postal_code}
                      </p>
                    </div>
                  </div>
                )}
                {institution.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{institution.phone}</span>
                  </div>
                )}
                {institution.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{institution.email}</span>
                  </div>
                )}
                {institution.website && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {institution.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Facilidades */}
          {institution.facilities && institution.facilities.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Facilidades e Infraestrutura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {institution.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acreditações */}
          {institution.accreditation && institution.accreditation.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Acreditações e Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {institution.accreditation.map((accred, index) => (
                    <Badge key={index} variant="secondary">
                      {accred}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avaliações */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Avaliações</CardTitle>
                {user && (
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    variant="outline"
                  >
                    {showReviewForm ? "Cancelar" : "Avaliar"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <div className="mb-6 p-4 border rounded-lg space-y-4">
                  <div>
                    <label className="text-sm font-medium">Avaliação:</label>
                    <Select 
                      value={newReview.rating.toString()} 
                      onValueChange={(value) => setNewReview(prev => ({ ...prev, rating: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {"★".repeat(rating)} {rating}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Título (opcional):</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título da sua avaliação"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comentário:</label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Compartilhe sua experiência..."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={submitReview}>
                    Enviar Avaliação
                  </Button>
                </div>
              )}

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Ainda não há avaliações para esta instituição.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}