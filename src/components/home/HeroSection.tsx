import { motion } from "framer-motion";
import { Search, BookOpen, Users, FileEdit, Star, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const quickActions = [
    {
      icon: FileEdit,
      title: "Gerar Documento",
      description: "CV profissional em minutos",
      color: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-200/50",
      iconColor: "text-emerald-600",
      href: user ? "/dashboard" : "/auth",
      tag: "Popular"
    },
    {
      icon: Users,
      title: "Grupos de Estudo",
      description: "Conecte-se com estudantes",
      color: "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-200/50",
      iconColor: "text-blue-600",
      href: user ? "/groups" : "/auth",
      tag: "Comunidade"
    },
    {
      icon: BookOpen,
      title: "Biblioteca Digital",
      description: "Milhares de recursos",
      color: "bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-200/50",
      iconColor: "text-purple-600",
      href: user ? "/library" : "/auth",
      tag: "Gratuito"
    }
  ];

  const stats = [
    { number: "10K+", label: "Estudantes", icon: Users },
    { number: "5K+", label: "Documentos", icon: BookOpen },
    { number: "100+", label: "Instituições", icon: Star }
  ];

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent" />
        
        {/* Floating circles */}
        <motion.div 
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"
        />
        <motion.div 
          animate={floatingAnimation}
          style={{ animationDelay: "-2s" }}
          className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-lg"
        />
        <motion.div 
          animate={floatingAnimation}
          style={{ animationDelay: "-4s" }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-secondary/25 to-accent/25 rounded-full blur-xl"
        />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="max-w-6xl mx-auto"
        >
          {/* Hero Content */}
          <div className="text-center mb-16">
            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Plataforma #1 em Angola
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SaberAngola
              </span>
              <br />
              <span className="text-foreground/90 text-3xl md:text-4xl lg:text-5xl">
                O futuro da educação
              </span>
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Transforme sua jornada acadêmica com acesso a recursos ilimitados, 
              comunidade vibrante e ferramentas inteligentes para seu sucesso.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button 
                size="lg"
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
              >
                {user ? "Ir para Dashboard" : "Começar Agora"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate("/library")}
                className="px-8 py-6 text-lg font-semibold rounded-full border-2 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explorar Biblioteca
              </Button>
            </motion.div>

            {/* Enhanced Search Bar */}
            <motion.div
              variants={fadeInUp}
              className="max-w-2xl mx-auto mb-16"
            >
              <Card className="p-2 shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <Input
                    placeholder="Pesquisar monografias, livros, artigos, grupos..."
                    className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                  />
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                    onClick={() => navigate(user ? "/library" : "/auth")}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions - Modern Cards */}
          <motion.div
            variants={staggerChildren}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Card 
                  className={`cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 ${action.color} backdrop-blur-sm relative overflow-hidden`}
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-8 text-center relative z-10">
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/80">
                        {action.tag}
                      </Badge>
                    </div>
                    
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                    </div>
                    
                    <h3 className="font-bold text-xl mb-3 text-gray-800">{action.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
                    
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="h-5 w-5 mx-auto text-primary" />
                    </div>
                  </CardContent>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};