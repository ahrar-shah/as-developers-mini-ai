create table if not exists public.messages (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_user_id on public.messages (user_id);
