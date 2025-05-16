-- Políticas para el bucket product-images
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Asegúrate de que el bucket existe
-- INSERT INTO storage.buckets (id, name) VALUES ('product-images', 'product-images') ON CONFLICT DO NOTHING;

-- 2. Política para permitir lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Imágenes accesibles públicamente" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 3. Política para permitir que cualquiera pueda subir imágenes (sin autenticación)
CREATE POLICY "Permitir subida de imágenes sin restricciones" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- 4. Política para permitir actualización (opcional)
CREATE POLICY "Permitir actualización de imágenes sin restricciones" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 5. Política para permitir eliminación (opcional)
CREATE POLICY "Permitir eliminación de imágenes sin restricciones" 
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images'); 