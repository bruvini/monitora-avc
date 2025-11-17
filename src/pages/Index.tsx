import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Metricas } from "@/componentes/Metricas";
import { Filtros } from "@/componentes/Filtros";
import { PainelKanban } from "@/componentes/PainelKanban";
import { ModalRegistrarContato } from "@/componentes/modais/ModalRegistrarContato";
import { Paciente } from "@/tipos/paciente";
import { usePacientes, useMetricas } from "@/hooks/usePacientes";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Index = () => {
  // Estados para filtros
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [atendimentoFiltro, setAtendimentoFiltro] = useState("");

  // Dados mockados para demonstração
  const metricasMockadas: MetricasType = {
    totalPacientes: 42,
    percentualSemCriterios: 12.5,
    quantidadeExamesRealizados: 28,
    quantidadeConsultasConfirmadas: 15,
    contagemContatosRealizados: 89,
    taxaConclusao: 35.7,
  };

  // Pacientes mockados para cada coluna
  const pacientesMockados: Paciente[] = [
    {
      _id: "1",
      resourceType: "Patient",
      identifier: [{ system: "urn:hmsj:atendimento", value: "20240001" }],
      name: [{ use: "official", text: "MARIA SILVA SANTOS" }],
      gender: "female",
      birthDate: "1965-03-15",
      telecom: [
        { sistema: "phone", valor: "(21) 98765-4321", uso: "mobile" }
      ],
      address: [{ city: "Rio de Janeiro" }],
      _extension_Monitoramento: {
        dataCadastroSistema: new Date("2024-01-10"),
        statusMonitoramento: "aguarda_analise",
        historicoStatus: [
          { status: "aguarda_analise", timestamp: new Date("2024-01-10") }
        ]
      }
    },
    {
      _id: "2",
      resourceType: "Patient",
      identifier: [{ system: "urn:hmsj:atendimento", value: "20240002" }],
      name: [{ use: "official", text: "JOÃO PEREIRA OLIVEIRA" }],
      gender: "male",
      birthDate: "1958-07-22",
      telecom: [
        { sistema: "phone", valor: "(21) 97654-3210", uso: "mobile" }
      ],
      address: [{ city: "Rio de Janeiro" }],
      _extension_Monitoramento: {
        dataCadastroSistema: new Date("2024-01-08"),
        statusMonitoramento: "aguarda_exames",
        historicoStatus: [
          { status: "aguarda_analise", timestamp: new Date("2024-01-08") },
          { status: "aguarda_exames", timestamp: new Date("2024-01-09") }
        ]
      }
    },
    {
      _id: "3",
      resourceType: "Patient",
      identifier: [{ system: "urn:hmsj:atendimento", value: "20240003" }],
      name: [{ use: "official", text: "ANA COSTA FERREIRA" }],
      gender: "female",
      birthDate: "1972-11-30",
      telecom: [
        { sistema: "phone", valor: "(21) 96543-2109", uso: "mobile" }
      ],
      address: [{ city: "Rio de Janeiro" }],
      _extension_Monitoramento: {
        dataCadastroSistema: new Date("2024-01-05"),
        statusMonitoramento: "aguarda_agendamento",
        historicoStatus: [
          { status: "aguarda_analise", timestamp: new Date("2024-01-05") },
          { status: "aguarda_exames", timestamp: new Date("2024-01-06") },
          { status: "aguarda_agendamento", timestamp: new Date("2024-01-12") }
        ]
      }
    },
    {
      _id: "4",
      resourceType: "Patient",
      identifier: [{ system: "urn:hmsj:atendimento", value: "20240004" }],
      name: [{ use: "official", text: "CARLOS MENDES RODRIGUES" }],
      gender: "male",
      birthDate: "1960-05-18",
      telecom: [
        { sistema: "phone", valor: "(21) 95432-1098", uso: "mobile" }
      ],
      address: [{ city: "Rio de Janeiro" }],
      _extension_Monitoramento: {
        dataCadastroSistema: new Date("2024-01-03"),
        statusMonitoramento: "aguarda_desfecho",
        historicoStatus: [
          { status: "aguarda_analise", timestamp: new Date("2024-01-03") },
          { status: "aguarda_exames", timestamp: new Date("2024-01-04") },
          { status: "aguarda_agendamento", timestamp: new Date("2024-01-10") },
          { status: "aguarda_desfecho", timestamp: new Date("2024-01-14") }
        ]
      }
    }
  ];

  const colunas = [
    {
      status: "aguarda_analise" as const,
      pacientes: pacientesMockados.filter(p => p._extension_Monitoramento.statusMonitoramento === "aguarda_analise")
    },
    {
      status: "aguarda_exames" as const,
      pacientes: pacientesMockados.filter(p => p._extension_Monitoramento.statusMonitoramento === "aguarda_exames")
    },
    {
      status: "aguarda_agendamento" as const,
      pacientes: pacientesMockados.filter(p => p._extension_Monitoramento.statusMonitoramento === "aguarda_agendamento")
    },
    {
      status: "aguarda_desfecho" as const,
      pacientes: pacientesMockados.filter(p => p._extension_Monitoramento.statusMonitoramento === "aguarda_desfecho")
    }
  ];

  const handleLimparFiltros = () => {
    setNomeFiltro("");
    setAtendimentoFiltro("");
    toast.info("Filtros limpos");
  };

  const handleCadastrarPaciente = () => {
    toast.info("Modal de cadastro será implementado");
  };

  const handleRelatorioAgendamento = () => {
    toast.info("Relatório em desenvolvimento");
  };

  const handleContato = (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setModalContatoAberto(true);
  };

  const handleAcao = (paciente: Paciente) => {
    const status = paciente._extension_Monitoramento.statusMonitoramento;
    toast.info(`Modal de ${status} será implementado em breve`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                MonitorAVC - HMSJ
              </h1>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Sistema de Gerenciamento de Pacientes Pós-Alta
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCadastrarPaciente}
                className="bg-white text-primary hover:bg-white/90 transition-base shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Paciente
              </Button>
              
              <Button
                onClick={handleRelatorioAgendamento}
                variant="outline"
                disabled
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-base"
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Métricas */}
        <section aria-label="Métricas do sistema">
          {carregandoMetricas ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : metricas ? (
            <Metricas metricas={metricas} />
          ) : null}
        </section>

        {/* Filtros */}
        <section aria-label="Filtros de busca">
          <Filtros
            nomeFiltro={nomeFiltro}
            atendimentoFiltro={atendimentoFiltro}
            aoAlterarNome={setNomeFiltro}
            aoAlterarAtendimento={setAtendimentoFiltro}
            aoLimparFiltros={handleLimparFiltros}
          />
        </section>

        {/* Painel Kanban */}
        <section aria-label="Painel de acompanhamento de pacientes">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Painel de Acompanhamento
          </h2>
          {carregandoPacientes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : (
            <PainelKanban
              colunas={colunas}
              aoClicarContato={handleContato}
              aoClicarAcao={handleAcao}
            />
          )}
        </section>
      </main>

      <ModalRegistrarContato
        aberto={modalContatoAberto}
        aoFechar={() => setModalContatoAberto(false)}
        paciente={pacienteSelecionado}
      />
    </div>
  );
};

export default Index;
