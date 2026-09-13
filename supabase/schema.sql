-- ==============================================================================
-- Excel Insight Platform - Complete Supabase PostgreSQL Schema
-- Includes: Authentication integration, Universal Datasets, Dynamic Columns,
--           Saved Filters, Generated Reports, Audit Logs, Exam Insight Module,
--           Row Level Security (RLS) Policies, Triggers, and Storage Configuration.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

-- Index for fast user search
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. Datasets Table (Saved Excel / CSV datasets for registered users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL,
    storage_path TEXT,
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    sheet_names JSONB NOT NULL DEFAULT '[]'::jsonb,
    active_sheet TEXT,
    summary_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON public.datasets(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. Dataset Columns Table (Metadata & Inferred Schema per column)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataset_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'percentage', 'category', 'boolean')),
    cardinality INTEGER NOT NULL DEFAULT 0,
    min_value TEXT,
    max_value TEXT,
    distinct_values JSONB NOT NULL DEFAULT '[]'::jsonb,
    null_count INTEGER NOT NULL DEFAULT 0,
    sample_values JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dataset_columns_dataset_id ON public.dataset_columns(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_columns_type ON public.dataset_columns(data_type);

-- ------------------------------------------------------------------------------
-- 4. Saved Filters Table (User's custom dynamic filter presets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_dataset_id ON public.saved_filters(dataset_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON public.saved_filters(user_id);

-- ------------------------------------------------------------------------------
-- 5. Generated Reports Table (Universal analysis reports & chart snapshots)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL DEFAULT 'UNIVERSAL',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id ON public.generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_created_at ON public.generated_reports(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. Upload History Table (Auditing uploads, file sizes, processing times)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_type TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
    error_message TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upload_history_user_id ON public.upload_history(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_created_at ON public.upload_history(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. Audit Logs Table (Full administrative & security audit trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 8. Preserved Exam Insight Module Tables (Backward compatibility & specialized tool)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    original_file_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    total_rows_read INTEGER NOT NULL DEFAULT 0,
    schools_detected INTEGER NOT NULL DEFAULT 0,
    subject_attempts_parsed INTEGER NOT NULL DEFAULT 0,
    warning_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    selected_subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analysis_result_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    school_name TEXT NOT NULL,
    zone TEXT,
    province TEXT,
    subject_no TEXT NOT NULL,
    total_did INTEGER NOT NULL DEFAULT 0,
    sat_count INTEGER NOT NULL DEFAULT 0,
    absent_count INTEGER NOT NULL DEFAULT 0,
    a_count INTEGER NOT NULL DEFAULT 0,
    b_count INTEGER NOT NULL DEFAULT 0,
    c_count INTEGER NOT NULL DEFAULT 0,
    s_count INTEGER NOT NULL DEFAULT 0,
    w_count INTEGER NOT NULL DEFAULT 0,
    pass_count INTEGER NOT NULL DEFAULT 0,
    fail_count INTEGER NOT NULL DEFAULT 0,
    pass_percentage TEXT NOT NULL,
    a_percentage TEXT NOT NULL,
    b_percentage TEXT NOT NULL,
    c_percentage TEXT NOT NULL,
    s_percentage TEXT NOT NULL,
    w_percentage TEXT NOT NULL,
    absent_percentage TEXT NOT NULL,
    rank INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_result_rows_result_id ON public.analysis_result_rows(analysis_result_id);
CREATE INDEX IF NOT EXISTS idx_result_rows_subject ON public.analysis_result_rows(subject_no);

-- ------------------------------------------------------------------------------
-- 9. Helper Function: Check If Current User Is Admin
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 10. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_result_rows ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, Admins can view all profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- Datasets: Users can view, insert, update, delete their own datasets; Admins have full access
CREATE POLICY "Users can manage own datasets"
    ON public.datasets FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Dataset Columns: Accessible if user owns parent dataset or is admin
CREATE POLICY "Users can access dataset columns"
    ON public.dataset_columns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.datasets
            WHERE datasets.id = dataset_columns.dataset_id
              AND (datasets.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Saved Filters: Users can manage their own filters
CREATE POLICY "Users can manage own saved filters"
    ON public.saved_filters FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Generated Reports: Users can manage their own reports
CREATE POLICY "Users can manage own generated reports"
    ON public.generated_reports FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Upload History: Users see own upload history; Admins see all
CREATE POLICY "Users can view own upload history"
    ON public.upload_history FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "System can insert upload history"
    ON public.upload_history FOR INSERT
    WITH CHECK (true);

-- Audit Logs: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Allow logging events"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- Exam Analysis Tables: Users can manage own jobs and reports
CREATE POLICY "Exam jobs user policy"
    ON public.analysis_jobs FOR ALL
    USING (auth.uid() = uploaded_by_id OR public.is_admin())
    WITH CHECK (auth.uid() = uploaded_by_id OR public.is_admin());

CREATE POLICY "Exam results user policy"
    ON public.analysis_results FOR ALL
    USING (auth.uid() = created_by_id OR public.is_admin())
    WITH CHECK (auth.uid() = created_by_id OR public.is_admin());

CREATE POLICY "Exam result rows user policy"
    ON public.analysis_result_rows FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_results
            WHERE analysis_results.id = analysis_result_rows.analysis_result_id
              AND (analysis_results.created_by_id = auth.uid() OR public.is_admin())
        )
    );

-- ------------------------------------------------------------------------------
-- 11. Auth Trigger: Automatically create profile on new user signup
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'USER')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 12. Storage Setup: Private bucket for datasets
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'excel-files',
  'excel-files',
  false,
  26214400, -- 25MB maximum limit for registered users
  ARRAY[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv'
  ]
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = 26214400,
    allowed_mime_types = ARRAY[
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];

-- Storage Policies: Users can read and write only their own files in the bucket
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'excel-files' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'excel-files' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'excel-files' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);
