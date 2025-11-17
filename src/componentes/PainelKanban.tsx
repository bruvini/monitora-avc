import { ScrollArea } from "@/components/ui/scroll-area";
import { CardPaciente } from "./CardPaciente";
import { Paciente, StatusMonitoramento } from "@/tipos/paciente";
import { obterTextoStatus, obterCorStatus } from "@/utilidades/obterTextoStatus";

interface ColunaPacientes {
  status: StatusMonitoramento;
  pacientes: Paciente[];
}

interface PainelKanbanProps {
  colunas: ColunaPacientes[];
  aoClicarContato: (paciente: Paciente) => void;
  aoClicarAcao: (paciente: Paciente) => void;
  aoClicarNome?: (paciente: Paciente) => void;
}

export function PainelKanban({ 
  colunas, 
  aoClicarContato, 
  aoClicarAcao,
  aoClicarNome
}: PainelKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {colunas.map((coluna) => (
        <div 
          key={coluna.status} 
          className="bg-card rounded-lg shadow-card overflow-hidden"
        >
          {/* Header da Coluna */}
          <div className={`${obterCorStatus(coluna.status)} px-4 py-3`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {obterTextoStatus(coluna.status)}
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
                {coluna.pacientes.length}
              </span>
            </div>
          </div>
          
          {/* Lista de Pacientes */}
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="p-4 space-y-3">
              {coluna.pacientes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum paciente neste status
                </p>
              ) : (
                coluna.pacientes.map((paciente) => (
                  <CardPaciente
                    key={paciente._id || paciente.identifier[0].value}
                    paciente={paciente}
                    aoClicarContato={() => aoClicarContato(paciente)}
                    aoClicarAcao={() => aoClicarAcao(paciente)}
                    aoClicarNome={() => aoClicarNome?.(paciente)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
