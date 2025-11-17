import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Paciente } from "@/tipos/paciente";
import { useRegistrarObito } from "@/hooks/usePacientes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModalObitoProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalObito({ aberto, aoFechar, paciente }: ModalObitoProps) {
  const [dataObito, setDataObito] = useState<Date | undefined>(undefined);
  const { mutate: registrarObito, isPending } = useRegistrarObito();

  const handleSubmit = () => {
    if (!paciente || !dataObito) return;
    
    registrarObito(
      { pacienteId: paciente._id, dataObito },
      {
        onSuccess: () => {
          setDataObito(undefined);
          aoFechar();
        },
      }
    );
  };

  const handleFechar = () => {
    setDataObito(undefined);
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Óbito</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data do Óbito *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataObito && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataObito ? format(dataObito, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataObito}
                  onSelect={setDataObito}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!dataObito || isPending}
          >
            {isPending ? "Registrando..." : "Registrar Óbito"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
