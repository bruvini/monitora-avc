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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ModalGerenciarConsultaProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

type ModoModal = 'acoes' | 'alterar' | 'cancelar';

export function ModalGerenciarConsulta({ aberto, aoFechar, paciente }: ModalGerenciarConsultaProps) {
  const { data: agendamento, isLoading } = useAgendamento(paciente?._id || null);
  const mutacao = useGerenciarAgendamento();
  
  const [modoAtual, setModoAtual] = useState<ModoModal>('acoes');
  const [dataConsulta, setDataConsulta] = useState<Date | undefined>(undefined);
  const [motivoAlteracao, setMotivoAlteracao] = useState("");
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const handleFecharModal = () => {
    aoFechar();
    setModoAtual('acoes');
    setDataConsulta(undefined);
    setMotivoAlteracao("");
    setMotivoCancelamento("");
  };

  const handlePreAgendar = () => {
    if (!paciente || !dataConsulta) return;
    
    mutacao.mutate(
      {
        pacienteId: paciente._id,
        dados: { acao: "pre-agendar", dataConsulta }
      },
      {
        onSuccess: () => handleFecharModal(),
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
        onSuccess: () => handleFecharModal(),
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
        onSuccess: () => handleFecharModal(),
      }
    );
  };

  const handleAlterar = () => {
    if (!paciente || !dataConsulta || !agendamento || !motivoAlteracao) return;
    
    mutacao.mutate(
      {
        pacienteId: paciente._id,
        dados: { 
          acao: "cancelar", 
          agendamentoId: agendamento.id,
          motivo: `Alteração de data: ${motivoAlteracao}` 
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
              onSuccess: () => handleFecharModal(),
            }
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Dialog open={aberto} onOpenChange={handleFecharModal}>
        <DialogContent className="sm:max-w-[500px]">
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
    <Dialog open={aberto} onOpenChange={handleFecharModal}>
      <DialogContent className="sm:max-w-[500px]">
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
          ) : modoAtual === 'acoes' ? (
            <>
              <div className="space-y-2">
                <Label>Consulta pré-agendada para</Label>
                <p className="text-lg font-medium">
                  {format(new Date(agendamento.dataConsulta), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="default"
                  onClick={handleConfirmar}
                  disabled={mutacao.isPending}
                  className="w-full"
                >
                  Confirmar Consulta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModoAtual('alterar')}
                  disabled={mutacao.isPending}
                  className="w-full"
                >
                  Alterar Data
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setModoAtual('cancelar')}
                  disabled={mutacao.isPending}
                  className="w-full"
                >
                  Cancelar Consulta
                </Button>
              </div>
            </>
          ) : modoAtual === 'alterar' ? (
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
              
              <div className="space-y-2">
                <Label htmlFor="motivo-alteracao">Motivo da alteração *</Label>
                <Textarea
                  id="motivo-alteracao"
                  placeholder="Ex: Indisponibilidade do paciente"
                  value={motivoAlteracao}
                  onChange={(e) => setMotivoAlteracao(e.target.value)}
                  rows={3}
                />
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
                <Label htmlFor="motivo-cancelamento">Motivo do cancelamento *</Label>
                <Textarea
                  id="motivo-cancelamento"
                  placeholder="Ex: Paciente faltou ou indisponível"
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!temAgendamento ? (
            <>
              <Button variant="outline" onClick={handleFecharModal}>
                Cancelar
              </Button>
              <Button
                onClick={handlePreAgendar}
                disabled={!dataConsulta || mutacao.isPending}
              >
                {mutacao.isPending ? "Salvando..." : "Pré-agendar"}
              </Button>
            </>
          ) : modoAtual === 'acoes' ? (
            <Button variant="outline" onClick={handleFecharModal}>
              Fechar
            </Button>
          ) : modoAtual === 'alterar' ? (
            <>
              <Button variant="outline" onClick={() => setModoAtual('acoes')}>
                Voltar
              </Button>
              <Button
                onClick={handleAlterar}
                disabled={!dataConsulta || !motivoAlteracao || mutacao.isPending}
              >
                {mutacao.isPending ? "Salvando..." : "Salvar Alteração"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setModoAtual('acoes')}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelar}
                disabled={!motivoCancelamento || mutacao.isPending}
              >
                {mutacao.isPending ? "Cancelando..." : "Confirmar Cancelamento"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
