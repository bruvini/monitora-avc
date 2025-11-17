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
}

export function CardPaciente({ 
  paciente, 
  agendamento,
  aoClicarContato, 
  aoClicarAcao 
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

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-smooth">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-card-foreground leading-tight">
          {nome}
        </h3>
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
          aria-label={`${obterTextoAcao(status)} paciente ${nome}`}
        >
          {obterTextoAcao(status)}
        </Button>
      </CardFooter>
    </Card>
  );
}
