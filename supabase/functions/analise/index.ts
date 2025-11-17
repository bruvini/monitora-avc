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
    const pacienteId = pathParts[pathParts.length - 2]; // /analise/:id

    const dados = await req.json();
    const db = await getDatabase();
    const pacientesCollection = db.collection('Paciente');

    let novoStatus: string;
    let updateData: any = {};

    if (dados.cumpreCriterios) {
      // Atualizar dados complementares
      novoStatus = 'aguarda_exames';
      updateData = {
        telecom: dados.telefones,
        'address.0.city': dados.cidade,
        '_extension_Monitoramento.statusMonitoramento': novoStatus,
      };

      // Criar/Atualizar Internacao
      if (dados.dataInternacao) {
        const internacaoCollection = db.collection('Internacao');
        await internacaoCollection.updateOne(
          { subject: pacienteId },
          {
            $set: {
              'period.start': dados.dataInternacao,
              'period.end': dados.dataAlta,
            }
          },
          { upsert: true }
        );
      }
    } else {
      // Não cumpre critérios
      novoStatus = 'sem_criterio_monitoramento';
      updateData = {
        '_extension_Monitoramento.statusMonitoramento': novoStatus,
        '_extension_Monitoramento.motivoSemCriterio': dados.motivo,
      };
    }

    // Adicionar ao histórico
    updateData['_extension_Monitoramento.historicoStatus'] = {
      status: novoStatus,
      timestamp: new Date()
    };

    await pacientesCollection.updateOne(
      { _id: new ObjectId(pacienteId) },
      { 
        $set: updateData,
        $push: { '_extension_Monitoramento.historicoStatus': updateData['_extension_Monitoramento.historicoStatus'] }
      }
    );

    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro em /analise:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
