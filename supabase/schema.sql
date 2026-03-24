create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum (
      '신규',
      '1차답장',
      '인터뷰예정',
      '인터뷰완료',
      '소개대기',
      '보류'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'note_type') then
    create type note_type as enum ('operator', 'partner');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  guardian_name text not null,
  phone text not null,
  guardian_relationship text,
  care_recipient_name text,
  care_recipient_age_group text,
  current_situation_summary text not null,
  source text not null,
  status lead_status not null default '신규',
  next_contact_date date,
  key_issues text,
  consultation_memo text,
  hospital_name text,
  department_info text,
  examination_required boolean,
  mobility_level text,
  payment_assistance_required boolean,
  transport_method text,
  accompaniment_scope text,
  is_high_risk boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  consulted_at timestamptz not null,
  channel text,
  summary text not null,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  current_situation text not null default '',
  this_week_tasks text not null default '',
  hospital_schedule text not null default '',
  needed_help text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  note_type note_type not null default 'operator',
  content text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_tier') then
    create type plan_tier as enum ('basic', 'standard', 'premium');
  end if;
end
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan plan_tier not null default 'basic',
  max_leads integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_organizations_set_updated_at on public.organizations;
create trigger trg_organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_next_contact_date on public.leads(next_contact_date);
create index if not exists idx_consultations_lead_id on public.consultations(lead_id);
create index if not exists idx_notes_lead_id on public.notes(lead_id);

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists trg_reports_set_updated_at on public.reports;
create trigger trg_reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();
