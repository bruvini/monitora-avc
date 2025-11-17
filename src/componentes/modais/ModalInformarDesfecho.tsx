import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { Paciente } from "@/tipos/paciente";
import { useAgendamento, useInformarDesfecho } from "@/hooks/usePacientes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const esquemaDesfecho = z.object({
  desfecho: z.enum(["finalizado", "novo-retorno", "novos-exames", "faltou"]),
  dataRetorno: z.date().optional(),
  exames: z.array(z.string()).optional(),
  reagendar: z.boolean().optional(),
});

type FormularioDesfecho = z.infer<typeof esquemaDesfecho>;

interface ModalInformarDesfechoProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

const examesDisponiveis = [
  "RNM",
  "Holter",
  "Ecocardiograma",
  "DTC",
  "Doppler de Carótidas",
  "ECG",
  "Ecocardiograma Transtorácico",
  "Exames Laboratoriais"
];

export function ModalInformarDesfecho({ aberto, aoFechar, paciente }: ModalInformarDesfechoProps) {
  const { data: agendamento } = useAgendamento(paciente?._id || null);
  const mutacao = useInformarDesfecho();
  
  const [desfechoSelecionado, setDesfechoSelecionado] = useState<string>("finalizado");
  const [dataRetorno, setDataRetorno] = useState<Date | undefined>(undefined);
  const [examesSelecionados, setExamesSelecionados] = useState<string[]>([]);
  const [outrosExames, setOutrosExames] = useState("");
  const [reagendar, setReagendar] = useState(false);

  const handleSubmit = () => {
    if (!paciente) return;
    
    const dados: any = { desfecho: desfechoSelecionado };
    
    if (desfechoSelecionado === "novo-retorno") {
      if (!dataRetorno) return;
      dados.dataRetorno = dataRetorno;
    } else if (desfechoSelecionado === "novos-exames") {
      const todosExames = [...examesSelecionados];
      if (outrosExames) {
        todosExames.push(...outrosExames.split(',').map(e => e.trim()));
      }
      dados.exames = todosExames;
    } else if (desfechoSelecionado === "faltou") {
      dados.reagendar = reagendar;
      dados.agendamentoId = agendamento?.id;
    }
    
    mutacao.mutate(
      { pacienteId: paciente._id, dados },
      {
        onSuccess: () => {
          aoFechar();
          // Resetar form
          setDesfechoSelecionado("finalizado");
          setDataRetorno(undefined);
          setExamesSelecionados([]);
          setOutrosExames("");
          setReagendar(false);
        },
      }
    );
  };

  const handleExameToggle = (exame: string) => {
    setExamesSelecionados(prev =>
      prev.includes(exame)
        ? prev.filter(e => e !== exame)
        : [...prev, exame]
    );
  };

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Informar Desfecho da Consulta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Qual foi o desfecho?</Label>
            <RadioGroup value={desfechoSelecionado} onValueChange={setDesfechoSelecionado}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="finalizado" id="finalizado" />
                <Label htmlFor="finalizado" className="font-normal cursor-pointer">
                  Finalizado (monitoramento concluído)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="novo-retorno" id="novo-retorno" />
                <Label htmlFor="novo-retorno" className="font-normal cursor-pointer">
                  Novo Retorno (agendar nova consulta)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="novos-exames" id="novos-exames" />
                <Label htmlFor="novos-exames" className="font-normal cursor-pointer">
                  Novos Exames (solicitar exames adicionais)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="faltou" id="faltou" />
                <Label htmlFor="faltou" className="font-normal cursor-pointer">
                  Paciente Faltou
                </Label>
              </div>
            </RadioGroup>
          </div>

          {desfechoSelecionado === "novo-retorno" && (
            <div className="space-y-2">
              <Label>Data do Retorno</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataRetorno && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataRetorno ? format(dataRetorno, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataRetorno}
                    onSelect={setDataRetorno}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {desfechoSelecionado === "novos-exames" && (
            <div className="space-y-3">
              <Label>Selecione os exames solicitados</Label>
              <div className="grid grid-cols-2 gap-3">
                {examesDisponiveis.map((exame) => (
                  <div key={exame} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exame-${exame}`}
                      checked={examesSelecionados.includes(exame)}
                      onCheckedChange={() => handleExameToggle(exame)}
                    />
                    <Label
                      htmlFor={`exame-${exame}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {exame}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="outros-exames">Outros (separados por vírgula)</Label>
                <Input
                  id="outros-exames"
                  placeholder="Ex: USG, Quimio"
                  value={outrosExames}
                  onChange={(e) => setOutrosExames(e.target.value)}
                />
              </div>
            </div>
          )}

          {desfechoSelecionado === "faltou" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reagendar"
                  checked={reagendar}
                  onCheckedChange={(checked) => setReagendar(checked as boolean)}
                />
                <Label htmlFor="reagendar" className="font-normal cursor-pointer">
                  Deseja reagendar a consulta?
                </Label>
              </div>
              {!reagendar && (
                <p className="text-sm text-muted-foreground">
                  O monitoramento será finalizado por falta à consulta.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              mutacao.isPending ||
              (desfechoSelecionado === "novo-retorno" && !dataRetorno) ||
              (desfechoSelecionado === "novos-exames" && examesSelecionados.length === 0 && !outrosExames)
            }
          >
            {mutacao.isPending ? "Salvando..." : "Confirmar Desfecho"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
