# Instrucciones para el Logo

## Opción 1: Importar como módulo (Recomendado)

1. Coloca tu archivo de logo como `logo.png` en esta carpeta (`src/assets/`)
2. En `App.jsx` ya está configurado para importar y usar este archivo
3. Esta es la forma preferida en proyectos Vite/React

## Opción 2: Usar archivo en carpeta public

Si prefieres usar un archivo en la carpeta `public`:

1. Coloca tu archivo de logo en la carpeta `public/images/`
2. En `App.jsx`, comenta la línea de importación del logo
3. Descomenta y usa la línea `const LOGO_PATH = "/images/logo.png";`
4. Cambia `src={logoImage}` a `src={LOGO_PATH}`

## Tamaño recomendado

- Tamaño ideal: 120x120 píxeles (como mínimo)
- Formato: PNG con transparencia
- Resolución: 72 DPI

## Notas

- El logo se mostrará en un contenedor de 48x48 píxeles
- Si usas un logo rectangular, considera que se recortará para ajustarse al contenedor cuadrado
- Si el logo tiene fondo, usa un fondo transparente para mejor integración 

# Instrucciones para el Logo Rectangular

## Instrucciones de Implementación

1. **Coloca tu archivo de logo**:
   - Guarda tu logo como `logo.png` en la carpeta `public/images/`
   - El código ya está configurado para usar este archivo desde esta ubicación

2. **Dimensiones del contenedor**:
   - El contenedor tiene un ancho de 176px (w-44) y una altura de 40px (h-10)
   - Esto permite mostrar logos rectangulares como el tuyo (1612x354) sin recortar
   - Se usa `object-contain` para preservar la relación de aspecto

## Si quieres ajustar el tamaño del logo

Si necesitas un contenedor más grande o más pequeño, puedes modificar estas propiedades en `App.jsx`:

```jsx
<div className="overflow-hidden rounded-md h-10 w-44 flex items-center justify-center bg-transparent">
```

- `h-10`: Altura (40px)
- `w-44`: Ancho (176px)

Puedes aumentar estos valores si necesitas un logo más grande, manteniendo la relación de aspecto aproximadamente 4.5:1 (ancho:alto).

## Notas

- No se recortará tu logo rectangular, se verá completo
- Se ha configurado con `object-contain` para preservar la relación de aspecto
- El fondo es transparente para adaptarse a cualquier diseño
- Recomendamos usar un logo con fondo transparente (PNG) 