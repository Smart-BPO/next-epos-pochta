ALTER TABLE public.epos_leads ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.epos_leads ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.epos_leads ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;