begin;

create or replace function public.update_category(
	p_category_id uuid,
	p_name_am text,
	p_name_en text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if not public.is_staff() then
		raise exception 'Not authorized';
	end if;

	if p_category_id is null
		 or nullif(btrim(p_name_am), '') is null
		 or nullif(btrim(p_name_en), '') is null then
		raise exception 'Both category names are required';
	end if;

	update public.categories
	set name_am = btrim(p_name_am),
			name_en = btrim(p_name_en)
	where id = p_category_id;

	if not found then
		raise exception 'Category not found';
	end if;
end;
$$;

revoke all on function public.update_category(uuid, text, text) from public;
grant execute on function public.update_category(uuid, text, text)
	to authenticated, service_role;

commit;
