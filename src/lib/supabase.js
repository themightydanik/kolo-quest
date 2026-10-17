import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://solbwnjxaeymellmbshm.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbGJ3bmp4YWV5bWVsbG1ic2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODkwNjksImV4cCI6MjEwNjE2NTA2OX0.P_vUAyldVkbsKfAKp_UWHqRqczFEaGPl6Mf6fnzPevM"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
