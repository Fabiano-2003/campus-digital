import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Search, MapPin, Calendar, Users, Star, ExternalLink, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Institution {
  id: string;
  name: string;
  description?: string;
  institution_type: string;
  city: string;
  state: string;
  country: string;
  established_year?: number;
  student_count?: number;
  programs?: string[];
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  website?: string;
  logo_url?: string;
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: "Erro ao carregar instituições",
        description: "Não foi possível carregar a lista de instituições.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || institution.institution_type === typeFilter;
    const matchesState = stateFilter === "all" || institution.state === stateFilter;
    return matchesSearch && matchesType && matchesState;
  });

  const institutionTypes = [...new Set(institutions.map(inst => inst.institution_type))];
  const states = [...new Set(institutions.map(inst => inst.state))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Instituições de Ensino
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore universidades, faculdades e centros de formação profissional
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar instituições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de instituição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {institutionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Instituições */}
          {filteredInstitutions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma instituição encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" || stateFilter !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Ainda não há instituições cadastradas."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredInstitutions.map((institution) => (
                <Card 
                  key={institution.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/institution/${institution.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {institution.logo_url && (
                            <img 
                              src={institution.logo_url} 
                              alt={`Logo ${institution.name}`}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              {institution.name}
                              {institution.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verificado ✓
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {institution.city}, {institution.state}
                              </div>
                              {institution.established_year && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Desde {institution.established_year}
                                </div>
                              )}
                              {institution.student_count && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {institution.student_count.toLocaleString()} alunos
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">
                          {getTypeLabel(institution.institution_type)}
                        </Badge>
                        {institution.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{institution.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">
                              ({institution.reviews_count} avaliações)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {institution.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {institution.description}
                      </p>
                    )}
                    
                    {institution.programs && institution.programs.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Principais cursos:</p>
                        <div className="flex flex-wrap gap-2">
                          {institution.programs.slice(0, 4).map((program, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                          {institution.programs.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{institution.programs.length - 4} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/institution/${institution.id}`);
                          }}
                        >
                          Ver Detalhes
                        </Button>
                        {institution.website && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(institution.website, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Site
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}