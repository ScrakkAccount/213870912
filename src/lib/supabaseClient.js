import { createClient } from '@supabase/supabase-js';

// Credenciales de Supabase
const supabaseUrl = 'https://vgpoqxiypmirxycdlgso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncG9xeGl5cG1pcnh5Y2RsZ3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTUwMjAsImV4cCI6MjA2MjkzMTAyMH0.fKlYVlec2JJcF0wYVC6sy2ztbz1AwDrOn4T2wsk-uis';

// Variable global para el estado de conexión
let isConnected = true; // Asumimos conexión por defecto

// Crear cliente de Supabase con configuración simplificada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

// Verificar que las credenciales de Supabase estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: URL o clave de Supabase no definidas correctamente");
} else {
  console.log("Cliente Supabase inicializado correctamente");
}

// Función para verificar el estado de conexión (siempre retorna true)
export function isSupabaseConnected() {
  return isConnected;
}

// Función auxiliar simple para consultas a Supabase
export async function supabaseQuery(queryFunction) {
  try {
    return await queryFunction();
  } catch (error) {
    console.error("Error en consulta a Supabase:", error);
    throw error;
  }
}
  