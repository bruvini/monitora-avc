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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Paciente, MeioContato, DesfechoContato } from "@/tipos/paciente";
import { useRegistrarContato } from "@/hooks/usePacientes";

interface ModalRegistrarContatoProps {
  aberto: boolean;
  aoFechar: () => void;
  paciente: Paciente | null;
}

export function ModalRegistrarContato({ aberto, aoFechar, paciente }: ModalRegistrarContatoProps) {
  const [meioContato, setMeioContato] = useState<MeioContato>("ligacao");
  const [desfecho, setDesfecho] = useState<DesfechoContato>("sucesso");
  const [resumo, setResumo] = useState("");

  const { mutate: registrarContato, isPending } = useRegistrarContato();

  const handleSubmit = () => {
    if (!paciente?._id) return;

    registrarContato(
      {
        pacienteId: paciente._id,
        dados: { meioContato, desfecho, resumo },
      },
      {
        onSuccess: () => {
          setMeioContato("ligacao");
          setDesfecho("sucesso");
          setResumo("");
          aoFechar();
        },
      }
    );
  };

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Contato</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="meio-contato">Meio de Contato</Label>
            <Select value={meioContato} onValueChange={(v) => setMeioContato(v as MeioContato)}>
              <SelectTrigger id="meio-contato">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="desfecho">Desfecho</Label>
            <Select value={desfecho} onValueChange={(v) => setDesfecho(v as DesfechoContato)}>
              <SelectTrigger id="desfecho">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sucesso">Sucesso</SelectItem>
                <SelectItem value="caixa_postal">Caixa Postal</SelectItem>
                <SelectItem value="nao_atende">Não Atende</SelectItem>
                <SelectItem value="nao_responde">Não Responde</SelectItem>
                <SelectItem value="recusou">Recusou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="resumo">Resumo do Contato (Opcional)</Label>
            <Textarea
              id="resumo"
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Digite um resumo do contato..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
