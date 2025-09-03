import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../shared/schema';

// Use Supabase connection string
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.ayludcnqyyznsyzhcytf:Campusdigital123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString: DATABASE_URL,
});

client.connect().catch(console.error);

export const db = drizzle(client, { schema });
