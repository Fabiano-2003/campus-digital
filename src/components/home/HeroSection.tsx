import { motion } from "framer-motion";
import { Search, BookOpen, Users, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const HeroSection = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const quickActions = [
    {
      icon: FileEdit,
      title: "Gerar Documento",
      description: "Criar CV, carta ou trabalho",
      color: "bg-success/10 text-success"
    },
    {
      icon: Users,
      title: "Grupos de Estudo",
      description: "Juntar-se à comunidade",
      color: "bg-info/10 text-info"
    },
    {
      icon: BookOpen,
      title: "Biblioteca",
      description: "Explorar monografias",
      color: "bg-warning/10 text-warning"
    }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-hero-gradient opacity-5" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Hero Text */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
          >
            Plataforma Académica de{" "}
            <span className="bg-hero-gradient bg-clip-text text-transparent">
              Angola
            </span>
          </motion.h1>
          
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Acesso gratuito a conhecimento, documentos académicos e comunidade estudantil.
            Construindo o futuro da educação angolana.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={fadeInUp}
            className="max-w-2xl mx-auto mb-12"
          >
            <Card className="p-2 shadow-lg border-primary/10">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-muted-foreground ml-3" />
                <Input
                  placeholder="Pesquisar livros, monografias, documentos..."
                  className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button className="bg-hero-gradient hover:opacity-90 transition-opacity">
                  Pesquisar
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={staggerChildren}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-muted-foreground text-sm">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};