import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { Paciente } from "@/tipos/paciente";
import { useExames, useAtualizarExames } from "@/hooks/usePacientes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModalChecarExamesProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalChecarExames({ aberto, aoFechar, paciente }: ModalChecarExamesProps) {
  const { data: exames = [], isLoading } = useExames(paciente?._id || null);
  const mutacaoExame = useAtualizarExames();

  const handleChecarExame = (exameId: string, dataRealizacao: Date) => {
    if (!paciente) return;
    
    mutacaoExame.mutate(
      { pacienteId: paciente._id, exameId, dataRealizacao },
      {
        onSuccess: () => {
          // Modal permanece aberto para checar outros exames
        },
      }
    );
  };

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Checar Exames Pendentes</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando exames...</p>
          ) : exames.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum exame pendente.</p>
          ) : (
            <div className="space-y-4">
              {exames.map((exame: any) => (
                <ExameItem
                  key={exame.id}
                  exame={exame}
                  onCheck={handleChecarExame}
                  isLoading={mutacaoExame.isPending}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ExameItemProps {
  exame: any;
  onCheck: (exameId: string, dataRealizacao: Date) => void;
  isLoading: boolean;
}

function ExameItem({ exame, onCheck, isLoading }: ExameItemProps) {
  const [dataRealizacao, setDataRealizacao] = useState<Date | undefined>(undefined);

  if (exame.status === "realizado") {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="font-medium">{exame.nomeExame}</p>
          <p className="text-xs text-muted-foreground">
            Realizado em {new Date(exame.dataRealizacao).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className="flex-1">
        <p className="font-medium">{exame.nomeExame}</p>
        <p className="text-xs text-muted-foreground">Pendente</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !dataRealizacao && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataRealizacao ? format(dataRealizacao, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={dataRealizacao}
              onSelect={setDataRealizacao}
              disabled={(date) => date > new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        <Button
          size="sm"
          onClick={() => dataRealizacao && onCheck(exame.id, dataRealizacao)}
          disabled={!dataRealizacao || isLoading}
        >
          Checar
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
