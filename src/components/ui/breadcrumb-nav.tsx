import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  const location = useLocation();
  
  // Generate breadcrumbs based on current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Início', href: '/' }];
    
    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map path segments to readable labels
      const labelMap: Record<string, string> = {
        dashboard: 'Dashboard',
        groups: 'Grupos',
        institutions: 'Instituições',
        library: 'Biblioteca',
        documents: 'Documentos',
        follow: 'Seguir',
        chat: 'Chat',
        auth: 'Autenticação',
        'create-group': 'Criar Grupo',
        'email-confirmation': 'Confirmação de Email'
      };
      
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Don't add href for the last item (current page)
      if (index === pathnames.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, href: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = items || generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground mb-6", className)}>
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="h-4 w-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium flex items-center gap-1">
              {index === 0 && <Home className="h-4 w-4" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}