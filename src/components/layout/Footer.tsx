import { BookOpen, Mail, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const footerSections = [
    {
      title: "Plataforma",
      links: [
        { label: "Biblioteca", href: "/biblioteca" },
        { label: "Documentos", href: "/documentos" },
        { label: "Comunidade", href: "/comunidade" },
        { label: "Grupos de Estudo", href: "/grupos" }
      ]
    },
    {
      title: "Recursos",
      links: [
        { label: "Ajuda", href: "/ajuda" },
        { label: "API", href: "/api" },
        { label: "Desenvolvedores", href: "/dev" },
        { label: "Modo Leve", href: "/lite" }
      ]
    },
    {
      title: "Institucional",
      links: [
        { label: "Sobre", href: "/sobre" },
        { label: "Termos de Uso", href: "/termos" },
        { label: "Privacidade", href: "/privacidade" },
        { label: "Contacto", href: "/contacto" }
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
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
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
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Contactar
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