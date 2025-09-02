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
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar livros, monografias, grupos ou documentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de busca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="books">Livros</SelectItem>
            <SelectItem value="monographs">Monografias</SelectItem>
            <SelectItem value="groups">Grupos</SelectItem>
            <SelectItem value="documents">Documentos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={institution} onValueChange={setInstitution}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Instituição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="usp">USP</SelectItem>
            <SelectItem value="unicamp">UNICAMP</SelectItem>
            <SelectItem value="ufrj">UFRJ</SelectItem>
            <SelectItem value="ufmg">UFMG</SelectItem>
            <SelectItem value="puc">PUC</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <Button>
          Pesquisar
        </Button>
      </div>
    </div>
  );
}