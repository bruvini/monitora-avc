import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  Timestamp,
  QueryConstraint 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Paciente, StatusMonitoramento } from "@/tipos/paciente";

const COLECAO_PACIENTES = "monitoravc";

export const api = {
  // Pacientes
  async buscarPacientes(filtros?: { nome?: string; numeroAtendimento?: string }) {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Adicionar filtros se fornecidos
      if (filtros?.nome) {
        constraints.push(where("name.0.text", ">=", filtros.nome.toUpperCase()));
        constraints.push(where("name.0.text", "<=", filtros.nome.toUpperCase() + '\uf8ff'));
      }
      
      if (filtros?.numeroAtendimento) {
        constraints.push(where("identifier.0.value", "==", filtros.numeroAtendimento));
      }
      
      const q = constraints.length > 0 
        ? query(collection(db, COLECAO_PACIENTES), ...constraints)
        : collection(db, COLECAO_PACIENTES);
      
      const snapshot = await getDocs(q);
      
      const pacientes = snapshot.docs.map(docSnap => ({
        _id: docSnap.id,
        ...docSnap.data()
      })) as Paciente[];
      
      return pacientes;
    } catch (error: any) {
      console.error("Erro ao buscar pacientes:", error);
      throw new Error(error.message || "Erro ao buscar pacientes");
    }
  },

  async criarPaciente(dados: any) {
    try {
      const novoPaciente: Omit<Paciente, '_id'> = {
        resourceType: "Patient",
        identifier: [{
          system: "atendimento",
          value: "" // Será preenchido na análise
        }],
        name: [{
          use: "official",
          text: dados.nome.toUpperCase()
        }],
        gender: dados.genero,
        birthDate: dados.dataNascimento,
        telecom: [],
        address: [],
        _extension_Monitoramento: {
          dataCadastroSistema: Timestamp.now() as any,
          statusMonitoramento: "aguarda_analise" as StatusMonitoramento,
          historicoStatus: [{
            status: "aguarda_analise" as StatusMonitoramento,
            timestamp: Timestamp.now() as any
          }]
        }
      };

      const docRef = await addDoc(collection(db, COLECAO_PACIENTES), novoPaciente);
      
      // Criar documento de internação se aplicável
      if (dados.statusInternacao === "in-progress") {
        // TODO: Implementar criação de documento Encounter separado ou como subcoleção
      }

      // Criar documentos de exames pendentes
      // TODO: Implementar criação de documentos ServiceRequest como subcoleção
      
      return {
        _id: docRef.id,
        ...novoPaciente
      };
    } catch (error: any) {
      console.error("Erro ao criar paciente:", error);
      throw { 
        response: { 
          data: { error: error.message || "Erro ao criar paciente" } 
        }, 
        message: error.message || "Erro ao criar paciente" 
      };
    }
  },

  // Métricas
  async buscarMetricas() {
    try {
      const snapshot = await getDocs(collection(db, COLECAO_PACIENTES));
      const pacientes = snapshot.docs.map(docSnap => docSnap.data()) as Paciente[];

      const totalPacientes = pacientes.length;
      const semCriterios = pacientes.filter(
        p => p._extension_Monitoramento.statusMonitoramento === "sem_criterio_monitoramento"
      ).length;
      const finalizados = pacientes.filter(
        p => p._extension_Monitoramento.statusMonitoramento === "monitoramento_finalizado"
      ).length;

      return {
        totalPacientes,
        percentualSemCriterios: totalPacientes > 0 ? (semCriterios / totalPacientes) * 100 : 0,
        quantidadeExamesRealizados: 0, // TODO: Implementar contagem de exames realizados
        quantidadeConsultasConfirmadas: 0, // TODO: Implementar contagem de consultas
        contagemContatosRealizados: 0, // TODO: Implementar contagem de contatos
        taxaConclusao: totalPacientes > 0 ? (finalizados / totalPacientes) * 100 : 0,
      };
    } catch (error: any) {
      console.error("Erro ao buscar métricas:", error);
      throw new Error(error.message || "Erro ao buscar métricas");
    }
  },

  // Análise
  async analisarPaciente(pacienteId: string, dados: any) {
    try {
      const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
      
      const atualizacao: any = {
        "_extension_Monitoramento.statusMonitoramento": dados.cumpreCriterios 
          ? "aguarda_exames" 
          : "sem_criterio_monitoramento"
      };

      if (dados.cumpreCriterios) {
        // Atualizar dados de monitoramento
        atualizacao["identifier"] = [{
          system: "atendimento",
          value: dados.numeroAtendimento
        }];
        atualizacao["address"] = [{
          city: dados.cidade
        }];
        atualizacao["telecom"] = dados.telefones || [];
      } else {
        atualizacao["_extension_Monitoramento.motivoSemCriterio"] = dados.motivoNaoCumpre;
      }

      await updateDoc(pacienteRef, atualizacao);
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao analisar paciente:", error);
      throw new Error(error.message || "Erro ao analisar paciente");
    }
  },

  // Exames
  async buscarExames(pacienteId: string) {
    try {
      // TODO: Implementar busca de exames em subcoleção ou documento relacionado
      return [];
    } catch (error: any) {
      console.error("Erro ao buscar exames:", error);
      throw new Error(error.message || "Erro ao buscar exames");
    }
  },

  async atualizarExames(pacienteId: string, examesChecados: any[]) {
    try {
      // TODO: Implementar atualização de exames
      // Verificar se todos os exames estão completos
      // Se sim, atualizar status do paciente para "aguarda_agendamento"
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar exames:", error);
      throw new Error(error.message || "Erro ao atualizar exames");
    }
  },

  // Agendamento
  async buscarAgendamento(pacienteId: string) {
    try {
      // TODO: Implementar busca de agendamentos
      return null;
    } catch (error: any) {
      console.error("Erro ao buscar agendamento:", error);
      throw new Error(error.message || "Erro ao buscar agendamento");
    }
  },

  async gerenciarAgendamento(pacienteId: string, dados: any) {
    try {
      // TODO: Implementar gerenciamento de agendamentos
      // Atualizar status do paciente para "aguarda_desfecho" quando confirmado
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao gerenciar agendamento:", error);
      throw new Error(error.message || "Erro ao gerenciar agendamento");
    }
  },

  // Desfecho
  async informarDesfecho(pacienteId: string, dados: any) {
    try {
      const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
      
      await updateDoc(pacienteRef, {
        "_extension_Monitoramento.statusMonitoramento": "monitoramento_finalizado",
        "_extension_Monitoramento.motivoFinalizacao": dados.motivo
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao informar desfecho:", error);
      throw new Error(error.message || "Erro ao informar desfecho");
    }
  },

  // Contato
  async registrarContato(pacienteId: string, dados: any) {
    try {
      // TODO: Implementar registro de contato em subcoleção ou documento relacionado
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar contato:", error);
      throw new Error(error.message || "Erro ao registrar contato");
    }
  },
};
