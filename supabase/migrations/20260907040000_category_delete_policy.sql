begin;

create policy "categories_delete_staff" on public.categories
  for delete to authenticated using (public.is_staff());

grant delete on public.categories to authenticated;

create or replace function public.delete_category(p_category_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Not authorized';
  end if;
  if exists (select 1 from public.poems where category = (select name from public.categories where id = p_category_id))
     or exists (select 1 from public.poem_submissions where category = (select name from public.categories where id = p_category_id)) then
    raise exception 'Category is still used by a poem or submission';
  end if;
  delete from public.categories where id = p_category_id;
end;
$$;

revoke all on function public.delete_category(uuid) from public;
grant execute on function public.delete_category(uuid) to authenticated, service_role;

commit;
