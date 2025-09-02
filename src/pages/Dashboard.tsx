import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { AcademicFeed } from "@/components/dashboard/AcademicFeed";
import { LibrarySection } from "@/components/dashboard/LibrarySection";
import { StudyGroups } from "@/components/dashboard/StudyGroups";
import { DocumentGenerator } from "@/components/dashboard/DocumentGenerator";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BookOpen, Users, FileText, User, Home, MessageCircle, Play, Building } from "lucide-react";
import Chat from "@/pages/Chat";
import Documents from "@/pages/Documents";
import Institutions from "@/pages/Institutions";
import { DocumentsFeed } from "@/components/feeds/DocumentsFeed";
import { VideosFeed } from "@/components/feeds/VideosFeed";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 bg-gradient-to-br from-background via-background to-muted/10">
        <div className="max-w-7xl mx-auto">
          {/* Header with search */}
          <div className="mb-10 animate-fade-in">
            <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
              <h1 className="text-4xl font-bold">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Explore, aprenda e conecte-se com a comunidade acadêmica
              </p>
            </div>
            <SearchBar />
          </div>

          {/* Main Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-10 mb-8 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm border-0 shadow-lg p-2 h-14">
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;