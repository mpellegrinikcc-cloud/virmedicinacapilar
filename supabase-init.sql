-- Supabase SQL para crear la tabla de leads de Vir Medicina Capilar

create table if not exists leads (
  id bigint generated always as identity primary key,
  nombre text not null,
  whatsapp text not null,
  email text,
  edad int,
  comentarios text,
  urls_imagenes text[] not null default array[]::text[],
  respuesta_ia jsonb,
  estado text not null default 'Pendiente',
  created_at timestamp with time zone default timezone('utc', now())
);

create index if not exists leads_whatsapp_idx on leads (whatsapp);
create index if not exists leads_estado_idx on leads (estado);
