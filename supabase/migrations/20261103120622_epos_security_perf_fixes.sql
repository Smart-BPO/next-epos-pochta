-- Harden SECURITY DEFINER claim RPC: service role / owner only.
revoke execute on function public.epos_fcargo_webhook_inbox_claim(integer) from public;
revoke execute on function public.epos_fcargo_webhook_inbox_claim(integer) from anon;
revoke execute on function public.epos_fcargo_webhook_inbox_claim(integer) from authenticated;
grant execute on function public.epos_fcargo_webhook_inbox_claim(integer) to service_role;

-- Audit log actor lookups.
create index if not exists epos_admin_audit_log_actor_idx
  on public.epos_admin_audit_log (actor_user_id);

-- Avoid per-row re-evaluation of auth.uid() in RLS.
drop policy if exists epos_admin_users_select_own_or_staff on public.epos_admin_users;
create policy epos_admin_users_select_own_or_staff
  on public.epos_admin_users for select to authenticated
  using (user_id = (select auth.uid()) or private.is_epos_admin());
