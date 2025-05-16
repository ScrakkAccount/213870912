# Configuración de Supabase para RyVen Shop

Para que la aplicación funcione correctamente, sigue estos pasos para configurar Supabase:

## 1. Crear la tabla de productos

En el Editor SQL de Supabase, ejecuta este código:

```sql
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
```

## 2. Configurar el almacenamiento para imágenes

### 2.1 Crear un bucket para imágenes

1. Ve a "Storage" en el menú lateral de Supabase
2. Haz clic en "New Bucket"
3. Nombre: `product-images`
4. Marca la opción "Public bucket" para permitir acceso público a las imágenes
5. Haz clic en "Create bucket"

### 2.2 Configurar políticas de seguridad para el bucket

En el SQL Editor, ejecuta lo siguiente:

```sql
-- Política para permitir lectura pública
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
```

> **IMPORTANTE**: Para políticas INSERT se usa WITH CHECK (no USING), y para UPDATE se necesitan ambas cláusulas.

## 3. Verificar la configuración

1. Intenta añadir un producto sin imagen primero
2. Luego añade un producto con imagen (asegúrate de que la imagen no sea mayor a 5MB)
3. Verifica que los productos aparezcan correctamente en la tienda

## Solución de problemas comunes

### Error "42601: only WITH CHECK expression allowed for INSERT"
Este error indica que estás usando USING en lugar de WITH CHECK para una política INSERT. Para políticas INSERT, debes usar WITH CHECK en lugar de USING.

### Error "new row violates row-level security policy"
Este error ocurre cuando intentas subir una imagen pero no tienes las políticas de seguridad correctamente configuradas. Asegúrate de haber ejecutado todas las políticas SQL del paso 2.2.

### Imágenes no aparecen
- Verifica que el bucket sea público
- Asegúrate de que la URL de la imagen en la base de datos sea correcta
- Comprueba que la política SELECT esté funcionando

### Problemas con la ruta del archivo
Si ves errores relacionados con la ruta del archivo, asegúrate de que:
- No estás usando subcarpetas en la ruta del archivo (a menos que las hayas configurado específicamente)
- Las imágenes se suben directamente a la raíz del bucket 