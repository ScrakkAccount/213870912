-- Tabla para productos
CREATE TABLE products (
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

-- Nota: Para almacenar imágenes, se debe crear un bucket de Storage en Supabase
-- 1. Ve a la sección "Storage" en el panel de Supabase
-- 2. Crea un nuevo bucket llamado "product-images"
-- 3. Configura los permisos adecuados (puedes usar políticas RLS)

-- Ejemplos de políticas RLS para el bucket product-images:
-- Para permitir lectura pública:
-- CREATE POLICY "Imágenes de productos accesibles públicamente" 
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'product-images');

-- Para permitir carga solo a usuarios autenticados:
-- CREATE POLICY "Solo usuarios autenticados pueden subir imágenes" 
-- ON storage.objects FOR INSERT
-- USING (bucket_id = 'product-images' AND auth.role() = 'authenticated'); 