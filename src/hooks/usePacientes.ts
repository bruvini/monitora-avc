import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/servicos/api';
import { toast } from 'sonner';

export function usePacientes(filtros?: { nome?: string; numeroAtendimento?: string }) {
  return useQuery({
    queryKey: ['pacientes', filtros],
    queryFn: () => api.buscarPacientes(filtros),
    enabled: true,
  });
}

export function useMetricas() {
  return useQuery({
    queryKey: ['metricas'],
    queryFn: () => api.buscarMetricas(),
  });
}

export function useCriarPaciente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dados: any) => api.criarPaciente(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Paciente cadastrado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao cadastrar paciente');
    },
  });
}

export function useAnalisarPaciente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, dados }: { pacienteId: string; dados: any }) => 
      api.analisarPaciente(pacienteId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Análise salva com sucesso');
    },
    onError: () => {
      toast.error('Erro ao salvar análise');
    },
  });
}

export function useExames(pacienteId: string | null) {
  return useQuery({
    queryKey: ['exames', pacienteId],
    queryFn: () => api.buscarExames(pacienteId!),
    enabled: !!pacienteId,
  });
}

export function useAtualizarExames() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, exameId, dataRealizacao }: { pacienteId: string; exameId: string; dataRealizacao: Date }) => 
      api.atualizarExames(pacienteId, exameId, dataRealizacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Exame atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar exame');
    },
  });
}

export function useRegistrarObito() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, dataObito }: { pacienteId: string; dataObito: Date }) => 
      api.registrarObito(pacienteId, dataObito),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Óbito registrado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registrar óbito');
    },
  });
}

export function useRegistrarReinternacao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, dataReinternacao, motivo }: { pacienteId: string; dataReinternacao: Date; motivo: string }) => 
      api.registrarReinternacao(pacienteId, dataReinternacao, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Reinternação registrada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registrar reinternação');
    },
  });
}

export function useExcluirPaciente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pacienteId: string) => api.excluirPaciente(pacienteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Paciente excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir paciente');
    },
  });
}

export function useLogs(pacienteId: string | null) {
  return useQuery({
    queryKey: ['logs', pacienteId],
    queryFn: () => api.buscarLogs(pacienteId!),
    enabled: !!pacienteId,
  });
}

export function useAgendamento(pacienteId: string | null) {
  return useQuery({
    queryKey: ['agendamento', pacienteId],
    queryFn: () => api.buscarAgendamento(pacienteId!),
    enabled: !!pacienteId,
  });
}

export function useGerenciarAgendamento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, dados }: { pacienteId: string; dados: any }) => 
      api.gerenciarAgendamento(pacienteId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['agendamento'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Agendamento atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar agendamento');
    },
  });
}

export function useInformarDesfecho() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, dados }: { pacienteId: string; dados: any }) => 
      api.informarDesfecho(pacienteId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Desfecho registrado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao registrar desfecho');
    },
  });
}

export function useRegistrarContato() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pacienteId, dados }: { pacienteId: string; dados: any }) => 
      api.registrarContato(pacienteId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Contato registrado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao registrar contato');
    },
  });
}
