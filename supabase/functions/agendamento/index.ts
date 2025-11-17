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
    const agendamentosCollection = db.collection('Agendamento');
    const pacientesCollection = db.collection('Paciente');

    if (req.method === 'GET') {
      const agendamento = await agendamentosCollection.findOne({
        subject: pacienteId,
        status: { $in: ['proposed', 'booked'] }
      });

      return new Response(JSON.stringify(agendamento), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      const { acao, data, motivo } = await req.json();

      let novoStatus: string;
      let updateData: any = {
        subject: pacienteId,
      };

      switch (acao) {
        case 'pre-agendar':
          novoStatus = 'proposed';
          updateData.start = new Date(data);
          updateData.status = novoStatus;
          break;

        case 'confirmar':
          novoStatus = 'booked';
          updateData.status = novoStatus;
          
          // Mudar status do paciente para aguarda_desfecho
          await pacientesCollection.updateOne(
            { _id: new ObjectId(pacienteId) },
            {
              $set: {
                '_extension_Monitoramento.statusMonitoramento': 'aguarda_desfecho'
              },
              $push: {
                '_extension_Monitoramento.historicoStatus': {
                  status: 'aguarda_desfecho',
                  timestamp: new Date()
                }
              }
            }
          );
          break;

        case 'cancelar':
          novoStatus = 'cancelled';
          updateData.status = novoStatus;
          updateData.comment = motivo;
          break;

        case 'alterar':
          updateData.start = new Date(data);
          updateData.comment = motivo;
          break;
      }

      await agendamentosCollection.updateOne(
        { subject: pacienteId, status: { $in: ['proposed', 'booked'] } },
        { $set: updateData },
        { upsert: true }
      );

      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erro em /agendamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
