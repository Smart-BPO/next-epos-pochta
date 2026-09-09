-- News CMS: SEO fields, tags, OG image, cover alt, noindex

alter table public.epos_news_articles
  add column if not exists tags text[] not null default '{}',
  add column if not exists cover_alt text not null default '',
  add column if not exists og_image text,
  add column if not exists noindex boolean not null default false;

alter table public.epos_news_translations
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists og_title text not null default '',
  add column if not exists og_description text not null default '';
