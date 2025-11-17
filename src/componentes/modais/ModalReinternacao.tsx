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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { Paciente } from "@/tipos/paciente";
import { useRegistrarReinternacao } from "@/hooks/usePacientes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModalReinternacaoProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalReinternacao({ aberto, aoFechar, paciente }: ModalReinternacaoProps) {
  const [dataReinternacao, setDataReinternacao] = useState<Date | undefined>(undefined);
  const [motivo, setMotivo] = useState<string>("AVC");
  const { mutate: registrarReinternacao, isPending } = useRegistrarReinternacao();

  const handleSubmit = () => {
    if (!paciente || !dataReinternacao) return;
    
    registrarReinternacao(
      { pacienteId: paciente._id, dataReinternacao, motivo },
      {
        onSuccess: () => {
          setDataReinternacao(undefined);
          setMotivo("AVC");
          aoFechar();
        },
      }
    );
  };

  const handleFechar = () => {
    setDataReinternacao(undefined);
    setMotivo("AVC");
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Reinternação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data da Reinternação *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataReinternacao && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataReinternacao ? format(dataReinternacao, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataReinternacao}
                  onSelect={setDataReinternacao}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Motivo da Reinternação *</Label>
            <RadioGroup value={motivo} onValueChange={setMotivo}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AVC" id="motivo-avc" />
                <Label htmlFor="motivo-avc" className="font-normal">
                  AVC
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Outros" id="motivo-outros" />
                <Label htmlFor="motivo-outros" className="font-normal">
                  Outros
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!dataReinternacao || isPending}
          >
            {isPending ? "Registrando..." : "Registrar Reinternação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
