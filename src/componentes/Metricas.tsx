import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ClipboardX, 
  Stethoscope, 
  CalendarCheck, 
  Phone, 
  CheckCircle2 
} from "lucide-react";
import { Metricas as MetricasType } from "@/tipos/paciente";

interface MetricasProps {
  metricas: MetricasType;
}

export function Metricas({ metricas }: MetricasProps) {
  const cartoes = [
    {
      titulo: "Total de Pacientes",
      valor: metricas.totalPacientes,
      icone: Users,
      cor: "text-primary",
    },
    {
      titulo: "Sem Critérios",
      valor: `${metricas.percentualSemCriterios.toFixed(1)}%`,
      icone: ClipboardX,
      cor: "text-status-sem-criterio",
    },
    {
      titulo: "Exames Realizados",
      valor: metricas.quantidadeExamesRealizados,
      icone: Stethoscope,
      cor: "text-status-aguarda-exames",
    },
    {
      titulo: "Consultas Confirmadas",
      valor: metricas.quantidadeConsultasConfirmadas,
      icone: CalendarCheck,
      cor: "text-status-aguarda-agendamento",
    },
    {
      titulo: "Contatos Realizados",
      valor: metricas.contagemContatosRealizados,
      icone: Phone,
      cor: "text-accent",
    },
    {
      titulo: "Taxa de Conclusão",
      valor: `${metricas.taxaConclusao.toFixed(1)}%`,
      icone: CheckCircle2,
      cor: "text-status-finalizado",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cartoes.map((cartao) => {
        const Icone = cartao.icone;
        return (
          <Card key={cartao.titulo} className="shadow-card transition-base hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {cartao.titulo}
              </CardTitle>
              <Icone className={`h-5 w-5 ${cartao.cor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {cartao.valor}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
