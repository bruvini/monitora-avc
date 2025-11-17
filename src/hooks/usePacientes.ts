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
    mutationFn: ({ pacienteId, examesChecados }: { pacienteId: string; examesChecados: any[] }) => 
      api.atualizarExames(pacienteId, examesChecados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['exames'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Exames atualizados com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar exames');
    },
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
