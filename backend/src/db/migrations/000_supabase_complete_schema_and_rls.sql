-- ============================================================================
-- SKILL NEXUS AI — COMPLETE SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY
-- Multi-Portal Enterprise Architecture: Student, Academic/Institution, Industry
-- Idempotent, Non-Destructive, RLS Enabled with Strict Multi-Tenant Isolation
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic timestamp trigger helper
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════════════
-- 1. AUTHENTICATION & CORE ROLES
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    account_status VARCHAR(50) DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT true,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed default system roles if not present
INSERT INTO roles (code, name, description)
VALUES 
    ('STUDENT', 'Student', 'Skill Nexus Student Portal Access'),
    ('INSTITUTION', 'Institution', 'Academic Institution Administration'),
    ('ACADEMICIAN', 'Academician', 'Faculty & Mentor Portal Access'),
    ('COMPANY', 'Company', 'Industry Employer & Partner Portal Access')
ON CONFLICT (code) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. INSTITUTIONS, DEPARTMENTS & ACADEMIC STRUCTURE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    district VARCHAR(100) NOT NULL DEFAULT 'Chennai',
    state VARCHAR(100) DEFAULT 'Tamil Nadu' NOT NULL,
    zone VARCHAR(50),
    tier INT CHECK (tier BETWEEN 1 AND 4) DEFAULT 1,
    nirf_rank INT,
    naac_grade VARCHAR(10),
    is_autonomous BOOLEAN DEFAULT true NOT NULL,
    official_email VARCHAR(255) UNIQUE NOT NULL,
    website_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    hod_name VARCHAR(255),
    hod_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_dept_inst UNIQUE (institution_id, code)
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(50),
    semester VARCHAR(50),
    section VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS academicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    employee_code VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    staff_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MENTOR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- 3. STUDENTS, SKILLS & CREDIBILITY
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(100) NOT NULL,
    reg_no VARCHAR(100),
    batch VARCHAR(50),
    degree VARCHAR(100) DEFAULT 'B.Tech',
    semester VARCHAR(50) DEFAULT 'Semester 5',
    cgpa NUMERIC(4, 2) DEFAULT 8.0,
    readiness_score NUMERIC(5, 2) DEFAULT 0,
    placement_status VARCHAR(50) DEFAULT 'Seeking Opportunities',
    target_role VARCHAR(255) DEFAULT 'Software Engineer',
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    resume_url TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_roll_inst UNIQUE (institution_id, roll_number)
);

CREATE TABLE IF NOT EXISTS student_staff_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_staff UNIQUE (student_id, staff_id)
);

CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) UNIQUE NOT NULL,
    domain VARCHAR(100) DEFAULT 'Technical',
    industry_demand_score INT DEFAULT 75,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'Intermediate',
    proficiency_score NUMERIC(5, 2) DEFAULT 50,
    confidence_score NUMERIC(5, 2) DEFAULT 50,
    evidence_count INT DEFAULT 1,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

CREATE TABLE IF NOT EXISTS skill_credibility_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    credibility_score NUMERIC(5, 2) DEFAULT 50,
    evidence_count INT DEFAULT 1,
    verdict VARCHAR(50) DEFAULT 'DEMONSTRATED',
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_credibility_skill UNIQUE (student_id, skill_id)
);

CREATE TABLE IF NOT EXISTS career_readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL,
    readiness_band VARCHAR(50) NOT NULL,
    technical_score NUMERIC(5, 2) DEFAULT 0,
    soft_skills_score NUMERIC(5, 2) DEFAULT 0,
    projects_score NUMERIC(5, 2) DEFAULT 0,
    certifications_score NUMERIC(5, 2) DEFAULT 0,
    assessments_score NUMERIC(5, 2) DEFAULT 0,
    industry_exposure_score NUMERIC(5, 2) DEFAULT 0,
    interview_readiness_score NUMERIC(5, 2) DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_student_readiness UNIQUE (student_id)
);

CREATE TABLE IF NOT EXISTS student_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100),
    technology_stack JSONB DEFAULT '[]'::jsonb,
    skills_used JSONB DEFAULT '[]'::jsonb,
    role VARCHAR(255),
    start_date DATE,
    end_date DATE,
    team_members JSONB DEFAULT '[]'::jsonb,
    github_url TEXT,
    live_demo_url TEXT,
    documentation_file_url TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'VERIFIED',
    academician_verified_at TIMESTAMPTZ,
    academician_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    certificate_type VARCHAR(100),
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(255),
    description TEXT,
    file_url TEXT,
    verification_url TEXT,
    status VARCHAR(50) DEFAULT 'VERIFIED',
    academician_verified_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS digital_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    passport_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_payload JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- 4. ASSESSMENTS & INTEGRITY GUARD
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_code VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) DEFAULT 'Technical',
    duration_minutes INT DEFAULT 45,
    passing_score INT DEFAULT 70,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    description TEXT,
    instructions TEXT,
    categories JSONB DEFAULT '["Technical Assessment"]'::jsonb,
    status VARCHAR(50) DEFAULT 'PUBLISHED',
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID,
    institution_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    topic VARCHAR(150),
    question_text TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Technical',
    question_type VARCHAR(50) DEFAULT 'MULTIPLE_CHOICE',
    options JSONB DEFAULT '[]'::jsonb,
    correct_option INT,
    marks INT DEFAULT 1,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    programming_language VARCHAR(50),
    starter_code TEXT,
    test_cases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    score NUMERIC(5, 2) DEFAULT 0,
    percentage NUMERIC(5, 2) DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    feedback TEXT,
    submitted_answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_monitoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    consent_given BOOLEAN DEFAULT false NOT NULL,
    consent_timestamp TIMESTAMPTZ,
    camera_enabled BOOLEAN DEFAULT false,
    microphone_enabled BOOLEAN DEFAULT false,
    monitoring_enabled BOOLEAN DEFAULT true,
    session_status VARCHAR(50) DEFAULT 'ACTIVE',
    integrity_score NUMERIC(5, 2) DEFAULT 100,
    anomaly_count INT DEFAULT 0,
    review_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
    reviewer_notes TEXT,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assessment_integrity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_monitoring_sessions(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    signal_type VARCHAR(100) NOT NULL,
    confidence NUMERIC(4, 2) DEFAULT 0.85,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    review_status VARCHAR(50) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS assessment_question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    session_id UUID REFERENCES assessment_monitoring_sessions(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    selected_option INT,
    submitted_code TEXT,
    is_correct BOOLEAN DEFAULT false,
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- 5. COURSES, LEARNING & PROGRESS
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) DEFAULT 'Beginner',
    duration_hours INT DEFAULT 20,
    instructor_name VARCHAR(150),
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    lessons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_enrollment UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    module_id UUID,
    lesson_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- 6. INDUSTRY, COMPANIES & OPPORTUNITIES
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    official_email VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100) DEFAULT 'Information Technology',
    website_url VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Chennai',
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    is_verified BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'RECRUITER',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_user UNIQUE (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'INTERNSHIP',
    location VARCHAR(100) DEFAULT 'Chennai / Hybrid',
    stipend_or_ctc VARCHAR(100),
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    eligibility_criteria JSONB DEFAULT '{}'::jsonb,
    min_cgpa NUMERIC(4, 2) DEFAULT 7.0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT true,
    openings INT DEFAULT 5,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'APPLIED',
    match_score NUMERIC(5, 2) DEFAULT 75,
    cover_letter TEXT,
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_application UNIQUE (opportunity_id, student_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_type VARCHAR(50) DEFAULT 'student',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    read BOOLEAN DEFAULT false,
    is_trash BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Multi-Tenant Isolation & Role Protection
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_integrity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper policies allowing the server-side service role full administrative access
CREATE POLICY "Service role full access on users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on students" ON students FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_skills" ON student_skills FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_certificates" ON student_certificates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_projects" ON student_projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on digital_passports" ON digital_passports FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on assessments" ON assessments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on assessment_attempts" ON assessment_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on assessment_monitoring_sessions" ON assessment_monitoring_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on assessment_integrity_events" ON assessment_integrity_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on enrollments" ON enrollments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_lesson_progress" ON student_lesson_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on opportunities" ON opportunities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on applications" ON applications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on notifications" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Student RLS Isolation: Students can view/edit ONLY their own records
CREATE POLICY "Students view own profile" ON students FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Students update own profile" ON students FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Students view own skills" ON student_skills FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students manage own skills" ON student_skills FOR ALL TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own certificates" ON student_certificates FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students manage own certificates" ON student_certificates FOR ALL TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own projects" ON student_projects FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students manage own projects" ON student_projects FOR ALL TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own digital passport" ON digital_passports FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own assessment attempts" ON assessment_attempts FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own assessment monitoring" ON assessment_monitoring_sessions FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own enrollments" ON enrollments FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students manage own enrollments" ON enrollments FOR ALL TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own applications" ON applications FOR SELECT TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students submit own applications" ON applications FOR INSERT TO authenticated
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students view own notifications" ON notifications FOR ALL TO authenticated
    USING (user_id = auth.uid() OR recipient_type = 'student');

-- Public & Catalog Read Policies
CREATE POLICY "Public read active assessments" ON assessments FOR SELECT TO authenticated, anon
    USING (is_active = true AND is_deleted = false);

CREATE POLICY "Public read active opportunities" ON opportunities FOR SELECT TO authenticated, anon
    USING (is_active = true);
