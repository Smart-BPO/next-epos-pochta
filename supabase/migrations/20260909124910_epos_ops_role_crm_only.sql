-- Align ops write RLS with app roles: owner + crm (not content editors).

create or replace function private.is_epos_ops()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.epos_admin_role() in ('owner', 'crm'), false);
$$;
