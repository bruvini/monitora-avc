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
    const pacientesCollection = db.collection('Paciente');

    // GET - Listar pacientes com filtros
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const nome = url.searchParams.get('nome');
      const numeroAtendimento = url.searchParams.get('numeroAtendimento');

      const filtro: any = {};
      
      if (nome) {
        filtro['name.text'] = { $regex: nome, $options: 'i' };
      }
      
      if (numeroAtendimento) {
        filtro['identifier.value'] = numeroAtendimento;
      }

      const pacientes = await pacientesCollection.find(filtro).toArray();
      
      return new Response(JSON.stringify(pacientes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Criar novo paciente
    if (req.method === 'POST') {
      const dados = await req.json();
      
      const novoPaciente = {
        resourceType: "Patient",
        identifier: [{ 
          system: "urn:hmsj:atendimento", 
          value: dados.numeroAtendimento 
        }],
        name: [{ 
          use: "official", 
          text: dados.nome.toUpperCase() 
        }],
        gender: dados.genero,
        birthDate: dados.dataNascimento,
        telecom: dados.telefones || [],
        address: [{ city: dados.cidade || "" }],
        _extension_Monitoramento: {
          dataCadastroSistema: new Date(),
          statusMonitoramento: "aguarda_analise",
          historicoStatus: [
            { status: "aguarda_analise", timestamp: new Date() }
          ]
        }
      };

      const resultado = await pacientesCollection.insertOne(novoPaciente);

      // Criar Internacao se fornecido
      if (dados.dataInternacao) {
        const internacaoCollection = db.collection('Internacao');
        await internacaoCollection.insertOne({
          resourceType: "Encounter",
          status: dados.statusInternacao || "finished",
          subject: resultado.toString(),
          period: {
            start: dados.dataInternacao,
            end: dados.dataAlta
          }
        });
      }

      // Criar PedidosExame
      if (dados.exames && dados.exames.length > 0) {
        const examesCollection = db.collection('PedidoExame');
        const pedidosExame = dados.exames.map((exame: any) => ({
          resourceType: "ServiceRequest",
          subject: resultado.toString(),
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
      }

      return new Response(JSON.stringify({ id: resultado }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erro em /pacientes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
