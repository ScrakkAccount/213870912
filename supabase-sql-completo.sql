-- Script SQL completo para la configuración de RyVen Shop en Supabase

-- 1. Tabla de productos
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

-- 2. Tabla de pedidos
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(20) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discord_username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices para mejorar el rendimiento de búsquedas comunes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_id ON orders(order_id);

-- 4. Comentarios en las tablas para documentación
COMMENT ON TABLE products IS 'Catálogo de productos disponibles para venta';
COMMENT ON TABLE orders IS 'Registro de pedidos realizados por los clientes';

-- 5. Configuración del almacenamiento para imágenes de productos

-- Crear un bucket para imágenes de productos (ejecutar desde la UI o API)
-- Esta parte es un comentario informativo, ya que los buckets se crean generalmente desde la interfaz de Supabase
-- Nombre: product-images
-- Tipo: público

-- 6. Políticas de seguridad para el bucket de imágenes
-- Política para permitir lectura pública de imágenes
CREATE POLICY "Imágenes accesibles públicamente" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Política para permitir que cualquiera pueda subir imágenes
CREATE POLICY "Permitir subida de imágenes sin restricciones" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir actualización
CREATE POLICY "Permitir actualización de imágenes sin restricciones" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir eliminación
CREATE POLICY "Permitir eliminación de imágenes sin restricciones" 
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- 7. Políticas de seguridad para tabla de productos
-- Permitir lectura pública de productos
CREATE POLICY "Productos accesibles públicamente"
ON products FOR SELECT
USING (true);

-- Permitir inserción, actualización y eliminación sin restricciones (en un entorno de producción se recomienda restringir estas operaciones)
CREATE POLICY "Gestión completa de productos"
ON products FOR ALL
USING (true);

-- 8. Políticas de seguridad para tabla de pedidos
-- Permitir lectura pública de pedidos
CREATE POLICY "Pedidos accesibles públicamente"
ON orders FOR SELECT
USING (true);

-- Permitir inserción de pedidos sin restricciones
CREATE POLICY "Permitir creación de pedidos"
ON orders FOR INSERT
WITH CHECK (true);

-- Permitir actualización y eliminación sin restricciones (en un entorno de producción se recomienda restringir estas operaciones)
CREATE POLICY "Gestión completa de pedidos"
ON orders FOR UPDATE
USING (true);

CREATE POLICY "Permitir eliminación de pedidos"
ON orders FOR DELETE
USING (true);

-- 9. Habilitar Row Level Security (RLS) pero con políticas abiertas para simplificar el desarrollo
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 10. IMPORTANTE: No olvides crear el bucket 'product-images' desde la interfaz de Supabase
-- Storage > New Bucket > Nombre: product-images > Marcar como "Public" 