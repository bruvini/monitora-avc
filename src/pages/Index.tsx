import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Metricas } from "@/componentes/Metricas";
import { Filtros } from "@/componentes/Filtros";
import { PainelKanban } from "@/componentes/PainelKanban";
import { ModalRegistrarContato } from "@/componentes/modais/ModalRegistrarContato";
import { ModalCadastrarPaciente } from "@/componentes/modais/ModalCadastrarPaciente";
import { ModalAnalisarPaciente } from "@/componentes/modais/ModalAnalisarPaciente";
import { Paciente } from "@/tipos/paciente";
import { usePacientes, useMetricas } from "@/hooks/usePacientes";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Index = () => {
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [atendimentoFiltro, setAtendimentoFiltro] = useState("");
  const [modalContatoAberto, setModalContatoAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalAnaliseAberto, setModalAnaliseAberto] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const { data: pacientes = [], isLoading: carregandoPacientes } = usePacientes({
    nome: nomeFiltro,
    numeroAtendimento: atendimentoFiltro,
  });

  const { data: metricas, isLoading: carregandoMetricas } = useMetricas();

  const colunas = [
    {
      status: "aguarda_analise" as const,
      pacientes: pacientes.filter((p: Paciente) => p._extension_Monitoramento.statusMonitoramento === "aguarda_analise")
    },
    {
      status: "aguarda_exames" as const,
      pacientes: pacientes.filter((p: Paciente) => p._extension_Monitoramento.statusMonitoramento === "aguarda_exames")
    },
    {
      status: "aguarda_agendamento" as const,
      pacientes: pacientes.filter((p: Paciente) => p._extension_Monitoramento.statusMonitoramento === "aguarda_agendamento")
    },
    {
      status: "aguarda_desfecho" as const,
      pacientes: pacientes.filter((p: Paciente) => p._extension_Monitoramento.statusMonitoramento === "aguarda_desfecho")
    }
  ];

  const handleLimparFiltros = () => {
    setNomeFiltro("");
    setAtendimentoFiltro("");
    toast.info("Filtros limpos");
  };

  const handleCadastrarPaciente = () => {
    setModalCadastroAberto(true);
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
    if (status === "aguarda_analise") {
      setPacienteSelecionado(paciente);
      setModalAnaliseAberto(true);
    } else {
      toast.info(`Modal de ${status} será implementado em breve`);
    }
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

      <ModalCadastrarPaciente
        aberto={modalCadastroAberto}
        aoFechar={() => setModalCadastroAberto(false)}
      />

      <ModalAnalisarPaciente
        aberto={modalAnaliseAberto}
        aoFechar={() => setModalAnaliseAberto(false)}
        paciente={pacienteSelecionado}
      />
    </div>
  );
};

export default Index;
