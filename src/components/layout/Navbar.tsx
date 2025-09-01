import { Search, Bell, User, Globe, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao sair da conta",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até breve!",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-lg text-primary">SaberAngola</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Pesquisar livros, monografias, comunidade..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:inline">PT</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Português (Angola)</DropdownMenuItem>
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:inline">
                    {user ? user.email?.split('@')[0] : "Entrar"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem>
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/perfil")}>
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/auth")}>
                      Entrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/auth")}>
                      Criar conta
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};