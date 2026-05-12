# Vir Medicina Capilar

Landing page y sistema completo de análisis capilar automático con Next.js, Supabase, Gemini Vision AI y Tailwind.

## Características implementadas

- Carga segura de imágenes de 1 a 3 fotos de cabello.
- Almacenamiento en Supabase Storage.
- Guardado de leads en Supabase PostgreSQL.
- Backend API que consume Gemini Vision AI para análisis.
- Reporte preliminar profesional en español.
- Redirección a WhatsApp y botón para agendar en Calendly.
- Sistema anti-spam con honeypot y validaciones.
- Diseño responsive, mobile-first y premium.

## Comandos

- `npm install`
- `npm run dev`
- `npm run build`
- `npm start`

## Estructura principal

- `app/page.jsx`: landing page y formulario cliente.
- `app/api/submit/route.js`: endpoint backend de envío y análisis.
- `lib/supabaseClient.js`: cliente Supabase server-side.
- `lib/geminiClient.js`: integración con Gemini Vision AI.
- `supabase-init.sql`: SQL para crear la tabla `leads`.
- `tailwind.config.js`: configuración de Tailwind.
- `.env.example`: variables de entorno necesarias.

## Variables de entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=scalp-uploads
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
WHATSAPP_TARGET=34123456789
CALENDLY_URL=https://calendly.com/vir-medicina-capilar/diagnostico
```

## Configuración rápida

1. `npm install`
2. `npm run dev`

## Notas

- El análisis es preliminar y no sustituye consulta médica.
- Asegúrate de crear el bucket `scalp-uploads` en Supabase Storage.
- Ejecuta `supabase-init.sql` en SQL Editor para crear `leads`.
