import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { AcademicFeed } from "@/components/dashboard/AcademicFeed";
import { LibrarySection } from "@/components/dashboard/LibrarySection";
import { StudyGroups } from "@/components/dashboard/StudyGroups";
import { DocumentGenerator } from "@/components/dashboard/DocumentGenerator";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BookOpen, Users, FileText, User, Home, MessageCircle, Play, Building } from "lucide-react";
import Chat from "@/pages/Chat";
import Documents from "@/pages/Documents";
import Institutions from "@/pages/Institutions";
import { DocumentsFeed } from "@/components/feeds/DocumentsFeed";
import { VideosFeed } from "@/components/feeds/VideosFeed";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { user, loading } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground">Você precisa estar logado para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with search */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Bem-vindo, {user.user_metadata?.full_name || user.email}
              </h1>
              <SearchBar />
            </div>

            {/* Main Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-10 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Início
                </TabsTrigger>
                <TabsTrigger value="library" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Biblioteca
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Grupos
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="documents-feed" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Feed Docs
                </TabsTrigger>
                <TabsTrigger value="videos-feed" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Feed Vídeos
                </TabsTrigger>
                <TabsTrigger value="institutions" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Instituições
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <TabsContent value="overview" className="space-y-6">
                <DashboardOverview />
                <AcademicFeed />
              </TabsContent>

              <TabsContent value="library">
                <LibrarySection />
              </TabsContent>

              <TabsContent value="groups">
                <StudyGroups />
              </TabsContent>

              <TabsContent value="documents">
                <Documents />
              </TabsContent>

              <TabsContent value="chat">
                <Chat />
              </TabsContent>

              <TabsContent value="documents-feed">
                <DocumentsFeed />
              </TabsContent>

              <TabsContent value="videos-feed">
                <VideosFeed />
              </TabsContent>

              <TabsContent value="institutions">
                <Institutions />
              </TabsContent>

              <TabsContent value="profile">
                <ProfileSection />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;