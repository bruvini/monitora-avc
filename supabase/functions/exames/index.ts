import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getDatabase } from "../_shared/mongodb.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const pacienteId = pathParts[pathParts.length - 2];

    const db = await getDatabase();
    const examesCollection = db.collection('PedidoExame');
    const pacientesCollection = db.collection('Paciente');

    if (req.method === 'GET') {
      // Buscar exames do paciente
      const exames = await examesCollection.find({
        subject: pacienteId
      }).toArray();

      return new Response(JSON.stringify(exames), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      const { examesChecados } = await req.json();

      // Atualizar exames marcados como realizados
      for (const exame of examesChecados) {
        await examesCollection.updateOne(
          { _id: new ObjectId(exame.id) },
          {
            $set: {
              status: 'completed',
              '_extension_Monitoramento.dataRealizacao': new Date(exame.dataRealizacao)
            }
          }
        );
      }

      // Verificar se todos os exames foram completados
      const examesAtivos = await examesCollection.countDocuments({
        subject: pacienteId,
        status: 'active'
      });

      // Se todos completados, mudar status do paciente
      if (examesAtivos === 0) {
        await pacientesCollection.updateOne(
          { _id: new ObjectId(pacienteId) },
          {
            $set: {
              '_extension_Monitoramento.statusMonitoramento': 'aguarda_agendamento'
            },
            $push: {
              '_extension_Monitoramento.historicoStatus': {
                status: 'aguarda_agendamento',
                timestamp: new Date()
              }
            }
          }
        );
      }

      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erro em /exames:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
