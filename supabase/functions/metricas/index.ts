import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getDatabase } from "../_shared/mongodb.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const db = await getDatabase();
    
    // Total de Pacientes
    const totalPacientes = await db.collection('Paciente').countDocuments();
    
    // Pacientes Sem Critérios
    const semCriterios = await db.collection('Paciente').countDocuments({
      '_extension_Monitoramento.statusMonitoramento': 'sem_criterio_monitoramento'
    });
    
    // Exames Realizados
    const examesRealizados = await db.collection('PedidoExame').countDocuments({
      status: 'completed'
    });
    
    // Consultas Confirmadas (em aguarda_desfecho)
    const consultasConfirmadas = await db.collection('Agendamento').countDocuments({
      status: 'booked'
    });
    
    // Contatos com Sucesso
    const contatosRealizados = await db.collection('RegistroContato').countDocuments({
      '_extension_Monitoramento.desfecho': 'sucesso'
    });
    
    // Monitoramento Finalizado
    const finalizados = await db.collection('Paciente').countDocuments({
      '_extension_Monitoramento.statusMonitoramento': 'monitoramento_finalizado'
    });

    const metricas = {
      totalPacientes,
      percentualSemCriterios: totalPacientes > 0 
        ? (semCriterios / totalPacientes) * 100 
        : 0,
      quantidadeExamesRealizados: examesRealizados,
      quantidadeConsultasConfirmadas: consultasConfirmadas,
      contagemContatosRealizados: contatosRealizados,
      taxaConclusao: totalPacientes > 0 
        ? (finalizados / totalPacientes) * 100 
        : 0
    };

    return new Response(JSON.stringify(metricas), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro em /metricas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
