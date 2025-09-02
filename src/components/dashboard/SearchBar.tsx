import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [institution, setInstitution] = useState("");

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gradient-to-r from-card to-card/50 rounded-xl border-0 shadow-lg hover-lift">
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Pesquisar livros, monografias, grupos ou documentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all rounded-lg text-base"
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-[180px] h-12 bg-background/50 border-border/50 hover:bg-background transition-all">
            <SelectValue placeholder="Tipo de busca" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-sm">
            <SelectItem value="all">📚 Todos</SelectItem>
            <SelectItem value="books">📖 Livros</SelectItem>
            <SelectItem value="monographs">📄 Monografias</SelectItem>
            <SelectItem value="groups">👥 Grupos</SelectItem>
            <SelectItem value="documents">🗂️ Documentos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={institution} onValueChange={setInstitution}>
          <SelectTrigger className="w-[180px] h-12 bg-background/50 border-border/50 hover:bg-background transition-all">
            <SelectValue placeholder="Instituição" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-sm">
            <SelectItem value="all">🏛️ Todas</SelectItem>
            <SelectItem value="usp">🎓 USP</SelectItem>
            <SelectItem value="unicamp">🎓 UNICAMP</SelectItem>
            <SelectItem value="ufrj">🎓 UFRJ</SelectItem>
            <SelectItem value="ufmg">🎓 UFMG</SelectItem>
            <SelectItem value="puc">🎓 PUC</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="h-12 w-12 hover-glow">
          <Filter className="h-5 w-5" />
        </Button>

        <Button size="lg" className="px-8 hover-glow">
          <Search className="h-4 w-4 mr-2" />
          Pesquisar
        </Button>
      </div>
    </div>
  );
}