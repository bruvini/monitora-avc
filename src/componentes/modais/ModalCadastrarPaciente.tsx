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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCriarPaciente } from "@/hooks/usePacientes";
import { aplicarMascaraTelefone } from "@/utilidades/formatadores";

const esquemaCadastro = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  genero: z.enum(["female", "male"], { required_error: "Selecione o sexo" }),
  numeroAtendimento: z.string().min(1, "Número de atendimento é obrigatório"),
  cidade: z.string().optional(),
  telefonePrincipal: z.string().min(14, "Telefone inválido"),
  telefoneAdicional1: z.string().optional(),
  telefoneAdicional2: z.string().optional(),
  statusInternacao: z.enum(["internado", "liberado"]),
  setor: z.string().optional(),
  leito: z.string().optional(),
  dataPrevistaAlta: z.string().optional(),
  dataInternacao: z.string().optional(),
  dataAlta: z.string().optional(),
  exames: z.array(z.string()).min(1, "Selecione pelo menos um exame"),
  examesLaboratoriais: z.string().optional(),
  outrosExames: z.string().optional(),
});

type FormularioCadastro = z.infer<typeof esquemaCadastro>;

interface ModalCadastrarPacienteProps {
  aberto: boolean;
  aoFechar: () => void;
}

const tiposExame = [
  { value: "RNM", label: "Ressonância Magnética Nuclear (RNM)" },
  { value: "HOLTER", label: "Holter 24h" },
  { value: "ECO", label: "Ecocardiograma" },
  { value: "DTC", label: "Doppler Transcraniano (DTC)" },
  { value: "DOPPLER_CAROTIDAS", label: "Doppler de Carótidas" },
  { value: "ECG", label: "Eletrocardiograma (ECG)" },
  { value: "ECO_TRANS", label: "Ecocardiograma Transesofágico" },
  { value: "LABS", label: "Exames Laboratoriais" },
  { value: "OUTROS", label: "Outros" },
];

export function ModalCadastrarPaciente({ aberto, aoFechar }: ModalCadastrarPacienteProps) {
  const [examesSelecionados, setExamesSelecionados] = useState<string[]>([]);

  const { mutate: criarPaciente, isPending } = useCriarPaciente();

  const form = useForm<FormularioCadastro>({
    resolver: zodResolver(esquemaCadastro),
    defaultValues: {
      genero: "female",
      statusInternacao: "liberado",
      exames: [],
    },
  });

  const statusInternacao = form.watch("statusInternacao");
  const examesIncluemLabs = examesSelecionados.includes("LABS");
  const examesIncluemOutros = examesSelecionados.includes("OUTROS");

  const handleTelefoneChange = (field: any, value: string) => {
    const mascarado = aplicarMascaraTelefone(value);
    field.onChange(mascarado);
  };

  const handleExameToggle = (exame: string, checked: boolean) => {
    const novosExames = checked
      ? [...examesSelecionados, exame]
      : examesSelecionados.filter((e) => e !== exame);
    
    setExamesSelecionados(novosExames);
    form.setValue("exames", novosExames);
  };

  const onSubmit = (dados: FormularioCadastro) => {
    // Processar "Outros" exames (split por vírgula)
    const examesProcessados = dados.exames.flatMap((exame) => {
      if (exame === "OUTROS" && dados.outrosExames) {
        return dados.outrosExames.split(",").map((e) => ({
          tipo: "OUTROS",
          detalhes: e.trim(),
        }));
      }
      if (exame === "LABS" && dados.examesLaboratoriais) {
        return [{ tipo: "LABS", detalhes: dados.examesLaboratoriais }];
      }
      return [{ tipo: exame, detalhes: "" }];
    });

    const telefones = [
      { sistema: "phone", valor: dados.telefonePrincipal, uso: "mobile" },
      ...(dados.telefoneAdicional1
        ? [{ sistema: "phone", valor: dados.telefoneAdicional1, uso: "home" }]
        : []),
      ...(dados.telefoneAdicional2
        ? [{ sistema: "phone", valor: dados.telefoneAdicional2, uso: "work" }]
        : []),
    ];

    const payload = {
      nome: dados.nome,
      dataNascimento: dados.dataNascimento,
      genero: dados.genero,
      numeroAtendimento: dados.numeroAtendimento,
      cidade: dados.cidade || "",
      telefones,
      statusInternacao: dados.statusInternacao === "internado" ? "in-progress" : "finished",
      dataInternacao: dados.dataInternacao || dados.dataAlta,
      dataAlta: dados.dataAlta,
      exames: examesProcessados,
    };

    criarPaciente(payload, {
      onSuccess: () => {
        form.reset();
        setExamesSelecionados([]);
        aoFechar();
      },
    });
  };

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Dados Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    {...form.register("nome")}
                    placeholder="Digite o nome completo"
                    className="uppercase"
                  />
                  {form.formState.errors.nome && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.nome.message}
                    </p>
                  )}
                </div>

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
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    {...form.register("dataNascimento")}
                  />
                  {form.formState.errors.dataNascimento && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.dataNascimento.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Sexo *</Label>
                  <RadioGroup
                    value={form.watch("genero")}
                    onValueChange={(value) => form.setValue("genero", value as "female" | "male")}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="feminino" />
                      <Label htmlFor="feminino" className="font-normal">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="masculino" />
                      <Label htmlFor="masculino" className="font-normal">Masculino</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade de Residência</Label>
                  <Input id="cidade" {...form.register("cidade")} placeholder="Ex: Rio de Janeiro" />
                </div>
              </div>
            </div>

            {/* Telefones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Telefones de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="telefonePrincipal">Telefone Principal *</Label>
                  <Input
                    id="telefonePrincipal"
                    {...form.register("telefonePrincipal")}
                    onChange={(e) =>
                      handleTelefoneChange(
                        form.register("telefonePrincipal"),
                        e.target.value
                      )
                    }
                    placeholder="(21) 98765-4321"
                    maxLength={15}
                  />
                  {form.formState.errors.telefonePrincipal && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.telefonePrincipal.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefoneAdicional1">Adicional 1</Label>
                  <Input
                    id="telefoneAdicional1"
                    {...form.register("telefoneAdicional1")}
                    onChange={(e) =>
                      handleTelefoneChange(
                        form.register("telefoneAdicional1"),
                        e.target.value
                      )
                    }
                    placeholder="(21) 98765-4321"
                    maxLength={15}
                  />
                </div>

                <div>
                  <Label htmlFor="telefoneAdicional2">Adicional 2</Label>
                  <Input
                    id="telefoneAdicional2"
                    {...form.register("telefoneAdicional2")}
                    onChange={(e) =>
                      handleTelefoneChange(
                        form.register("telefoneAdicional2"),
                        e.target.value
                      )
                    }
                    placeholder="(21) 98765-4321"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Status de Internação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Status de Internação</h3>
              
              <RadioGroup
                value={statusInternacao}
                onValueChange={(value) =>
                  form.setValue("statusInternacao", value as "internado" | "liberado")
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internado" id="internado" />
                  <Label htmlFor="internado" className="font-normal">Internado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="liberado" id="liberado" />
                  <Label htmlFor="liberado" className="font-normal">Liberado (Alta Hospitalar)</Label>
                </div>
              </RadioGroup>

              {statusInternacao === "internado" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="setor">Setor</Label>
                    <Input id="setor" {...form.register("setor")} />
                  </div>
                  <div>
                    <Label htmlFor="leito">Leito</Label>
                    <Input id="leito" {...form.register("leito")} />
                  </div>
                  <div>
                    <Label htmlFor="dataPrevistaAlta">Data Prevista Alta</Label>
                    <Input id="dataPrevistaAlta" type="date" {...form.register("dataPrevistaAlta")} />
                  </div>
                </div>
              )}

              {statusInternacao === "liberado" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="dataInternacao">Data de Internação</Label>
                    <Input id="dataInternacao" type="date" {...form.register("dataInternacao")} />
                  </div>
                  <div>
                    <Label htmlFor="dataAlta">Data da Alta *</Label>
                    <Input id="dataAlta" type="date" {...form.register("dataAlta")} />
                  </div>
                </div>
              )}
            </div>

            {/* Exames Pendentes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Exames Pendentes *</h3>
              
              <div className="space-y-3">
                {tiposExame.map((exame) => (
                  <div key={exame.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={exame.value}
                      checked={examesSelecionados.includes(exame.value)}
                      onCheckedChange={(checked) =>
                        handleExameToggle(exame.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={exame.value} className="font-normal cursor-pointer">
                      {exame.label}
                    </Label>
                  </div>
                ))}

                {examesIncluemLabs && (
                  <div className="ml-6">
                    <Label htmlFor="examesLaboratoriais">Quais exames laboratoriais?</Label>
                    <Input
                      id="examesLaboratoriais"
                      {...form.register("examesLaboratoriais")}
                      placeholder="Ex: Hemograma, Lipidograma"
                    />
                  </div>
                )}

                {examesIncluemOutros && (
                  <div className="ml-6">
                    <Label htmlFor="outrosExames">Especifique os outros exames (separados por vírgula)</Label>
                    <Input
                      id="outrosExames"
                      {...form.register("outrosExames")}
                      placeholder="Ex: USG, Tomografia"
                    />
                  </div>
                )}
              </div>

              {form.formState.errors.exames && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.exames.message}
                </p>
              )}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Cadastrando..." : "Cadastrar Paciente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
