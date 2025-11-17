import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";
import { Paciente } from "@/tipos/paciente";
import { useExames, useAtualizarExames } from "@/hooks/usePacientes";

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
      
      <Button
        size="sm"
        onClick={() => onCheck(exame.id, new Date())}
        disabled={isLoading}
      >
        Checar
      </Button>
    </div>
  );
}
