-- Monthly salary (integer cents). 0 = not set. Expenses are deducted from it on the dashboard.
alter table public.app_settings
  add column salary_cents bigint not null default 0 check (salary_cents >= 0 and salary_cents <= 9999999999);
