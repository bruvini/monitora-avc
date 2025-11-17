/**
 * Formata uma data para o padrão brasileiro dd/mm/aaaa
 * @param data - Data a ser formatada
 * @returns String formatada
 */
export function formatarData(data: Date | string): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

/**
 * Remove acentos, caracteres especiais e converte para maiúsculas (padrão FHIR)
 * @param nome - Nome a ser formatado
 * @returns Nome normalizado
 */
export function formatarNomePaciente(nome: string): string {
  if (!nome) return "";
  return nome
    .normalize("NFD") // Separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove caracteres especiais (exceto espaço)
    .toUpperCase()
    .trim();
}

/**
 * Aplica máscara de telefone brasileiro (xx) xxxxx-xxxx
 * @param telefone - Número de telefone (apenas dígitos)
 * @returns Telefone formatado
 */
export function aplicarMascaraTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length <= 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Remove máscara e retorna apenas números do telefone
 * @param telefone - Telefone formatado
 * @returns Apenas números
 */
export function removerMascaraTelefone(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

/**
 * Processa o campo "Outros" de exames, dividindo por vírgula
 * @param textoInput - String com exames separados por vírgula
 * @returns Array de exames processados
 */
export function processarExamesOutros(textoInput: string): string[] {
  if (!textoInput || textoInput.trim() === '') {
    return [];
  }
  
  return textoInput
    .split(',')
    .map(exame => exame.trim())
    .filter(exame => exame.length > 0);
}
