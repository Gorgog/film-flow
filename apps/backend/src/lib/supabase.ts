import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // загружает .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Supabase URL или Secret Key не найдены в .env');
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false }, // для сервера
});
