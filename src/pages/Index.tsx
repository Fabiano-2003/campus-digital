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
      
      <section className="py-20 bg-gradient-to-br from-gray-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-responsive-xl font-bold text-gradient-primary mb-6">
                Descubra Conteúdo Incrível
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore posts, vídeos, monografias e livros compartilhados pela comunidade acadêmica angolana. 
                Conhecimento ao seu alcance.
              </p>
            </div>

            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-2">
                <TabsTrigger 
                  value="feed" 
                  className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  📱 Feed Público
                </TabsTrigger>
                <TabsTrigger 
                  value="featured"
                  className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  ⭐ Destaques
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="space-y-8">
                <PublicFeed />
              </TabsContent>
              
              <TabsContent value="featured" className="space-y-8">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-12 text-center border border-primary/10 shadow-lg">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">Conteúdo em Destaque</h3>
                  <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                    Estamos preparando uma seleção especial dos melhores conteúdos da nossa comunidade. 
                    Em breve você terá acesso aos destaques mais populares!
                  </p>
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-full px-6 py-2 font-semibold">
                    Notificar-me
                  </Button>
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
