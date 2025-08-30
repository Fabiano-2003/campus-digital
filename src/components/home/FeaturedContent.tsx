import { motion } from "framer-motion";
import { Calendar, Download, Eye, Users, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const FeaturedContent = () => {
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

  const recentBooks = [
    {
      title: "Economia Angolana Pós-Colonial",
      author: "Dr. Maria Silva",
      institution: "Universidade Agostinho Neto",
      downloads: 1234,
      views: 5678,
      date: "2024-01-15"
    },
    {
      title: "História das Línguas Nacionais",
      author: "Prof. João Carvalho",
      institution: "ISCED Luanda",
      downloads: 987,
      views: 3456,
      date: "2024-01-10"
    },
    {
      title: "Desenvolvimento Sustentável em África",
      author: "Dra. Ana Fernandes",
      institution: "Universidade Católica de Angola",
      downloads: 765,
      views: 2345,
      date: "2024-01-08"
    }
  ];

  const studyGroups = [
    {
      name: "Matemática Avançada",
      members: 45,
      level: "Universitário",
      active: true,
      topic: "Cálculo Diferencial"
    },
    {
      name: "História de Angola",
      members: 67,
      level: "Secundário",
      active: true,
      topic: "Período Colonial"
    },
    {
      name: "Programação Python",
      members: 89,
      level: "Técnico",
      active: false,
      topic: "Algoritmos Básicos"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Conteúdo em Destaque
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra os documentos mais recentes e grupos de estudo ativos na nossa plataforma
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Academic Works */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Últimas Publicações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentBooks.map((book, index) => (
                    <motion.div
                      key={book.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-card hover:bg-card-hover transition-colors"
                    >
                      <h4 className="font-semibold text-foreground mb-2">{book.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        por {book.author} • {book.institution}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{book.downloads}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{book.views}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(book.date).toLocaleDateString('pt-AO')}</span>
                          </span>
                        </div>
                        <Button variant="outline" size="sm">Ver</Button>
                      </div>
                    </motion.div>
                  ))}
                  <Button variant="ghost" className="w-full mt-4">
                    Ver Mais Publicações
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Study Groups */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-secondary" />
                    <span>Grupos de Estudo Ativos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studyGroups.map((group, index) => (
                    <motion.div
                      key={group.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-card hover:bg-card-hover transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Estudando: {group.topic}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {group.active && (
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                          )}
                          <Badge variant={group.active ? "default" : "secondary"} className="text-xs">
                            {group.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{group.members} membros</span>
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {group.level}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          {group.active ? "Entrar" : "Ver"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  <Button variant="ghost" className="w-full mt-4">
                    Explorar Todos os Grupos
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Statistics Section */}
          <motion.div variants={fadeInUp} className="mt-12">
            <Card className="bg-hero-gradient text-white">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold mb-2">2,847</div>
                    <div className="text-white/80">Documentos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">1,234</div>
                    <div className="text-white/80">Estudantes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">89</div>
                    <div className="text-white/80">Grupos Ativos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">45</div>
                    <div className="text-white/80">Instituições</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};