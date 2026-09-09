-- Add crm role for ops (leads / webapp). Split content vs CRM writes in RLS helpers.

alter table public.epos_admin_users
  drop constraint if exists epos_admin_users_role_check;

alter table public.epos_admin_users
  add constraint epos_admin_users_role_check
  check (role in ('owner', 'editor', 'crm', 'viewer'));

-- Content writes: owner + editor
create or replace function private.is_epos_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.epos_admin_role() in ('owner', 'editor'), false);
$$;

-- Ops writes (leads / webapp shipments): owner + editor + crm
create or replace function private.is_epos_ops()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.epos_admin_role() in ('owner', 'editor', 'crm'), false);
$$;

revoke all on function private.is_epos_ops() from public;
grant execute on function private.is_epos_ops() to authenticated;

drop policy if exists epos_leads_staff_update on public.epos_leads;
create policy epos_leads_staff_update
  on public.epos_leads for update to authenticated
  using (private.is_epos_ops())
  with check (private.is_epos_ops());

drop policy if exists epos_webapp_shipments_staff_update on public.epos_webapp_shipments;
create policy epos_webapp_shipments_staff_update
  on public.epos_webapp_shipments for update to authenticated
  using (private.is_epos_ops())
  with check (private.is_epos_ops());

drop policy if exists epos_webapp_contacts_staff_update on public.epos_webapp_contacts;
create policy epos_webapp_contacts_staff_update
  on public.epos_webapp_contacts for update to authenticated
  using (private.is_epos_ops())
  with check (private.is_epos_ops());
