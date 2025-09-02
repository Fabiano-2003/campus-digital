import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { PublicFeed } from "@/components/home/PublicFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 min-h-screen">
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
          
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Index;
