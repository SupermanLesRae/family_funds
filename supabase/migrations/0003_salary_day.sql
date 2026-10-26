-- Day of month the salary is paid; the "month" range runs from this day to the day before the next one.
alter table public.app_settings
  add column salary_day smallint not null default 1 check (salary_day between 1 and 31);
