import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gzauwxuweywmhlcfored.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YXV3eHV3ZXl3bWhsY2ZvcmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDM5MDQsImV4cCI6MjA5Nzg3OTkwNH0.9wJVEIY8sz_TEKMmyom00LvtJdZt76tJUqSKoowKeMg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
