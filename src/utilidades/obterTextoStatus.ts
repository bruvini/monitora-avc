import { StatusMonitoramento } from "@/tipos/paciente";

/**
 * Retorna o texto de exibição para cada status de monitoramento
 */
export function obterTextoStatus(status: StatusMonitoramento): string {
  const textos: Record<StatusMonitoramento, string> = {
    aguarda_analise: "Aguarda Análise",
    aguarda_exames: "Aguarda Exames",
    aguarda_agendamento: "Aguarda Agendamento",
    aguarda_desfecho: "Aguarda Desfecho",
    sem_criterio_monitoramento: "Sem Critério",
    monitoramento_finalizado: "Finalizado",
  };
  
  return textos[status];
}

/**
 * Retorna a cor associada a cada status (classe Tailwind)
 */
export function obterCorStatus(status: StatusMonitoramento): string {
  const cores: Record<StatusMonitoramento, string> = {
    aguarda_analise: "bg-status-aguarda-analise text-status-aguarda-analise-fg",
    aguarda_exames: "bg-status-aguarda-exames text-status-aguarda-exames-fg",
    aguarda_agendamento: "bg-status-aguarda-agendamento text-status-aguarda-agendamento-fg",
    aguarda_desfecho: "bg-status-aguarda-desfecho text-status-aguarda-desfecho-fg",
    sem_criterio_monitoramento: "bg-status-sem-criterio text-status-sem-criterio-fg",
    monitoramento_finalizado: "bg-status-finalizado text-status-finalizado-fg",
  };
  
  return cores[status];
}

/**
 * Retorna o texto do botão de ação para cada status
 */
export function obterTextoAcao(status: StatusMonitoramento): string {
  const textos: Record<StatusMonitoramento, string> = {
    aguarda_analise: "Analisar",
    aguarda_exames: "Checar Exames",
    aguarda_agendamento: "Agendar",
    aguarda_desfecho: "Informar Desfecho",
    sem_criterio_monitoramento: "Detalhes",
    monitoramento_finalizado: "Histórico",
  };
  
  return textos[status];
}
