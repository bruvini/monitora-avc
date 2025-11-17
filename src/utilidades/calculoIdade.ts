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

/**
 * Calcula dias de monitoramento desde o cadastro
 * @param dataCadastro - Data do cadastro
 * @param dataFinalizacao - Data de finalização (opcional)
 * @returns Número de dias de monitoramento
 */
export function calcularDiasMonitoramento(
  dataCadastro: Date | string,
  dataFinalizacao?: Date | string | null
): number {
  const inicio = typeof dataCadastro === 'string' 
    ? new Date(dataCadastro) 
    : dataCadastro;
  
  const fim = dataFinalizacao 
    ? (typeof dataFinalizacao === 'string' ? new Date(dataFinalizacao) : dataFinalizacao)
    : new Date();
  
  const diferencaMs = fim.getTime() - inicio.getTime();
  const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
  
  return dias;
}
