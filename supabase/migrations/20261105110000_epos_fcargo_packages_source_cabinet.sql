-- Allow catalog packages created from the web cabinet after OTP link.

alter table public.epos_fcargo_packages
  drop constraint if exists epos_fcargo_packages_source_check;

alter table public.epos_fcargo_packages
  add constraint epos_fcargo_packages_source_check
  check (
    source is null
    or source in ('lead', 'webapp', 'pull', 'webhook', 'cabinet')
  );
