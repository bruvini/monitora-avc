import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Paciente } from "@/tipos/paciente";
import { useAgendamento, useGerenciarAgendamento } from "@/hooks/usePacientes";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ModalGerenciarConsultaProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalGerenciarConsulta({ aberto, aoFechar, paciente }: ModalGerenciarConsultaProps) {
  const { data: agendamento, isLoading } = useAgendamento(paciente?._id || null);
  const mutacao = useGerenciarAgendamento();
  
  const [dataConsulta, setDataConsulta] = useState<Date | undefined>(undefined);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);

  const handlePreAgendar = () => {
    if (!paciente || !dataConsulta) return;
    
    mutacao.mutate(
      {
        pacienteId: paciente._id,
        dados: { acao: "pre-agendar", dataConsulta }
      },
      {
        onSuccess: () => {
          aoFechar();
          setDataConsulta(undefined);
        },
      }
    );
  };

  const handleConfirmar = () => {
    if (!paciente || !agendamento) return;
    
    mutacao.mutate(
      {
        pacienteId: paciente._id,
        dados: { 
          acao: "confirmar", 
          agendamentoId: agendamento.id,
          dataConsulta: agendamento.dataConsulta 
        }
      },
      {
        onSuccess: () => aoFechar(),
      }
    );
  };

  const handleCancelar = () => {
    if (!paciente || !agendamento || !motivoCancelamento) return;
    
    mutacao.mutate(
      {
        pacienteId: paciente._id,
        dados: { 
          acao: "cancelar", 
          agendamentoId: agendamento.id,
          motivo: motivoCancelamento 
        }
      },
      {
        onSuccess: () => {
          aoFechar();
          setMotivoCancelamento("");
        },
      }
    );
  };

  const handleAlterar = () => {
    if (!paciente || !dataConsulta || !agendamento) return;
    
    // Cancelar o agendamento atual e criar um novo
    mutacao.mutate(
      {
        pacienteId: paciente._id,
        dados: { 
          acao: "cancelar", 
          agendamentoId: agendamento.id,
          motivo: "Alteração de data" 
        }
      },
      {
        onSuccess: () => {
          mutacao.mutate(
            {
              pacienteId: paciente._id,
              dados: { acao: "pre-agendar", dataConsulta }
            },
            {
              onSuccess: () => {
                aoFechar();
                setDataConsulta(undefined);
                setModoEdicao(false);
              },
            }
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Dialog open={aberto} onOpenChange={aoFechar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Consulta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </DialogContent>
      </Dialog>
    );
  }

  const temAgendamento = agendamento && agendamento.status === "proposed";

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Consulta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!temAgendamento ? (
            <>
              <div className="space-y-2">
                <Label>Selecione a data da consulta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataConsulta && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataConsulta ? format(dataConsulta, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataConsulta}
                      onSelect={setDataConsulta}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : modoEdicao ? (
            <>
              <div className="space-y-2">
                <Label>Nova data da consulta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataConsulta && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataConsulta ? format(dataConsulta, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar nova data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataConsulta}
                      onSelect={setDataConsulta}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Consulta pré-agendada para</Label>
                <p className="text-lg font-medium">
                  {format(new Date(agendamento.dataConsulta), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motivo-cancelamento">Motivo do cancelamento (opcional)</Label>
                <Input
                  id="motivo-cancelamento"
                  placeholder="Ex: Paciente indisponível"
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!temAgendamento ? (
            <>
              <Button variant="outline" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button
                onClick={handlePreAgendar}
                disabled={!dataConsulta || mutacao.isPending}
              >
                {mutacao.isPending ? "Salvando..." : "Pré-agendar"}
              </Button>
            </>
          ) : modoEdicao ? (
            <>
              <Button variant="outline" onClick={() => setModoEdicao(false)}>
                Voltar
              </Button>
              <Button
                onClick={handleAlterar}
                disabled={!dataConsulta || mutacao.isPending}
              >
                {mutacao.isPending ? "Salvando..." : "Salvar Alteração"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setModoEdicao(true)}
                disabled={mutacao.isPending}
              >
                Alterar Data
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelar}
                disabled={mutacao.isPending}
              >
                {mutacao.isPending ? "Cancelando..." : "Cancelar Consulta"}
              </Button>
              <Button onClick={handleConfirmar} disabled={mutacao.isPending}>
                {mutacao.isPending ? "Confirmando..." : "Confirmar Consulta"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
