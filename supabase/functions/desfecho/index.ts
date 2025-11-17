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

    const { opcao, exames, motivoFinalizacao } = await req.json();

    const db = await getDatabase();
    const pacientesCollection = db.collection('Paciente');
    const agendamentosCollection = db.collection('Agendamento');
    const examesCollection = db.collection('PedidoExame');

    let novoStatus: string | null = null;
    let updateData: any = {};

    switch (opcao) {
      case 'finalizado':
        novoStatus = 'monitoramento_finalizado';
        updateData = {
          '_extension_Monitoramento.statusMonitoramento': novoStatus
        };
        
        // Marcar agendamento como fulfilled
        await agendamentosCollection.updateOne(
          { subject: pacienteId, status: 'booked' },
          { $set: { status: 'fulfilled' } }
        );
        break;

      case 'novo_retorno':
        // Manter em aguarda_desfecho e criar novo agendamento proposed
        await agendamentosCollection.insertOne({
          resourceType: "Appointment",
          subject: pacienteId,
          participant: [],
          status: 'proposed'
        });
        return new Response(JSON.stringify({ sucesso: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'novos_exames':
        novoStatus = 'aguarda_exames';
        updateData = {
          '_extension_Monitoramento.statusMonitoramento': novoStatus
        };
        
        // Criar novos PedidosExame
        const pedidosExame = exames.map((exame: any) => ({
          resourceType: "ServiceRequest",
          subject: pacienteId,
          status: "active",
          code: {
            coding: [{ 
              system: "urn:hmsj:exames", 
              code: exame.tipo 
            }]
          },
          note: exame.detalhes ? [{ text: exame.detalhes }] : [],
          occurrenceDateTime: new Date(),
          _extension_Monitoramento: {}
        }));
        
        await examesCollection.insertMany(pedidosExame);
        break;

      case 'paciente_faltou':
        // Marcar agendamento como noshow
        await agendamentosCollection.updateOne(
          { subject: pacienteId, status: 'booked' },
          { $set: { status: 'noshow' } }
        );
        
        if (motivoFinalizacao === 'finalizar') {
          novoStatus = 'monitoramento_finalizado';
          updateData = {
            '_extension_Monitoramento.statusMonitoramento': novoStatus,
            '_extension_Monitoramento.motivoFinalizacao': 'Falta'
          };
        } else {
          // Reagendar - criar novo proposed
          await agendamentosCollection.insertOne({
            resourceType: "Appointment",
            subject: pacienteId,
            participant: [],
            status: 'proposed'
          });
          return new Response(JSON.stringify({ sucesso: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;
    }

    // Atualizar paciente com novo status
    if (novoStatus) {
      await pacientesCollection.updateOne(
        { _id: new ObjectId(pacienteId) },
        {
          $set: updateData,
          $push: {
            '_extension_Monitoramento.historicoStatus': {
              status: novoStatus,
              timestamp: new Date()
            }
          }
        }
      );
    }

    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro em /desfecho:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
