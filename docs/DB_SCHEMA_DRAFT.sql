-- 부모안심90 운영 콘솔 MVP - Supabase(PostgreSQL) 스키마 초안
-- 작성일: 2026-03-07

create extension if not exists pgcrypto;

-- 1) Enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum (
      'new',
      'first_reply',
      'interview_scheduled',
      'interview_completed',
      'waiting_introduction',
      'on_hold'
    );
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'consultation_channel') then
    create type consultation_channel as enum ('phone', 'kakao', 'visit', 'etc');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'note_scope') then
    create type note_scope as enum ('operator', 'partner');
  end if;
end$$;

-- 2) 리드 기본 테이블
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  guardian_name text not null,
  guardian_phone text not null,
  care_recipient_name text,
  care_recipient_age integer,
  care_needs_summary text,
  source text,
  status lead_status not null default 'new',
  status_updated_at timestamptz not null default now(),
  next_contact_date date,
  latest_consulted_at timestamptz,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_next_contact_date on public.leads(next_contact_date);
create index if not exists idx_leads_guardian_name on public.leads(guardian_name);
create index if not exists idx_leads_guardian_phone on public.leads(guardian_phone);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- 3) 상담 기록
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  consulted_at timestamptz not null,
  channel consultation_channel not null default 'phone',
  summary text not null,
  details text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_consultations_lead_id on public.consultations(lead_id);
create index if not exists idx_consultations_consulted_at on public.consultations(consulted_at desc);

drop trigger if exists trg_consultations_set_updated_at on public.consultations;
create trigger trg_consultations_set_updated_at
before update on public.consultations
for each row execute function public.set_updated_at();

-- 4) 보호자 요약 리포트 (리드당 1개)
create table if not exists public.guardian_reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  body text not null default '',
  is_final boolean not null default false,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_guardian_reports_set_updated_at on public.guardian_reports;
create trigger trg_guardian_reports_set_updated_at
before update on public.guardian_reports
for each row execute function public.set_updated_at();

-- 5) 운영/파트너 메모
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  scope note_scope not null default 'operator',
  content text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_notes_lead_id on public.lead_notes(lead_id);
create index if not exists idx_lead_notes_created_at on public.lead_notes(created_at desc);

-- 6) 상태 변경 로그 (선택이지만 MVP 추적성 확보용)
create table if not exists public.lead_status_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_status lead_status,
  to_status lead_status not null,
  changed_at timestamptz not null default now(),
  changed_by text
);

create index if not exists idx_status_logs_lead_id on public.lead_status_logs(lead_id);
create index if not exists idx_status_logs_changed_at on public.lead_status_logs(changed_at desc);

-- 7) RLS (단일 운영자 MVP용 최소 정책)
alter table public.leads enable row level security;
alter table public.consultations enable row level security;
alter table public.guardian_reports enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_status_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'leads' and policyname = 'auth_all_leads'
  ) then
    create policy auth_all_leads on public.leads
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'consultations' and policyname = 'auth_all_consultations'
  ) then
    create policy auth_all_consultations on public.consultations
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'guardian_reports' and policyname = 'auth_all_guardian_reports'
  ) then
    create policy auth_all_guardian_reports on public.guardian_reports
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lead_notes' and policyname = 'auth_all_lead_notes'
  ) then
    create policy auth_all_lead_notes on public.lead_notes
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lead_status_logs' and policyname = 'auth_all_lead_status_logs'
  ) then
    create policy auth_all_lead_status_logs on public.lead_status_logs
      for all to authenticated using (true) with check (true);
  end if;
end$$;
