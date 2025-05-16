-- SCRIPT DE CONFIGURACIÓN COMPLETO PARA RYVEN SHOP
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. CREAR TABLA DE PRODUCTOS (si no existe)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  icon_name VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREAR BUCKET PARA IMÁGENES (ejecútalo solo si aún no has creado el bucket manualmente)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- 3. CONFIGURAR POLÍTICAS DE ALMACENAMIENTO

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Imágenes accesibles públicamente" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Política para permitir que cualquiera pueda subir imágenes
CREATE POLICY "Permitir subida de imágenes sin restricciones" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir actualización de imágenes
CREATE POLICY "Permitir actualización de imágenes sin restricciones" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir eliminación de imágenes
CREATE POLICY "Permitir eliminación de imágenes sin restricciones" 
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- 4. VERIFICA LA TABLA "ORDERS" EXISTENTE (solo consulta, no crea ni modifica)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'; 