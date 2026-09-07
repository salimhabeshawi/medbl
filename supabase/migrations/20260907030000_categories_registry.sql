begin;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_public" on public.categories
  for select to anon, authenticated using (true);
create policy "categories_insert_staff" on public.categories
  for insert to authenticated
  with check (public.is_staff() and created_by = auth.uid());

grant select on public.categories to anon, authenticated;
grant insert on public.categories to authenticated;

insert into public.categories (name)
values
  ('Love'),
  ('Culture'),
  ('Nature'),
  ('Spirituality'),
  ('Society'),
  ('History'),
  ('Contemporary')
on conflict (name) do nothing;

commit;
