
  create table "public"."admin_artifacts" (
    "id" uuid not null default gen_random_uuid(),
    "run_id" uuid not null,
    "kind" text not null,
    "source_url" text,
    "storage_path" text,
    "content" text,
    "meta" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."admin_candidates" (
    "id" uuid not null default gen_random_uuid(),
    "run_id" uuid not null,
    "source_id" uuid not null,
    "artifact_id" uuid,
    "evidence_kind" text not null,
    "extracted_json" jsonb not null default '{}'::jsonb,
    "review_status" text not null default 'pending'::text,
    "review_notes" text,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."admin_runs" (
    "id" uuid not null default gen_random_uuid(),
    "source_id" uuid not null,
    "status" text not null default 'running'::text,
    "started_at" timestamp with time zone not null default now(),
    "ended_at" timestamp with time zone,
    "counts" jsonb not null default '{}'::jsonb,
    "error" text,
    "log" text
      );



  create table "public"."admin_sources" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "adapter_type" text not null,
    "enabled" boolean default true,
    "schedule_type" text default 'manual'::text,
    "interval_minutes" integer,
    "params" jsonb not null default '{}'::jsonb,
    "last_run_at" timestamp with time zone,
    "next_run_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."alert_matches" (
    "id" uuid not null default gen_random_uuid(),
    "alert_id" uuid,
    "event_id" uuid not null,
    "matched_at" timestamp with time zone default now()
      );


alter table "public"."alert_matches" enable row level security;


  create table "public"."alerts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "criteria" jsonb not null default '{}'::jsonb,
    "frequency" text not null default 'daily'::text,
    "is_active" boolean not null default true,
    "last_checked_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."alerts" enable row level security;


  create table "public"."event_divisions" (
    "division_fingerprint" text not null,
    "event_fingerprint" text not null,
    "age" text,
    "level" text,
    "entry_fee" integer,
    "gate_fee" integer,
    "pay_at_plate_fee" integer,
    "games_guaranteed" integer,
    "registration_status" text,
    "payload" jsonb not null,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."event_divisions" enable row level security;


  create table "public"."events" (
    "event_fingerprint" text not null,
    "site_slug" text not null,
    "event_url" text not null,
    "name" text,
    "start_date" date,
    "end_date" date,
    "date_text" text,
    "city" text,
    "state" text,
    "latitude" double precision,
    "longitude" double precision,
    "season_year" integer,
    "season_name" text,
    "payload" jsonb not null,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."events" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "alert_id" uuid,
    "type" text not null default 'alert_email'::text,
    "status" text not null default 'queued'::text,
    "payload" jsonb not null default '{}'::jsonb,
    "error" text,
    "created_at" timestamp with time zone default now(),
    "sent_at" timestamp with time zone
      );


alter table "public"."notifications" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" text not null,
    "display_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."subscriptions" (
    "user_id" uuid not null,
    "paddle_customer_id" text,
    "paddle_subscription_id" text,
    "status" text,
    "current_period_end" timestamp with time zone,
    "plan_id" text,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."subscriptions" enable row level security;


  create table "public"."zip_codes" (
    "zip" text not null,
    "city" text,
    "state" text,
    "latitude" double precision,
    "longitude" double precision
      );


alter table "public"."zip_codes" enable row level security;

CREATE UNIQUE INDEX admin_artifacts_pkey ON public.admin_artifacts USING btree (id);

CREATE INDEX admin_artifacts_run_id_idx ON public.admin_artifacts USING btree (run_id);

CREATE UNIQUE INDEX admin_candidates_pkey ON public.admin_candidates USING btree (id);

CREATE INDEX admin_candidates_review_status_created_at_idx ON public.admin_candidates USING btree (review_status, created_at DESC);

CREATE INDEX admin_candidates_source_id_created_at_idx ON public.admin_candidates USING btree (source_id, created_at DESC);

CREATE UNIQUE INDEX admin_runs_pkey ON public.admin_runs USING btree (id);

CREATE INDEX admin_runs_source_id_started_at_idx ON public.admin_runs USING btree (source_id, started_at DESC);

CREATE UNIQUE INDEX admin_sources_pkey ON public.admin_sources USING btree (id);

CREATE UNIQUE INDEX alert_matches_alert_id_event_id_key ON public.alert_matches USING btree (alert_id, event_id);

CREATE UNIQUE INDEX alert_matches_pkey ON public.alert_matches USING btree (id);

CREATE UNIQUE INDEX alerts_pkey ON public.alerts USING btree (id);

CREATE INDEX divisions_age_idx ON public.event_divisions USING btree (age);

CREATE INDEX divisions_event_idx ON public.event_divisions USING btree (event_fingerprint);

CREATE INDEX divisions_fee_idx ON public.event_divisions USING btree (entry_fee);

CREATE INDEX divisions_level_idx ON public.event_divisions USING btree (level);

CREATE UNIQUE INDEX event_divisions_pkey ON public.event_divisions USING btree (division_fingerprint);

CREATE INDEX events_lat_lon_idx ON public.events USING btree (latitude, longitude);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (event_fingerprint);

CREATE INDEX events_season_idx ON public.events USING btree (season_year, season_name);

CREATE INDEX events_start_date_idx ON public.events USING btree (start_date);

CREATE INDEX events_state_idx ON public.events USING btree (state);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (user_id);

CREATE INDEX zip_codes_lat_lon_idx ON public.zip_codes USING btree (latitude, longitude);

CREATE UNIQUE INDEX zip_codes_pkey ON public.zip_codes USING btree (zip);

alter table "public"."admin_artifacts" add constraint "admin_artifacts_pkey" PRIMARY KEY using index "admin_artifacts_pkey";

alter table "public"."admin_candidates" add constraint "admin_candidates_pkey" PRIMARY KEY using index "admin_candidates_pkey";

alter table "public"."admin_runs" add constraint "admin_runs_pkey" PRIMARY KEY using index "admin_runs_pkey";

alter table "public"."admin_sources" add constraint "admin_sources_pkey" PRIMARY KEY using index "admin_sources_pkey";

alter table "public"."alert_matches" add constraint "alert_matches_pkey" PRIMARY KEY using index "alert_matches_pkey";

alter table "public"."alerts" add constraint "alerts_pkey" PRIMARY KEY using index "alerts_pkey";

alter table "public"."event_divisions" add constraint "event_divisions_pkey" PRIMARY KEY using index "event_divisions_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."zip_codes" add constraint "zip_codes_pkey" PRIMARY KEY using index "zip_codes_pkey";

alter table "public"."admin_artifacts" add constraint "admin_artifacts_run_id_fkey" FOREIGN KEY (run_id) REFERENCES public.admin_runs(id) ON DELETE CASCADE not valid;

alter table "public"."admin_artifacts" validate constraint "admin_artifacts_run_id_fkey";

alter table "public"."admin_candidates" add constraint "admin_candidates_artifact_id_fkey" FOREIGN KEY (artifact_id) REFERENCES public.admin_artifacts(id) ON DELETE SET NULL not valid;

alter table "public"."admin_candidates" validate constraint "admin_candidates_artifact_id_fkey";

alter table "public"."admin_candidates" add constraint "admin_candidates_run_id_fkey" FOREIGN KEY (run_id) REFERENCES public.admin_runs(id) ON DELETE CASCADE not valid;

alter table "public"."admin_candidates" validate constraint "admin_candidates_run_id_fkey";

alter table "public"."admin_candidates" add constraint "admin_candidates_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.admin_sources(id) ON DELETE CASCADE not valid;

alter table "public"."admin_candidates" validate constraint "admin_candidates_source_id_fkey";

alter table "public"."admin_runs" add constraint "admin_runs_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.admin_sources(id) ON DELETE CASCADE not valid;

alter table "public"."admin_runs" validate constraint "admin_runs_source_id_fkey";

alter table "public"."alert_matches" add constraint "alert_matches_alert_id_event_id_key" UNIQUE using index "alert_matches_alert_id_event_id_key";

alter table "public"."alert_matches" add constraint "alert_matches_alert_id_fkey" FOREIGN KEY (alert_id) REFERENCES public.alerts(id) ON DELETE CASCADE not valid;

alter table "public"."alert_matches" validate constraint "alert_matches_alert_id_fkey";

alter table "public"."alerts" add constraint "alerts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."alerts" validate constraint "alerts_user_id_fkey";

alter table "public"."event_divisions" add constraint "event_divisions_event_fingerprint_fkey" FOREIGN KEY (event_fingerprint) REFERENCES public.events(event_fingerprint) ON DELETE CASCADE not valid;

alter table "public"."event_divisions" validate constraint "event_divisions_event_fingerprint_fkey";

alter table "public"."notifications" add constraint "notifications_alert_id_fkey" FOREIGN KEY (alert_id) REFERENCES public.alerts(id) ON DELETE SET NULL not valid;

alter table "public"."notifications" validate constraint "notifications_alert_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_pro(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select
    coalesce(
      (
        select
          s.status in ('active', 'trialing')
          and (s.current_period_end is null or s.current_period_end > now())
        from public.subscriptions s
        where s.user_id = p_user_id
        limit 1
      ),
      false
    );
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_username_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.username is distinct from old.username then
    raise exception 'username cannot be changed';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.search_events(p_query text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id text, name text, start_date date, end_date date, city text, state text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with pro as (
    select public.is_pro(auth.uid()) as is_pro
  )
  select
    e.event_fingerprint as id,
    e.name,
    e.start_date,
    e.end_date,
    e.city,
    e.state
  from public.events e
  cross join pro
  where
    (p_query is null or e.name ilike ('%' || p_query || '%'))
    and (p_state is null or e.state = p_state)
    and (p_date_from is null or e.start_date >= p_date_from)
    and (p_date_to is null or e.start_date <= p_date_to)
    and (
      pro.is_pro
      or (
        e.start_date <= (current_date + interval '45 days')
        and e.start_date >= (current_date - interval '2 days')
      )
    )
  order by e.start_date asc, e.name asc
  limit p_limit
  offset p_offset;
$function$
;

CREATE OR REPLACE FUNCTION public.set_admin_sources_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."admin_artifacts" to "anon";

grant insert on table "public"."admin_artifacts" to "anon";

grant references on table "public"."admin_artifacts" to "anon";

grant select on table "public"."admin_artifacts" to "anon";

grant trigger on table "public"."admin_artifacts" to "anon";

grant truncate on table "public"."admin_artifacts" to "anon";

grant update on table "public"."admin_artifacts" to "anon";

grant delete on table "public"."admin_artifacts" to "authenticated";

grant insert on table "public"."admin_artifacts" to "authenticated";

grant references on table "public"."admin_artifacts" to "authenticated";

grant select on table "public"."admin_artifacts" to "authenticated";

grant trigger on table "public"."admin_artifacts" to "authenticated";

grant truncate on table "public"."admin_artifacts" to "authenticated";

grant update on table "public"."admin_artifacts" to "authenticated";

grant delete on table "public"."admin_artifacts" to "service_role";

grant insert on table "public"."admin_artifacts" to "service_role";

grant references on table "public"."admin_artifacts" to "service_role";

grant select on table "public"."admin_artifacts" to "service_role";

grant trigger on table "public"."admin_artifacts" to "service_role";

grant truncate on table "public"."admin_artifacts" to "service_role";

grant update on table "public"."admin_artifacts" to "service_role";

grant delete on table "public"."admin_candidates" to "anon";

grant insert on table "public"."admin_candidates" to "anon";

grant references on table "public"."admin_candidates" to "anon";

grant select on table "public"."admin_candidates" to "anon";

grant trigger on table "public"."admin_candidates" to "anon";

grant truncate on table "public"."admin_candidates" to "anon";

grant update on table "public"."admin_candidates" to "anon";

grant delete on table "public"."admin_candidates" to "authenticated";

grant insert on table "public"."admin_candidates" to "authenticated";

grant references on table "public"."admin_candidates" to "authenticated";

grant select on table "public"."admin_candidates" to "authenticated";

grant trigger on table "public"."admin_candidates" to "authenticated";

grant truncate on table "public"."admin_candidates" to "authenticated";

grant update on table "public"."admin_candidates" to "authenticated";

grant delete on table "public"."admin_candidates" to "service_role";

grant insert on table "public"."admin_candidates" to "service_role";

grant references on table "public"."admin_candidates" to "service_role";

grant select on table "public"."admin_candidates" to "service_role";

grant trigger on table "public"."admin_candidates" to "service_role";

grant truncate on table "public"."admin_candidates" to "service_role";

grant update on table "public"."admin_candidates" to "service_role";

grant delete on table "public"."admin_runs" to "anon";

grant insert on table "public"."admin_runs" to "anon";

grant references on table "public"."admin_runs" to "anon";

grant select on table "public"."admin_runs" to "anon";

grant trigger on table "public"."admin_runs" to "anon";

grant truncate on table "public"."admin_runs" to "anon";

grant update on table "public"."admin_runs" to "anon";

grant delete on table "public"."admin_runs" to "authenticated";

grant insert on table "public"."admin_runs" to "authenticated";

grant references on table "public"."admin_runs" to "authenticated";

grant select on table "public"."admin_runs" to "authenticated";

grant trigger on table "public"."admin_runs" to "authenticated";

grant truncate on table "public"."admin_runs" to "authenticated";

grant update on table "public"."admin_runs" to "authenticated";

grant delete on table "public"."admin_runs" to "service_role";

grant insert on table "public"."admin_runs" to "service_role";

grant references on table "public"."admin_runs" to "service_role";

grant select on table "public"."admin_runs" to "service_role";

grant trigger on table "public"."admin_runs" to "service_role";

grant truncate on table "public"."admin_runs" to "service_role";

grant update on table "public"."admin_runs" to "service_role";

grant delete on table "public"."admin_sources" to "anon";

grant insert on table "public"."admin_sources" to "anon";

grant references on table "public"."admin_sources" to "anon";

grant select on table "public"."admin_sources" to "anon";

grant trigger on table "public"."admin_sources" to "anon";

grant truncate on table "public"."admin_sources" to "anon";

grant update on table "public"."admin_sources" to "anon";

grant delete on table "public"."admin_sources" to "authenticated";

grant insert on table "public"."admin_sources" to "authenticated";

grant references on table "public"."admin_sources" to "authenticated";

grant select on table "public"."admin_sources" to "authenticated";

grant trigger on table "public"."admin_sources" to "authenticated";

grant truncate on table "public"."admin_sources" to "authenticated";

grant update on table "public"."admin_sources" to "authenticated";

grant delete on table "public"."admin_sources" to "service_role";

grant insert on table "public"."admin_sources" to "service_role";

grant references on table "public"."admin_sources" to "service_role";

grant select on table "public"."admin_sources" to "service_role";

grant trigger on table "public"."admin_sources" to "service_role";

grant truncate on table "public"."admin_sources" to "service_role";

grant update on table "public"."admin_sources" to "service_role";

grant delete on table "public"."alert_matches" to "anon";

grant insert on table "public"."alert_matches" to "anon";

grant references on table "public"."alert_matches" to "anon";

grant select on table "public"."alert_matches" to "anon";

grant trigger on table "public"."alert_matches" to "anon";

grant truncate on table "public"."alert_matches" to "anon";

grant update on table "public"."alert_matches" to "anon";

grant delete on table "public"."alert_matches" to "authenticated";

grant insert on table "public"."alert_matches" to "authenticated";

grant references on table "public"."alert_matches" to "authenticated";

grant select on table "public"."alert_matches" to "authenticated";

grant trigger on table "public"."alert_matches" to "authenticated";

grant truncate on table "public"."alert_matches" to "authenticated";

grant update on table "public"."alert_matches" to "authenticated";

grant delete on table "public"."alert_matches" to "service_role";

grant insert on table "public"."alert_matches" to "service_role";

grant references on table "public"."alert_matches" to "service_role";

grant select on table "public"."alert_matches" to "service_role";

grant trigger on table "public"."alert_matches" to "service_role";

grant truncate on table "public"."alert_matches" to "service_role";

grant update on table "public"."alert_matches" to "service_role";

grant delete on table "public"."alerts" to "anon";

grant insert on table "public"."alerts" to "anon";

grant references on table "public"."alerts" to "anon";

grant select on table "public"."alerts" to "anon";

grant trigger on table "public"."alerts" to "anon";

grant truncate on table "public"."alerts" to "anon";

grant update on table "public"."alerts" to "anon";

grant delete on table "public"."alerts" to "authenticated";

grant insert on table "public"."alerts" to "authenticated";

grant references on table "public"."alerts" to "authenticated";

grant select on table "public"."alerts" to "authenticated";

grant trigger on table "public"."alerts" to "authenticated";

grant truncate on table "public"."alerts" to "authenticated";

grant update on table "public"."alerts" to "authenticated";

grant delete on table "public"."alerts" to "service_role";

grant insert on table "public"."alerts" to "service_role";

grant references on table "public"."alerts" to "service_role";

grant select on table "public"."alerts" to "service_role";

grant trigger on table "public"."alerts" to "service_role";

grant truncate on table "public"."alerts" to "service_role";

grant update on table "public"."alerts" to "service_role";

grant delete on table "public"."event_divisions" to "anon";

grant insert on table "public"."event_divisions" to "anon";

grant references on table "public"."event_divisions" to "anon";

grant select on table "public"."event_divisions" to "anon";

grant trigger on table "public"."event_divisions" to "anon";

grant truncate on table "public"."event_divisions" to "anon";

grant update on table "public"."event_divisions" to "anon";

grant delete on table "public"."event_divisions" to "authenticated";

grant insert on table "public"."event_divisions" to "authenticated";

grant references on table "public"."event_divisions" to "authenticated";

grant select on table "public"."event_divisions" to "authenticated";

grant trigger on table "public"."event_divisions" to "authenticated";

grant truncate on table "public"."event_divisions" to "authenticated";

grant update on table "public"."event_divisions" to "authenticated";

grant delete on table "public"."event_divisions" to "service_role";

grant insert on table "public"."event_divisions" to "service_role";

grant references on table "public"."event_divisions" to "service_role";

grant select on table "public"."event_divisions" to "service_role";

grant trigger on table "public"."event_divisions" to "service_role";

grant truncate on table "public"."event_divisions" to "service_role";

grant update on table "public"."event_divisions" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."zip_codes" to "anon";

grant insert on table "public"."zip_codes" to "anon";

grant references on table "public"."zip_codes" to "anon";

grant select on table "public"."zip_codes" to "anon";

grant trigger on table "public"."zip_codes" to "anon";

grant truncate on table "public"."zip_codes" to "anon";

grant update on table "public"."zip_codes" to "anon";

grant delete on table "public"."zip_codes" to "authenticated";

grant insert on table "public"."zip_codes" to "authenticated";

grant references on table "public"."zip_codes" to "authenticated";

grant select on table "public"."zip_codes" to "authenticated";

grant trigger on table "public"."zip_codes" to "authenticated";

grant truncate on table "public"."zip_codes" to "authenticated";

grant update on table "public"."zip_codes" to "authenticated";

grant delete on table "public"."zip_codes" to "service_role";

grant insert on table "public"."zip_codes" to "service_role";

grant references on table "public"."zip_codes" to "service_role";

grant select on table "public"."zip_codes" to "service_role";

grant trigger on table "public"."zip_codes" to "service_role";

grant truncate on table "public"."zip_codes" to "service_role";

grant update on table "public"."zip_codes" to "service_role";


  create policy "alert_matches_select_own"
  on "public"."alert_matches"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.alerts
  WHERE ((alerts.id = alert_matches.alert_id) AND (alerts.user_id = auth.uid())))));



  create policy "alerts_delete_own"
  on "public"."alerts"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "alerts_insert_own"
  on "public"."alerts"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "alerts_select_own"
  on "public"."alerts"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "alerts_update_own"
  on "public"."alerts"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "event_divisions_select_public"
  on "public"."event_divisions"
  as permissive
  for select
  to public
using (true);



  create policy "events_select_public"
  on "public"."events"
  as permissive
  for select
  to public
using (true);



  create policy "notifications_select_own"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "profiles_insert_own"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((id = auth.uid()));



  create policy "profiles_select_own"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((id = auth.uid()));



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((id = auth.uid()))
with check ((id = auth.uid()));



  create policy "subscriptions_select_own"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "zip_codes_select_public"
  on "public"."zip_codes"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER admin_sources_set_updated_at BEFORE UPDATE ON public.admin_sources FOR EACH ROW EXECUTE FUNCTION public.set_admin_sources_updated_at();

CREATE TRIGGER prevent_username_change BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_username_change();

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


