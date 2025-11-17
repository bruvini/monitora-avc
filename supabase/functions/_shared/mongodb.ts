import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = Deno.env.get('MONGODB_URI');
  if (!uri) {
    throw new Error('MONGODB_URI não configurado');
  }

  const client = new MongoClient();
  await client.connect(uri);
  cachedClient = client;
  
  return client;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.database('HMSJ_Hub');
}
