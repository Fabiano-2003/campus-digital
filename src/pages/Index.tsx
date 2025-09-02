import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { PublicFeed } from "@/components/home/PublicFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LandingLayout>
      <HeroSection />
      
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Conteúdo Público
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore posts, vídeos, monografias e livros compartilhados publicamente pela comunidade acadêmica
              </p>
            </div>

            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="feed">Feed Público</TabsTrigger>
                <TabsTrigger value="featured">Destaques</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="space-y-6">
                <PublicFeed />
              </TabsContent>
              
              <TabsContent value="featured" className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">Em Breve</h3>
                  <p className="text-muted-foreground">
                    Conteúdo em destaque estará disponível em breve
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Index;
