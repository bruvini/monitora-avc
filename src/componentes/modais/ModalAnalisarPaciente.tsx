import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAnalisarPaciente } from "@/hooks/usePacientes";
import { aplicarMascaraTelefone, removerMascaraTelefone } from "@/utilidades/formatadores";
import { Paciente } from "@/tipos/paciente";
import { toast } from "sonner";

const esquemaAnalise = z.object({
  cumpreCriterios: z.enum(["sim", "nao"], { required_error: "Selecione se cumpre critérios" }),
  // Campos obrigatórios se cumpre critérios
  numeroAtendimento: z.string().optional(),
  dataInternacao: z.string().optional(),
  cidadeResidencia: z.string().optional(),
  telefonePrincipal: z.string().optional(),
  telefoneAdicional1: z.string().optional(),
  telefoneAdicional2: z.string().optional(),
  // Campo obrigatório se não cumpre critérios
  motivoNaoCumpre: z.string().optional(),
}).refine((data) => {
  if (data.cumpreCriterios === "sim") {
    return !!(
      data.numeroAtendimento &&
      data.dataInternacao &&
      data.cidadeResidencia &&
      data.telefonePrincipal
    );
  }
  return true;
}, {
  message: "Preencha todos os campos obrigatórios",
  path: ["numeroAtendimento"],
}).refine((data) => {
  if (data.cumpreCriterios === "nao") {
    return !!(data.motivoNaoCumpre && data.motivoNaoCumpre.trim().length > 0);
  }
  return true;
}, {
  message: "Informe o motivo pelo qual não cumpre critérios",
  path: ["motivoNaoCumpre"],
}).refine((data) => {
  // Validar telefone principal tem no mínimo 10 dígitos (sem máscara)
  if (data.telefonePrincipal) {
    const digitos = removerMascaraTelefone(data.telefonePrincipal);
    return digitos.length >= 10;
  }
  return true;
}, {
  message: "Telefone deve ter no mínimo 10 dígitos",
  path: ["telefonePrincipal"],
});

type FormularioAnalise = z.infer<typeof esquemaAnalise>;

interface ModalAnalisarPacienteProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalAnalisarPaciente({
  aberto,
  aoFechar,
  paciente,
}: ModalAnalisarPacienteProps) {
  const { mutate: analisarPaciente, isPending } = useAnalisarPaciente();

  const form = useForm<FormularioAnalise>({
    resolver: zodResolver(esquemaAnalise),
    defaultValues: {
      cumpreCriterios: "sim",
    },
  });

  const cumpreCriterios = form.watch("cumpreCriterios");

  const handleTelefoneChange = (fieldName: keyof FormularioAnalise, value: string) => {
    const mascarado = aplicarMascaraTelefone(value);
    form.setValue(fieldName, mascarado);
  };

  const onSubmit = (dados: FormularioAnalise) => {
    if (!paciente) return;

    const telefones = [];
    if (dados.telefonePrincipal) {
      telefones.push({
        sistema: "phone",
        valor: removerMascaraTelefone(dados.telefonePrincipal),
        uso: "mobile",
      });
    }
    if (dados.telefoneAdicional1) {
      telefones.push({
        sistema: "phone",
        valor: removerMascaraTelefone(dados.telefoneAdicional1),
        uso: "home",
      });
    }
    if (dados.telefoneAdicional2) {
      telefones.push({
        sistema: "phone",
        valor: removerMascaraTelefone(dados.telefoneAdicional2),
        uso: "work",
      });
    }

    const payload = {
      cumpreCriterios: dados.cumpreCriterios === "sim",
      ...(dados.cumpreCriterios === "sim"
        ? {
            numeroAtendimento: dados.numeroAtendimento,
            dataInternacao: dados.dataInternacao,
            cidade: dados.cidadeResidencia,
            telefones,
          }
        : {
            motivoNaoCumpre: dados.motivoNaoCumpre,
          }),
    };

    analisarPaciente(
      { pacienteId: paciente._id as string, dados: payload },
      {
        onSuccess: () => {
          form.reset();
          aoFechar();
        },
        onError: (error: any) => {
          console.error("Erro ao analisar:", error);
          const mensagemErro =
            error?.response?.data?.error || error?.message || "Erro ao analisar paciente";
          toast.error(mensagemErro);
        },
      }
    );
  };

  const nomePaciente = paciente?.name[0]?.text || "Paciente";

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Analisar Paciente: {nomePaciente}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Decisão de Critérios */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                O paciente cumpre critérios de monitoramento? *
              </Label>
              <RadioGroup
                value={cumpreCriterios}
                onValueChange={(value) => form.setValue("cumpreCriterios", value as "sim" | "nao")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="criterios-sim" />
                  <Label htmlFor="criterios-sim" className="font-normal">
                    Sim, cumpre critérios
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="criterios-nao" />
                  <Label htmlFor="criterios-nao" className="font-normal">
                    Não cumpre critérios
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Campos se CUMPRE critérios */}
            {cumpreCriterios === "sim" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Dados para Monitoramento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroAtendimento">Nº Atendimento *</Label>
                    <Input
                      id="numeroAtendimento"
                      {...form.register("numeroAtendimento")}
                      placeholder="Ex: 20240001"
                    />
                    {form.formState.errors.numeroAtendimento && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.numeroAtendimento.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dataInternacao">Data de Internação *</Label>
                    <Input
                      id="dataInternacao"
                      type="date"
                      {...form.register("dataInternacao")}
                    />
                    {form.formState.errors.dataInternacao && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.dataInternacao.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cidadeResidencia">Cidade de Residência *</Label>
                    <Input
                      id="cidadeResidencia"
                      {...form.register("cidadeResidencia")}
                      placeholder="Ex: Florianópolis"
                    />
                    {form.formState.errors.cidadeResidencia && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.cidadeResidencia.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Telefones */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-foreground">Telefones de Contato</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="telefonePrincipal">Telefone Principal *</Label>
                      <Input
                        id="telefonePrincipal"
                        value={form.watch("telefonePrincipal") || ""}
                        onChange={(e) => handleTelefoneChange("telefonePrincipal", e.target.value)}
                        placeholder="(48) 99999-9999"
                        maxLength={15}
                      />
                      {form.formState.errors.telefonePrincipal && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.telefonePrincipal.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="telefoneAdicional1">Telefone Adicional 1</Label>
                      <Input
                        id="telefoneAdicional1"
                        value={form.watch("telefoneAdicional1") || ""}
                        onChange={(e) => handleTelefoneChange("telefoneAdicional1", e.target.value)}
                        placeholder="(48) 99999-9999"
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefoneAdicional2">Telefone Adicional 2</Label>
                      <Input
                        id="telefoneAdicional2"
                        value={form.watch("telefoneAdicional2") || ""}
                        onChange={(e) => handleTelefoneChange("telefoneAdicional2", e.target.value)}
                        placeholder="(48) 99999-9999"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campo se NÃO CUMPRE critérios */}
            {cumpreCriterios === "nao" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Motivo</h3>
                <div>
                  <Label htmlFor="motivoNaoCumpre">
                    Por que o paciente não cumpre critérios? *
                  </Label>
                  <Textarea
                    id="motivoNaoCumpre"
                    {...form.register("motivoNaoCumpre")}
                    placeholder="Descreva o motivo..."
                    rows={4}
                  />
                  {form.formState.errors.motivoNaoCumpre && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.motivoNaoCumpre.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Salvando..." : "Confirmar Análise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
