import { BookOpen, Mail, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Footer = () => {
  const footerSections = [
    {
      title: "Plataforma",
      links: [
        { label: "Biblioteca", href: "/library" },
        { label: "Documentos", href: "/documents" },
        { label: "Seguir", href: "/follow" },
        { label: "Grupos de Estudo", href: "/groups" }
      ]
    },
    {
      title: "Recursos",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Chat", href: "/chat" },
        { label: "Instituições", href: "/institutions" },
        { label: "Criar Grupo", href: "/create-group" }
      ]
    },
    {
      title: "Institucional",
      links: [
        { label: "Início", href: "/" },
        { label: "Autenticação", href: "/auth" },
        { label: "Email Confirmação", href: "/email-confirmation" },
        { label: "Contato", href: "mailto:contato@saberangola.com" }
      ]
    }
  ];

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-primary">SaberAngola</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Democratizando o acesso ao conhecimento académico em Angola. 
              Construindo pontes entre estudantes, educadores e pesquisadores.
            </p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Luanda, Angola</span>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-semibold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('mailto:') ? (
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Feito com</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>para estudantes angolanos</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="mailto:contato@saberangola.com">
                <Mail className="h-4 w-4 mr-2" />
                Contactar
              </a>
            </Button>
            <div className="text-sm text-muted-foreground">
              © 2024 SaberAngola. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};