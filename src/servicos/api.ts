import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  Timestamp,
  QueryConstraint,
  deleteDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Paciente, StatusMonitoramento } from "@/tipos/paciente";
import { converterTimestamps, registrarLog } from "@/lib/firestoreUtils";

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
      
      const pacientes = snapshot.docs.map(docSnap => {
        const data = converterTimestamps(docSnap.data());
        return {
          _id: docSnap.id,
          ...data
        };
      }) as Paciente[];
      
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
      
      // Registrar log de auditoria
      await registrarLog(docRef.id, "Paciente cadastrado no sistema.", "cadastro");
      
      // Criar documentos de exames pendentes como subcoleção
      if (dados.exames && dados.exames.length > 0) {
        const examesRef = collection(db, COLECAO_PACIENTES, docRef.id, "exames");
        for (const exame of dados.exames) {
          await addDoc(examesRef, {
            nomeExame: exame,
            status: "pendente",
            dataCriacao: Timestamp.now()
          });
        }
      }
      
      return {
        _id: docRef.id,
        ...converterTimestamps(novoPaciente)
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
      
      // Registrar log de auditoria
      const mensagemLog = dados.cumpreCriterios 
        ? `Paciente analisado. Status: aguarda_exames.`
        : `Paciente analisado. Status: sem_criterio_monitoramento. Motivo: ${dados.motivoNaoCumpre}`;
      await registrarLog(pacienteId, mensagemLog, "analise");
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao analisar paciente:", error);
      throw new Error(error.message || "Erro ao analisar paciente");
    }
  },

  // Exames
  async buscarExames(pacienteId: string) {
    try {
      const examesRef = collection(db, COLECAO_PACIENTES, pacienteId, "exames");
      const snapshot = await getDocs(examesRef);
      
      const exames = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...converterTimestamps(docSnap.data())
      }));
      
      return exames;
    } catch (error: any) {
      console.error("Erro ao buscar exames:", error);
      throw new Error(error.message || "Erro ao buscar exames");
    }
  },

  async atualizarExames(pacienteId: string, exameId: string, dataRealizacao: Date) {
    try {
      const exameRef = doc(db, COLECAO_PACIENTES, pacienteId, "exames", exameId);
      await updateDoc(exameRef, {
        status: "realizado",
        dataRealizacao: Timestamp.fromDate(dataRealizacao)
      });
      
      // Verificar se todos os exames estão completos
      const todosExames = await this.buscarExames(pacienteId);
      const todosConcluidos = todosExames.every((e: any) => e.status === "realizado");
      
      if (todosConcluidos) {
        const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
        await updateDoc(pacienteRef, {
          "_extension_Monitoramento.statusMonitoramento": "aguarda_agendamento"
        });
        await registrarLog(pacienteId, "Todos os exames concluídos. Paciente movido para aguarda_agendamento.", "exame");
      } else {
        const exameData = todosExames.find((e: any) => e.id === exameId);
        await registrarLog(
          pacienteId, 
          `Exame "${exameData.nomeExame}" checado em ${dataRealizacao.toLocaleDateString('pt-BR')}.`, 
          "exame"
        );
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar exames:", error);
      throw new Error(error.message || "Erro ao atualizar exames");
    }
  },

  // Agendamento
  async buscarAgendamento(pacienteId: string) {
    try {
      const agendamentosRef = collection(db, COLECAO_PACIENTES, pacienteId, "agendamentos");
      const snapshot = await getDocs(agendamentosRef);
      
      if (snapshot.empty) return null;
      
      const ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
      return {
        id: ultimoDoc.id,
        ...converterTimestamps(ultimoDoc.data())
      };
    } catch (error: any) {
      console.error("Erro ao buscar agendamento:", error);
      throw new Error(error.message || "Erro ao buscar agendamento");
    }
  },

  async gerenciarAgendamento(pacienteId: string, dados: any) {
    try {
      const agendamentosRef = collection(db, COLECAO_PACIENTES, pacienteId, "agendamentos");
      
      if (dados.acao === "pre-agendar") {
        await addDoc(agendamentosRef, {
          dataConsulta: Timestamp.fromDate(dados.dataConsulta),
          status: "proposed",
          dataCriacao: Timestamp.now()
        });
        await registrarLog(
          pacienteId, 
          `Consulta pré-agendada para ${dados.dataConsulta.toLocaleDateString('pt-BR')}.`, 
          "agendamento"
        );
      } else if (dados.acao === "confirmar") {
        const agendamentoRef = doc(db, COLECAO_PACIENTES, pacienteId, "agendamentos", dados.agendamentoId);
        await updateDoc(agendamentoRef, {
          status: "booked",
          dataConfirmacao: Timestamp.now()
        });
        
        const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
        await updateDoc(pacienteRef, {
          "_extension_Monitoramento.statusMonitoramento": "aguarda_desfecho"
        });
        
        await registrarLog(
          pacienteId, 
          `Consulta confirmada para ${dados.dataConsulta.toLocaleDateString('pt-BR')}.`, 
          "agendamento"
        );
      } else if (dados.acao === "cancelar") {
        const agendamentoRef = doc(db, COLECAO_PACIENTES, pacienteId, "agendamentos", dados.agendamentoId);
        await updateDoc(agendamentoRef, {
          status: "cancelled",
          motivoCancelamento: dados.motivo,
          dataCancelamento: Timestamp.now()
        });
        await registrarLog(pacienteId, `Consulta cancelada. Motivo: ${dados.motivo}`, "agendamento");
      }
      
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
      
      if (dados.desfecho === "finalizado") {
        await updateDoc(pacienteRef, {
          "_extension_Monitoramento.statusMonitoramento": "monitoramento_finalizado",
          "_extension_Monitoramento.dataFinalizacao": Timestamp.now()
        });
        await registrarLog(pacienteId, "Consulta finalizada. Monitoramento concluído com sucesso.", "desfecho");
      } else if (dados.desfecho === "novo-retorno") {
        // Criar novo agendamento
        const agendamentosRef = collection(db, COLECAO_PACIENTES, pacienteId, "agendamentos");
        await addDoc(agendamentosRef, {
          dataConsulta: Timestamp.fromDate(dados.dataRetorno),
          status: "proposed",
          dataCriacao: Timestamp.now()
        });
        await registrarLog(pacienteId, `Novo retorno agendado para ${dados.dataRetorno.toLocaleDateString('pt-BR')}.`, "desfecho");
      } else if (dados.desfecho === "novos-exames") {
        // Criar novos exames e mudar status
        if (dados.exames && dados.exames.length > 0) {
          const examesRef = collection(db, COLECAO_PACIENTES, pacienteId, "exames");
          for (const exame of dados.exames) {
            await addDoc(examesRef, {
              nomeExame: exame,
              status: "pendente",
              dataCriacao: Timestamp.now()
            });
          }
        }
        await updateDoc(pacienteRef, {
          "_extension_Monitoramento.statusMonitoramento": "aguarda_exames"
        });
        await registrarLog(pacienteId, "Novos exames solicitados. Paciente retornou para aguarda_exames.", "desfecho");
      } else if (dados.desfecho === "faltou") {
        // Registrar falta
        const agendamentoRef = doc(db, COLECAO_PACIENTES, pacienteId, "agendamentos", dados.agendamentoId);
        await updateDoc(agendamentoRef, {
          status: "noshow",
          dataFalta: Timestamp.now()
        });
        
        if (dados.reagendar) {
          await registrarLog(pacienteId, "Paciente faltou à consulta. Aguardando reagendamento.", "desfecho");
        } else {
          await updateDoc(pacienteRef, {
            "_extension_Monitoramento.statusMonitoramento": "monitoramento_finalizado",
            "_extension_Monitoramento.motivoFinalizacao": "Finalizado por falta à consulta",
            "_extension_Monitoramento.dataFinalizacao": Timestamp.now()
          });
          await registrarLog(pacienteId, "Paciente faltou à consulta. Monitoramento finalizado.", "desfecho");
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao informar desfecho:", error);
      throw new Error(error.message || "Erro ao informar desfecho");
    }
  },

  // Contato
  async registrarContato(pacienteId: string, dados: any) {
    try {
      const contatosRef = collection(db, COLECAO_PACIENTES, pacienteId, "contatos");
      await addDoc(contatosRef, {
        meio: dados.meio,
        desfecho: dados.desfecho,
        observacoes: dados.observacoes || "",
        dataContato: Timestamp.now()
      });
      
      await registrarLog(
        pacienteId, 
        `Contato realizado. Meio: ${dados.meio}, Desfecho: ${dados.desfecho}.`, 
        "contato"
      );
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar contato:", error);
      throw new Error(error.message || "Erro ao registrar contato");
    }
  },

  // Ações especiais
  async registrarObito(pacienteId: string, dataObito: Date) {
    try {
      const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
      
      await updateDoc(pacienteRef, {
        "_extension_Monitoramento.statusMonitoramento": "obito",
        "_extension_Monitoramento.dataObito": Timestamp.fromDate(dataObito),
        "_extension_Monitoramento.dataFinalizacao": Timestamp.now()
      });
      
      // Cancelar agendamentos pendentes
      const agendamentosRef = collection(db, COLECAO_PACIENTES, pacienteId, "agendamentos");
      const snapshot = await getDocs(agendamentosRef);
      for (const docSnap of snapshot.docs) {
        const agendamento = docSnap.data();
        if (agendamento.status === "proposed" || agendamento.status === "booked") {
          await updateDoc(doc(db, COLECAO_PACIENTES, pacienteId, "agendamentos", docSnap.id), {
            status: "cancelled",
            motivoCancelamento: "Óbito do paciente"
          });
        }
      }
      
      await registrarLog(
        pacienteId, 
        `Registrado óbito em ${dataObito.toLocaleDateString('pt-BR')}.`, 
        "obito"
      );
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar óbito:", error);
      throw new Error(error.message || "Erro ao registrar óbito");
    }
  },

  async registrarReinternacao(pacienteId: string, dataReinternacao: Date, motivo: string) {
    try {
      const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
      
      const statusReinternacao = motivo.toLowerCase().includes("avc") 
        ? "reinternou_avc" 
        : "reinternou_outros";
      
      await updateDoc(pacienteRef, {
        "_extension_Monitoramento.statusMonitoramento": statusReinternacao,
        "_extension_Monitoramento.dataReinternacao": Timestamp.fromDate(dataReinternacao),
        "_extension_Monitoramento.motivoReinternacao": motivo,
        "_extension_Monitoramento.precisaReagendamento": true
      });
      
      // Cancelar agendamentos pendentes
      const agendamentosRef = collection(db, COLECAO_PACIENTES, pacienteId, "agendamentos");
      const snapshot = await getDocs(agendamentosRef);
      for (const docSnap of snapshot.docs) {
        const agendamento = docSnap.data();
        if (agendamento.status === "proposed" || agendamento.status === "booked") {
          await updateDoc(doc(db, COLECAO_PACIENTES, pacienteId, "agendamentos", docSnap.id), {
            status: "cancelled",
            motivoCancelamento: "Reinternação do paciente"
          });
        }
      }
      
      await registrarLog(
        pacienteId, 
        `Registrado reinternação por ${motivo} em ${dataReinternacao.toLocaleDateString('pt-BR')}.`, 
        "reinternacao"
      );
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar reinternação:", error);
      throw new Error(error.message || "Erro ao registrar reinternação");
    }
  },

  async excluirPaciente(pacienteId: string) {
    try {
      const pacienteRef = doc(db, COLECAO_PACIENTES, pacienteId);
      await deleteDoc(pacienteRef);
      
      // Firestore automaticamente exclui subcoleções quando o documento pai é excluído
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao excluir paciente:", error);
      throw new Error(error.message || "Erro ao excluir paciente");
    }
  },

  // Buscar logs de auditoria
  async buscarLogs(pacienteId: string) {
    try {
      const logsRef = collection(db, COLECAO_PACIENTES, pacienteId, "logs");
      const snapshot = await getDocs(logsRef);
      
      const logs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...converterTimestamps(docSnap.data())
      }));
      
      // Ordenar por timestamp decrescente (mais recente primeiro)
      return logs.sort((a: any, b: any) => b.timestamp - a.timestamp);
    } catch (error: any) {
      console.error("Erro ao buscar logs:", error);
      throw new Error(error.message || "Erro ao buscar logs");
    }
  }
};
