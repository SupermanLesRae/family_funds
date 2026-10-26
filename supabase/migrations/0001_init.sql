-- Fintrack initial schema. Run in the Supabase SQL editor (or `supabase db push`).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 60),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index categories_name_key on public.categories (lower(btrim(name)));

create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 60),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index people_name_key on public.people (lower(btrim(name)));

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 9999999999),
  category_id uuid not null references public.categories (id) on delete restrict,
  person_id uuid not null references public.people (id) on delete restrict,
  description text not null default '' check (length(description) <= 200),
  notes text not null default '' check (length(notes) <= 1000),
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index transactions_date_idx on public.transactions (transaction_date desc);
create index transactions_category_idx on public.transactions (category_id);
create index transactions_person_idx on public.transactions (person_id);

-- Single-row preferences. No credentials live here.
create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  date_format text not null default 'DD/MM/YYYY' check (date_format in ('DD/MM/YYYY', 'YYYY-MM-DD', 'D MMM YYYY')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  default_range text not null default 'this_month'
    check (default_range in ('today', 'this_week', 'this_month', 'last_month', 'this_year', 'all_time')),
  updated_at timestamptz not null default now()
);

-- PIN brute-force tracking. Only the service role (serverless functions) can touch it.
create table public.login_attempts (
  id bigint generated always as identity primary key,
  attempted_at timestamptz not null default now()
);

create function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();
create trigger people_updated before update on public.people for each row execute function public.set_updated_at();
create trigger transactions_updated before update on public.transactions for each row execute function public.set_updated_at();
create trigger app_settings_updated before update on public.app_settings for each row execute function public.set_updated_at();

-- Admin = app_metadata.role = 'admin' (settable only by the service role) AND the default PIN has been replaced.
create function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
     and coalesce(auth.jwt() -> 'app_metadata' ->> 'must_change_pin', 'false') <> 'true'
$$;

alter table public.categories enable row level security;
alter table public.people enable row level security;
alter table public.transactions enable row level security;
alter table public.app_settings enable row level security;
alter table public.login_attempts enable row level security; -- no policies: service role only

create policy admin_all on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.people for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.transactions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.login_attempts from anon, authenticated;
revoke all on public.categories, public.people, public.transactions, public.app_settings from anon;

-- Seed (initial examples, not restrictions)
insert into public.app_settings (id) values (1) on conflict do nothing;
insert into public.categories (name) values
  ('Groceries'), ('Transport'), ('Housing'), ('Utilities'), ('Medical'), ('Education'),
  ('Entertainment'), ('Clothing'), ('Personal Care'), ('Gifts'), ('Household'), ('Other')
on conflict do nothing;
