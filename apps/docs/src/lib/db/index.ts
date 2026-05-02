import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// ENV'de DATABASE_URL bulunmadığında hata fırlatarak geliştiriciyi uyarır
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
