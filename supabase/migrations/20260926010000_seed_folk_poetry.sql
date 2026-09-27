begin;

-- Seed the system "Folk poetry" poet, used as the default attribution for
-- poems whose author isn't known.
-- We check for existing row with name_en = 'Folk poetry' to avoid duplicates.
insert into public.poets (name_am, name_en, verified, created_by)
select 'የህዝብ ግጥም', 'Folk poetry', true, null
where not exists (
  select 1 from public.poets where name_en = 'Folk poetry'
);

commit;
