import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export async function startMemoryMongo() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('🗄️  In‑memory MongoDB started →', uri);
  // Override env var for the current process (so next dev will pick it up)
  process.env.MONGODB_URI = uri;
}

export async function stopMemoryMongo() {
  if (mongod) await mongod.stop();
}
