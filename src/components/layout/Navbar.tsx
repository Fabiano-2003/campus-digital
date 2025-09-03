import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, User, LogOut, Settings, Sparkles, Home, BookOpen, Users, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onMenuClick: () => void;
  showAuthButtons?: boolean;
}

export const Navbar = ({ onMenuClick, showAuthButtons = false }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Building, label: "Instituições", href: "/institutions" },
    { icon: Users, label: "Grupos", href: "/groups" },
    { icon: BookOpen, label: "Biblioteca", href: "/library" }
  ];

  return (
    <nav className="border-b bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 sticky top-0 z-50 shadow-sm">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="mr-6 hidden lg:flex">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="font-bold text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SaberAngola
            </div>
          </Link>
        </div>
        
        {user && (
          <nav className="hidden lg:flex items-center space-x-1 mr-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:text-primary group"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-foreground/70 group-hover:text-primary transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none max-w-md">
            <Button 
              variant="outline" 
              className="inline-flex items-center gap-3 relative h-10 w-full justify-start text-sm text-muted-foreground border-gray-200 hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 rounded-full"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="hidden lg:inline-flex">Pesquisar recursos, pessoas...</span>
              <span className="inline-flex lg:hidden">Pesquisar</span>
              <Badge variant="outline" className="ml-auto hidden sm:inline-flex text-xs px-2 py-0.5 bg-gray-100">
                ⌘K
              </Badge>
            </Button>
          </div>
          
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all duration-200 rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all duration-200">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-semibold text-sm">{user.user_metadata?.full_name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard" className="flex items-center py-2">
                        <User className="mr-3 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 text-red-600 focus:text-red-600">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : showAuthButtons && (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="text-sm font-medium">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-full px-6 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/auth">Criar Conta</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};