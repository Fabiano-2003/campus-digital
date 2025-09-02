import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Users, 
  BookOpen, 
  FileText, 
  MessageCircle, 
  Building,
  UserPlus,
  Search
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: 'default' | 'outline' | 'secondary';
  badge?: string;
  authRequired?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-group',
    title: 'Criar Grupo',
    description: 'Iniciar grupo de estudo',
    icon: Plus,
    href: '/create-group',
    variant: 'default',
    authRequired: true
  },
  {
    id: 'join-groups',
    title: 'Explorar Grupos',
    description: 'Encontrar grupos de estudo',
    icon: Users,
    href: '/groups',
    variant: 'outline'
  },
  {
    id: 'library',
    title: 'Biblioteca',
    description: 'Livros e monografias',
    icon: BookOpen,
    href: '/library',
    variant: 'outline'
  },
  {
    id: 'documents',
    title: 'Meus Documentos',
    description: 'Gerenciar documentos',
    icon: FileText,
    href: '/documents',
    variant: 'outline',
    authRequired: true
  },
  {
    id: 'chat',
    title: 'Chat',
    description: 'Conversar com colegas',
    icon: MessageCircle,
    href: '/chat',
    variant: 'outline',
    authRequired: true
  },
  {
    id: 'follow',
    title: 'Rede Social',
    description: 'Seguir e ser seguido',
    icon: UserPlus,
    href: '/follow',
    variant: 'outline',
    badge: 'Novo',
    authRequired: true
  },
  {
    id: 'institutions',
    title: 'Instituições',
    description: 'Explorar universidades',
    icon: Building,
    href: '/institutions',
    variant: 'outline'
  }
];

interface QuickActionsProps {
  className?: string;
  limit?: number;
  showTitle?: boolean;
}

export function QuickActions({ className, limit, showTitle = true }: QuickActionsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleActionClick = (action: QuickAction) => {
    if (action.authRequired && !user) {
      navigate('/auth');
      return;
    }
    navigate(action.href);
  };

  const displayActions = limit ? quickActions.slice(0, limit) : quickActions;

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayActions.map((action) => (
          <Card 
            key={action.id}
            className="hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => handleActionClick(action)}
          >
            <CardContent className="p-4 text-center">
              <div className="relative mb-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                {action.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 text-xs px-1 py-0"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>
              <h4 className="font-medium text-sm mb-1">{action.title}</h4>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}