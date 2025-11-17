import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar } from "lucide-react";
import { Paciente, Agendamento } from "@/tipos/paciente";
import { calcularIdade, calcularDiasMonitoramento } from "@/utilidades/calculoIdade";
import { obterTextoAcao, obterCorStatus } from "@/utilidades/obterTextoStatus";
import { formatarData } from "@/utilidades/formatadores";

interface CardPacienteProps {
  paciente: Paciente;
  agendamento?: Agendamento;
  aoClicarContato: () => void;
  aoClicarAcao: () => void;
  aoClicarNome?: () => void;
}

export function CardPaciente({ 
  paciente, 
  agendamento,
  aoClicarContato, 
  aoClicarAcao,
  aoClicarNome
}: CardPacienteProps) {
  const nome = paciente.name[0]?.text || "Nome não informado";
  const idade = calcularIdade(paciente.birthDate);
  const status = paciente._extension_Monitoramento.statusMonitoramento;
  const diasMonitoramento = calcularDiasMonitoramento(
    paciente._extension_Monitoramento.dataCadastroSistema
  );
  const mostrarDias = status !== "monitoramento_finalizado";
  
  const dataConsulta = agendamento?.start 
    ? formatarData(agendamento.start) 
    : null;
  
  const mostrarConsulta = 
    status === "aguarda_agendamento" && 
    agendamento?.status === "proposed";

  const temPreAgendamento = status === "aguarda_agendamento" && agendamento?.status === "proposed";
  const textoAcao = temPreAgendamento ? "Revisar agenda" : obterTextoAcao(status);

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-smooth">
      <CardHeader className="pb-3">
        <Button
          variant="link"
          className="text-lg font-semibold text-card-foreground leading-tight p-0 h-auto hover:text-primary"
          onClick={aoClicarNome}
        >
          {nome}
        </Button>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-2">
        <p className="text-sm text-muted-foreground">
          Idade: <span className="font-medium text-foreground">{idade} anos</span>
        </p>
        
        {mostrarDias && (
          <p className="text-sm text-muted-foreground">
            Dias de Monitoramento: <span className="font-medium text-foreground">{diasMonitoramento}</span>
          </p>
        )}
        
        {mostrarConsulta && dataConsulta && (
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1.5 w-fit"
          >
            <Calendar className="h-3.5 w-3.5" />
            Consulta: {dataConsulta}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={aoClicarContato}
          className="flex-1 transition-base"
          aria-label={`Registrar contato com ${nome}`}
        >
          <Phone className="h-4 w-4 mr-1.5" />
          Contato
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={aoClicarAcao}
          className="flex-1 transition-base"
          aria-label={`${textoAcao} paciente ${nome}`}
        >
          {textoAcao}
        </Button>
      </CardFooter>
    </Card>
  );
}
