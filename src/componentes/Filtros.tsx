import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Search } from "lucide-react";

interface FiltrosProps {
  nomeFiltro: string;
  atendimentoFiltro: string;
  aoAlterarNome: (valor: string) => void;
  aoAlterarAtendimento: (valor: string) => void;
  aoLimparFiltros: () => void;
}

export function Filtros({
  nomeFiltro,
  atendimentoFiltro,
  aoAlterarNome,
  aoAlterarAtendimento,
  aoLimparFiltros,
}: FiltrosProps) {
  const temFiltrosAtivos = nomeFiltro || atendimentoFiltro;

  return (
    <div className="bg-card rounded-lg p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Filtros</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filtro-nome" className="text-sm font-medium">
            Nome do Paciente
          </Label>
          <Input
            id="filtro-nome"
            type="text"
            placeholder="Digite o nome..."
            value={nomeFiltro}
            onChange={(e) => aoAlterarNome(e.target.value)}
            className="transition-base"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="filtro-atendimento" className="text-sm font-medium">
            Número de Atendimento
          </Label>
          <Input
            id="filtro-atendimento"
            type="text"
            placeholder="Digite o atendimento..."
            value={atendimentoFiltro}
            onChange={(e) => aoAlterarAtendimento(e.target.value)}
            className="transition-base"
          />
        </div>
        
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={aoLimparFiltros}
            disabled={!temFiltrosAtivos}
            className="w-full transition-base"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
