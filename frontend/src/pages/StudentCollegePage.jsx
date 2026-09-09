import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building,
  MapPin,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileBadge
} from 'lucide-react';
import { authService } from '../services/authService';

export default function StudentCollegePage({ setActivePage, onShowToast, user }) {
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [loadingCollege, setLoadingCollege] = useState(false);

  // Fallbacks from current student user object
  const collegeName = user?.collegeName || user?.institution || 'SRM Institute of Science and Technology';
  const collegeId = user?.collegeId || user?.institutionId || 'TN010';
  const department = user?.department || 'Computer Science and Engineering';
  const degree = user?.degree || user?.course || 'B.Tech';
  const specialization = user?.specialization || 'Artificial Intelligence & Machine Learning';
  const semester = user?.semester || 'Sem 5';
  const year = user?.year || 'III Year';
  const batch = user?.batch || '2023 - 2027';
  const regNo = user?.regNo || 'RA2311003010482';
  const cgpa = user?.cgpa || '8.85';
  const creditsCompleted = user?.creditsCompleted || 112;
  const totalCredits = user?.totalCredits || 160;
  const backlogs = user?.activeBacklogs || 0;

  useEffect(() => {
    let isMounted = true;
    const fetchCollegeInfo = async () => {
      setLoadingCollege(true);
      try {
        // Try searching by ID or code
        const res = await fetch(`/api/college-master/${encodeURIComponent(collegeId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && isMounted) {
            setCollegeDetails(data.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch additional college master metadata:', err);
      } finally {
        if (isMounted) setLoadingCollege(false);
      }
    };

    fetchCollegeInfo();
    return () => { isMounted = false; };
  }, [collegeId]);

  const district = collegeDetails?.district || user?.district || 'Chengalpattu';
  const code = collegeDetails?.code || collegeId;
  const university = collegeDetails?.university || user?.university || 'Anna University Affiliated';
  const naacGrade = collegeDetails?.naacGrade || 'A++';
  const nirfRank = collegeDetails?.nirfRank || 'Top 50';

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner / Hero Card */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '20px',
          padding: '36px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(13, 148, 136, 0.15) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                flexShrink: 0
              }}
            >
              <GraduationCap size={34} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.4)'
                  }}
                >
                  TNEA CODE: {code}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={13} />
                  REGISTERED PARTNER CAMPUS
                </span>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                {collegeName}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--text-secondary)', fontSize: '13.5px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="var(--cyber-cyan)" />
                  District: <strong style={{ color: 'var(--text-primary)' }}>{district}, Tamil Nadu</strong>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={15} color="var(--brand-primary)" />
                  University: <strong style={{ color: 'var(--text-primary)' }}>{university}</strong>
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActivePage('passport')}
              className="btn-cyber-outline"
              style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FileBadge size={16} />
              Verified Passport
            </button>
            <button
              onClick={() => setActivePage('profile')}
              className="btn-cyber-primary"
              style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Academic Profile
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Student's Academic Enrollment Details & Campus Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Card 1: Student Enrolled Program */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BookOpen size={20} color="var(--cyber-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Enrolled Curriculum
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Program / Degree</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>{degree}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Department</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>{department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Specialization</span>
              <span style={{ fontWeight: 700, color: 'var(--cyber-cyan)', fontSize: '13.5px' }}>{specialization}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Register / Roll No</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{regNo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Batch / Class</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{year} ({semester}) • {batch}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Academic Standing & Credits */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingUp size={20} color="var(--cyber-emerald)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Academic Performance
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CURRENT CGPA</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cyber-emerald)', marginTop: '4px' }}>
                {cgpa} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 10</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ACTIVE BACKLOGS</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: backlogs === 0 ? 'var(--cyber-emerald)' : 'var(--cyber-crimson)', marginTop: '4px' }}>
                {backlogs}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Credit Progression</span>
              <span><strong>{creditsCompleted}</strong> / {totalCredits} Credits</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((creditsCompleted / totalCredits) * 100))}%`,
                  height: '100%',
                  background: 'var(--grad-emerald-teal)',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: College Recognition & Accreditation */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={20} color="var(--cyber-amber)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Campus Recognition
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '10px' }}>
              <CheckCircle2 size={18} color="var(--cyber-emerald)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>NAAC Accreditation</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Grade {naacGrade} Accredited Higher Education Institution</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '10px' }}>
              <CheckCircle2 size={18} color="var(--cyber-emerald)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Autonomous & AICTE Approved</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Affiliated with Tamil Nadu Engineering Directorate</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '10px' }}>
              <Sparkles size={18} color="var(--cyber-cyan)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>SkillNexus Campus Partner</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Direct industry recruitment pipelines enabled</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Placement & Industry Readiness Integration */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              Campus Placement & Internship Drives
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Students from {collegeName} have direct access to exclusive corporate placement drives on SkillNexus AI.
            </p>
          </div>

          <button
            onClick={() => setActivePage('opportunities')}
            className="btn-cyber-primary"
            style={{ padding: '9px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Briefcase size={14} />
            Explore Campus Drives
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            {
              title: 'TCS Digital & Ninja Hiring Drive',
              role: 'Associate Software Engineer',
              status: 'Open for IV Year & III Year',
              badge: 'Campus Partner'
            },
            {
              title: 'Zoho Corporation Developer Trainee',
              role: 'Product Engineer',
              status: 'Applications Verified',
              badge: 'Direct Pipeline'
            },
            {
              title: 'Cognizant GenC Elevate Challenge',
              role: 'Full Stack Specialist',
              status: 'Assessment Live',
              badge: 'TN Engineering Cohort'
            }
          ].map((drive, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  {drive.badge}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--cyber-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                  Active
                </span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {drive.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Role: {drive.role}
              </p>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Eligibility: {drive.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
