import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface BlocoCopiarTextoProps {
  texto: string;
}

export function BlocoCopiarTexto({ texto }: BlocoCopiarTextoProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      toast.success("Texto copiado para área de transferência");
      setTimeout(() => setCopiado(false), 2000);
    } catch (erro) {
      toast.error("Erro ao copiar texto");
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={texto}
        readOnly
        rows={8}
        className="resize-none font-mono text-sm bg-muted"
      />
      <Button
        onClick={handleCopiar}
        variant="outline"
        className="w-full"
        disabled={copiado}
      >
        {copiado ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Texto
          </>
        )}
      </Button>
    </div>
  );
}
