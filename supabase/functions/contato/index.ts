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
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const pacienteId = pathParts[pathParts.length - 2];

    const { meioContato, desfecho, resumo } = await req.json();

    const db = await getDatabase();
    const contatosCollection = db.collection('RegistroContato');

    const novoContato = {
      resourceType: "Communication",
      subject: pacienteId,
      sent: new Date(),
      medium: {
        coding: [{ code: meioContato }]
      },
      _extension_Monitoramento: {
        desfecho: desfecho
      },
      payload: resumo ? [{ contentString: resumo }] : []
    };

    await contatosCollection.insertOne(novoContato);

    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro em /contato:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
