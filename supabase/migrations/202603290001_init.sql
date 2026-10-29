-- GearSight initial schema (revised ERD)
-- Apply in Supabase SQL editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users). Password stays on auth.users.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup. first/last name from user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Projects (owner-only access via created_by)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  name text not null,
  address text not null default '',
  lat double precision not null,
  lng double precision not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists projects_created_by_idx on public.projects (created_by);

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = created_by);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = created_by);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = created_by);

-- Helper: project ownership for child tables
create or replace function public.owns_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects
    where id = p_project_id
      and created_by = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Toolbox sessions
-- ---------------------------------------------------------------------------
create table if not exists public.toolbox_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  date_of_application text not null,
  time_of_application text not null,
  permit_receiver text not null default '',
  contractor_company_name text not null default '',
  site_address_name text not null default '',
  work_type text not null check (work_type in ('ground', 'arboreal')),
  required_ppe text[] not null default '{}',
  camera_device_id text,
  camera_label text,
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete cascade
);

create index if not exists toolbox_sessions_project_idx
  on public.toolbox_sessions (project_id);

alter table public.toolbox_sessions enable row level security;

create policy "toolbox_sessions_select_own"
  on public.toolbox_sessions for select
  using (public.owns_project(project_id));

create policy "toolbox_sessions_insert_own"
  on public.toolbox_sessions for insert
  with check (
    public.owns_project(project_id)
    and auth.uid() = created_by
  );

create policy "toolbox_sessions_update_own"
  on public.toolbox_sessions for update
  using (public.owns_project(project_id))
  with check (public.owns_project(project_id));

create policy "toolbox_sessions_delete_own"
  on public.toolbox_sessions for delete
  using (public.owns_project(project_id));

create or replace function public.owns_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.toolbox_sessions s
    join public.projects p on p.id = s.project_id
    where s.id = p_session_id
      and p.created_by = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Session workers (crew for one toolbox session only)
-- ---------------------------------------------------------------------------
create table if not exists public.session_workers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.toolbox_sessions (id) on delete cascade,
  name text not null,
  position text not null
);

create index if not exists session_workers_session_idx
  on public.session_workers (session_id);

alter table public.session_workers enable row level security;

create policy "session_workers_select_own"
  on public.session_workers for select
  using (public.owns_session(session_id));

create policy "session_workers_insert_own"
  on public.session_workers for insert
  with check (public.owns_session(session_id));

create policy "session_workers_update_own"
  on public.session_workers for update
  using (public.owns_session(session_id))
  with check (public.owns_session(session_id));

create policy "session_workers_delete_own"
  on public.session_workers for delete
  using (public.owns_session(session_id));

-- ---------------------------------------------------------------------------
-- Snapshots
-- ---------------------------------------------------------------------------
create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.toolbox_sessions (id) on delete cascade,
  snapshot_code text not null,
  preview_path text,
  image_path text,
  captured_date date,
  captured_time text,
  violation_count int not null default 0,
  status text not null default 'compliant'
    check (status in ('compliant', 'non_compliant', 'needs_checking')),
  created_at timestamptz not null default now()
);

create index if not exists snapshots_session_idx on public.snapshots (session_id);

alter table public.snapshots enable row level security;

create policy "snapshots_select_own"
  on public.snapshots for select
  using (public.owns_session(session_id));

create policy "snapshots_insert_own"
  on public.snapshots for insert
  with check (public.owns_session(session_id));

create policy "snapshots_update_own"
  on public.snapshots for update
  using (public.owns_session(session_id))
  with check (public.owns_session(session_id));

create policy "snapshots_delete_own"
  on public.snapshots for delete
  using (public.owns_session(session_id));

create or replace function public.owns_snapshot(p_snapshot_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.snapshots sn
    where sn.id = p_snapshot_id
      and public.owns_session(sn.session_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- Snapshot people + PPE detections
-- ---------------------------------------------------------------------------
create table if not exists public.snapshot_people (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.snapshots (id) on delete cascade,
  label text not null,
  status text not null default 'needs_checking'
    check (status in ('compliant', 'non_compliant', 'needs_checking')),
  box jsonb
);

create index if not exists snapshot_people_snapshot_idx
  on public.snapshot_people (snapshot_id);

alter table public.snapshot_people enable row level security;

create policy "snapshot_people_select_own"
  on public.snapshot_people for select
  using (public.owns_snapshot(snapshot_id));

create policy "snapshot_people_insert_own"
  on public.snapshot_people for insert
  with check (public.owns_snapshot(snapshot_id));

create policy "snapshot_people_update_own"
  on public.snapshot_people for update
  using (public.owns_snapshot(snapshot_id))
  with check (public.owns_snapshot(snapshot_id));

create policy "snapshot_people_delete_own"
  on public.snapshot_people for delete
  using (public.owns_snapshot(snapshot_id));

create or replace function public.owns_person(p_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.snapshot_people sp
    where sp.id = p_person_id
      and public.owns_snapshot(sp.snapshot_id)
  );
$$;

create table if not exists public.ppe_detections (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.snapshot_people (id) on delete cascade,
  label text not null,
  detected boolean not null default false,
  confidence double precision,
  required_count int,
  detected_count int,
  box jsonb
);

create index if not exists ppe_detections_person_idx
  on public.ppe_detections (person_id);

alter table public.ppe_detections enable row level security;

create policy "ppe_detections_select_own"
  on public.ppe_detections for select
  using (public.owns_person(person_id));

create policy "ppe_detections_insert_own"
  on public.ppe_detections for insert
  with check (public.owns_person(person_id));

create policy "ppe_detections_update_own"
  on public.ppe_detections for update
  using (public.owns_person(person_id))
  with check (public.owns_person(person_id));

create policy "ppe_detections_delete_own"
  on public.ppe_detections for delete
  using (public.owns_person(person_id));

-- ---------------------------------------------------------------------------
-- Worker reports
-- ---------------------------------------------------------------------------
create table if not exists public.worker_reports (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.snapshots (id) on delete cascade,
  reported_by uuid not null references public.profiles (id) on delete cascade,
  person_label text not null,
  person_detection_id text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists worker_reports_snapshot_idx
  on public.worker_reports (snapshot_id);

alter table public.worker_reports enable row level security;

create policy "worker_reports_select_own"
  on public.worker_reports for select
  using (public.owns_snapshot(snapshot_id));

create policy "worker_reports_insert_own"
  on public.worker_reports for insert
  with check (
    public.owns_snapshot(snapshot_id)
    and auth.uid() = reported_by
  );

create policy "worker_reports_delete_own"
  on public.worker_reports for delete
  using (
    public.owns_snapshot(snapshot_id)
    and auth.uid() = reported_by
  );

-- ---------------------------------------------------------------------------
-- Storage: snapshot images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('snapshots', 'snapshots', false)
on conflict (id) do nothing;

create policy "snapshots_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'snapshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "snapshots_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'snapshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "snapshots_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'snapshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "snapshots_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'snapshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
