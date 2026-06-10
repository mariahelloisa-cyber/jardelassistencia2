import { createClient } from '@supabase/supabase-js'

// Inserido diretamente as credenciais do seu banco para evitar falhas de leitura do .env
const supabaseUrl = 'https://takerilulwzxtgndgqnl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha2VyaWx1bHd6eHRnbmRncW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTIyODcsImV4cCI6MjA5NDY4ODI4N30.Q-5p_PGlVO3IZCjBuIifx9X7FDE6ZC0ZriOhaSKsbic'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)