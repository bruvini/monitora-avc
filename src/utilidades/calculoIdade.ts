/**
 * Calcula a idade atual de um paciente com base na data de nascimento
 * @param dataNascimento - Data de nascimento no formato YYYY-MM-DD ou Date
 * @returns Idade em anos
 */
export function calcularIdade(dataNascimento: string | Date): number {
  const nascimento = typeof dataNascimento === 'string' 
    ? new Date(dataNascimento) 
    : dataNascimento;
  
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
}

// Tipo flexível para aceitar Timestamp do Firestore (que tem .toDate())
type TipoDataFlexivel = Date | string | { toDate: () => Date } | null | undefined;

function normalizarData(data: TipoDataFlexivel): Date | null {
  if (!data) return null;
  // Se for um Timestamp do Firestore, converte para Date
  if (typeof (data as any).toDate === 'function') {
    return (data as { toDate: () => Date }).toDate();
  }
  // Se já for Date, retorna
  if (data instanceof Date) {
    return data;
  }
  // Se for string, tenta converter
  if (typeof data === 'string') {
    return new Date(data);
  }
  return null;
}

/**
 * Calcula dias de monitoramento desde o cadastro
 * @param dataCadastro - Data do cadastro
 * @param dataFinalizacao - Data de finalização (opcional)
 * @returns Número de dias de monitoramento
 */
export function calcularDiasMonitoramento(
  dataCadastro: TipoDataFlexivel,
  dataFinalizacao?: TipoDataFlexivel
): number {
  const inicio = normalizarData(dataCadastro);

  // Se 'inicio' for nulo ou inválido, retorna 0 para evitar crash
  if (!inicio || isNaN(inicio.getTime())) {
    console.warn("dataCadastroSistema inválida ou ausente:", dataCadastro);
    return 0; 
  }

  const fim = normalizarData(dataFinalizacao) || new Date();

  const diferencaMs = fim.getTime() - inicio.getTime();
  const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  return dias;
}
