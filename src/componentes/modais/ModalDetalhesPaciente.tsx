import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Paciente } from "@/tipos/paciente";
import { useLogs } from "@/hooks/usePacientes";
import { calcularIdade } from "@/utilidades/calculoIdade";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface ModalDetalhesPacienteProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalDetalhesPaciente({ aberto, aoFechar, paciente }: ModalDetalhesPacienteProps) {
  const { data: logs = [], isLoading } = useLogs(paciente?._id || null);
  const [anticoagulante, setAnticoagulante] = useState(
    (paciente as any)?.anticoagulante || ""
  );
  const [salvando, setSalvando] = useState(false);

  const handleSalvarAnticoagulante = async () => {
    if (!paciente) return;
    
    setSalvando(true);
    try {
      const pacienteRef = doc(db, "monitoravc", paciente._id);
      await updateDoc(pacienteRef, {
        anticoagulante
      });
      toast.success("Anticoagulante atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar anticoagulante");
    } finally {
      setSalvando(false);
    }
  };

  if (!paciente) return null;

  const nome = paciente.name[0]?.text || "Nome não informado";
  const idade = calcularIdade(paciente.birthDate);
  const numeroAtendimento = paciente.identifier?.[0]?.value || "Não informado";
  const cidade = paciente.address?.[0]?.city || "Não informado";
  const telefones = paciente.telecom?.map(t => t.valor).join(", ") || "Não informado";

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Paciente</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Informações do Paciente */}
            <section>
              <h3 className="font-semibold mb-3">Informações do Paciente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Idade</Label>
                  <p className="font-medium">{idade} anos</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nº Atendimento</Label>
                  <p className="font-medium">{numeroAtendimento}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cidade</Label>
                  <p className="font-medium">{cidade}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Telefones</Label>
                  <p className="font-medium">{telefones}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Campo Anticoagulante */}
            <section>
              <h3 className="font-semibold mb-3">Medicação</h3>
              <div className="space-y-2">
                <Label htmlFor="anticoagulante">Anticoagulante</Label>
                <div className="flex gap-2">
                  <Input
                    id="anticoagulante"
                    placeholder="Ex: Varfarina, Rivaroxabana"
                    value={anticoagulante}
                    onChange={(e) => setAnticoagulante(e.target.value)}
                  />
                  <Button
                    onClick={handleSalvarAnticoagulante}
                    disabled={salvando}
                    size="sm"
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </section>

            <Separator />

            {/* Log de Auditoria */}
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Log de Auditoria
              </h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando histórico...</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log: any) => (
                    <div key={log.id} className="border-l-2 border-primary pl-3 py-1">
                      <p className="text-sm">{log.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
