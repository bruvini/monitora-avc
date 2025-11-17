import { Timestamp, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Converte recursivamente Timestamps do Firestore para objetos Date do JavaScript
 * @param obj - Objeto a ser convertido
 * @returns Objeto com Timestamps convertidos para Date
 */
export function converterTimestamps(obj: any): any {
  if (!obj) return obj;
  
  // Se for um Timestamp do Firestore, converte para Date
  if (obj instanceof Timestamp) {
    return obj.toDate();
  }
  
  // Se for array, converte cada item
  if (Array.isArray(obj)) {
    return obj.map(converterTimestamps);
  }
  
  // Se for objeto, converte recursivamente cada propriedade
  if (typeof obj === 'object') {
    const novoObj: { [key: string]: any } = {};
    for (const key in obj) {
      novoObj[key] = converterTimestamps(obj[key]);
    }
    return novoObj;
  }
  
  return obj;
}

/**
 * Registra uma ação no log de auditoria do paciente
 * @param pacienteId - ID do paciente
 * @param mensagem - Mensagem a ser registrada
 * @param tipo - Tipo de ação (cadastro, analise, contato, exame, agendamento, desfecho, obito, reinternacao)
 */
export async function registrarLog(
  pacienteId: string, 
  mensagem: string,
  tipo: string = "geral"
): Promise<void> {
  try {
    const logsRef = collection(db, "monitoravc", pacienteId, "logs");
    await addDoc(logsRef, {
      mensagem,
      tipo,
      timestamp: Timestamp.now(),
      dataHora: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
    // Não lançar erro para não bloquear a operação principal
  }
}
