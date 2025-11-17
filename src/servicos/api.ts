const FUNCOES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export const api = {
  // Pacientes
  async buscarPacientes(filtros?: { nome?: string; numeroAtendimento?: string }) {
    const params = new URLSearchParams();
    if (filtros?.nome) params.append('nome', filtros.nome);
    if (filtros?.numeroAtendimento) params.append('numeroAtendimento', filtros.numeroAtendimento);
    
    const response = await fetch(`${FUNCOES_URL}/pacientes?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar pacientes');
    return response.json();
  },

  async criarPaciente(dados: any) {
    const response = await fetch(`${FUNCOES_URL}/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error('Erro ao criar paciente');
    return response.json();
  },

  // Métricas
  async buscarMetricas() {
    const response = await fetch(`${FUNCOES_URL}/metricas`);
    if (!response.ok) throw new Error('Erro ao buscar métricas');
    return response.json();
  },

  // Análise
  async analisarPaciente(pacienteId: string, dados: any) {
    const response = await fetch(`${FUNCOES_URL}/analise/${pacienteId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error('Erro ao analisar paciente');
    return response.json();
  },

  // Exames
  async buscarExames(pacienteId: string) {
    const response = await fetch(`${FUNCOES_URL}/exames/${pacienteId}/`);
    if (!response.ok) throw new Error('Erro ao buscar exames');
    return response.json();
  },

  async atualizarExames(pacienteId: string, examesChecados: any[]) {
    const response = await fetch(`${FUNCOES_URL}/exames/${pacienteId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examesChecados }),
    });
    if (!response.ok) throw new Error('Erro ao atualizar exames');
    return response.json();
  },

  // Agendamento
  async buscarAgendamento(pacienteId: string) {
    const response = await fetch(`${FUNCOES_URL}/agendamento/${pacienteId}/`);
    if (!response.ok) throw new Error('Erro ao buscar agendamento');
    return response.json();
  },

  async gerenciarAgendamento(pacienteId: string, dados: any) {
    const response = await fetch(`${FUNCOES_URL}/agendamento/${pacienteId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error('Erro ao gerenciar agendamento');
    return response.json();
  },

  // Desfecho
  async informarDesfecho(pacienteId: string, dados: any) {
    const response = await fetch(`${FUNCOES_URL}/desfecho/${pacienteId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error('Erro ao informar desfecho');
    return response.json();
  },

  // Contato
  async registrarContato(pacienteId: string, dados: any) {
    const response = await fetch(`${FUNCOES_URL}/contato/${pacienteId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error('Erro ao registrar contato');
    return response.json();
  },
};
