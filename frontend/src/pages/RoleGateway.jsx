import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  GraduationCap,
  Building2,
  Briefcase,
  BookOpen,
  BarChart3,
  TrendingUp,
  Handshake,
  Lock
} from 'lucide-react';
import './RoleGateway.css';
import SihDemoAccessBar from '../components/auth/SihDemoAccessBar';

export default function RoleGateway({ onSelectRole, onBackToLanding, onShowToast }) {
  const roles = [
    {
      id: 'student',
      badge: 'STUDENT',
      badgeIcon: GraduationCap,
      title: 'Student Login',
      subtitle: 'Build your skills. Track your progress. Shape your future.',
      badgeColor: '#2563EB',
      panelBg: '#EFF6FF',
      panelBorder: '#DBEAFE',
      accentColor: '#2563EB',
      features: [
        'Access learning resources',
        'Track your skill progress',
        'Get industry opportunities'
      ],
      buttonText: 'Login as Student',
      btnClass: 'btn-grad-student'
    },
    {
      id: 'institution',
      badge: 'INSTITUTION',
      badgeIcon: Building2,
      title: 'Institution Login',
      subtitle: 'Manage talent. Build skills. Create opportunities.',
      badgeColor: '#0D9488',
      panelBg: '#F0FDFA',
      panelBorder: '#CCFBF1',
      accentColor: '#0D9488',
      features: [
        'Manage student talent',
        'Post skills & opportunities',
        'Track progress & engagement'
      ],
      buttonText: 'Login as Institution',
      btnClass: 'btn-grad-institution'
    },
    {
      id: 'industry',
      badge: 'INDUSTRY',
      badgeIcon: Briefcase,
      title: 'Industry Login',
      subtitle: 'Find skilled talent. Build stronger teams.',
      badgeColor: '#7C3AED',
      panelBg: '#FAF5FF',
      panelBorder: '#F3E8FF',
      accentColor: '#7C3AED',
      features: [
        'Access verified talent',
        'Post internships & jobs',
        'Collaborate with academia'
      ],
      buttonText: 'Login as Industry',
      btnClass: 'btn-grad-industry'
    },
    {
      id: 'faculty',
      badge: 'FACULTY',
      badgeIcon: BookOpen,
      title: 'Faculty Login',
      subtitle: 'Teach courses. Mentor students. Bridge skill gaps.',
      badgeColor: '#D97706',
      panelBg: '#FFFBEB',
      panelBorder: '#FEF3C7',
      accentColor: '#D97706',
      features: [
        'Curate courses & assessments',
        'Analyze skill gaps vs industry demand',
        'Mentorship & smart recommendations'
      ],
      buttonText: 'Login as Faculty',
      btnClass: 'btn-grad-faculty'
    }
  ];

  return (
    <div className="rg-exact-page">
      {/* Dynamic Curved Fluid Background Waves */}
      <div className="rg-bg-waves" aria-hidden="true">
        <svg
          className="rg-wave-top"
          viewBox="0 0 1440 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-40 80C240 180 520 -20 860 70C1200 160 1340 30 1480 90V0H-40V80Z"
            fill="url(#topWaveGrad1)"
            opacity="0.25"
          />
          <path
            d="M-60 160C220 260 580 40 920 120C1260 200 1380 90 1500 140V0H-60V160Z"
            fill="url(#topWaveGrad2)"
            opacity="0.18"
          />
          <defs>
            <linearGradient id="topWaveGrad1" x1="0" y1="0" x2="1440" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00D9FF" />
              <stop offset="0.5" stopColor="#00539C" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="topWaveGrad2" x1="0" y1="0" x2="1440" y2="300" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1688FF" />
              <stop offset="0.6" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#00D9FF" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="rg-wave-bottom"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 160C320 280 640 80 980 200C1260 300 1380 240 1440 210V320H0V160Z"
            fill="url(#botWaveGrad1)"
            opacity="0.22"
          />
          <path
            d="M0 220C380 140 720 290 1060 180C1320 100 1410 180 1440 190V320H0V220Z"
            fill="url(#botWaveGrad2)"
            opacity="0.28"
          />
          <defs>
            <linearGradient id="botWaveGrad1" x1="0" y1="100" x2="1440" y2="320" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00539C" />
              <stop offset="0.5" stopColor="#1688FF" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="botWaveGrad2" x1="0" y1="150" x2="1440" y2="320" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" />
              <stop offset="0.5" stopColor="#00D9FF" />
              <stop offset="1" stopColor="#1688FF" />
            </linearGradient>
          </defs>
        </svg>

        <div className="rg-ambient-blob blob-blue" />
        <div className="rg-ambient-blob blob-purple" />
        <div className="rg-ambient-blob blob-cyan" />
        <div className="rg-grid-layer" />
      </div>

      {/* Top Brand Bar */}
      <header className="rg-header">
        <div className="rg-header-inner">
          <div
            className="rg-brand"
            onClick={onBackToLanding}
            role="button"
            tabIndex={0}
            title="SkillNexus AI"
          >
            <div className="rg-logo-box">
              <GraduationCap size={18} color="#FFFFFF" />
            </div>
            <span className="rg-brand-text">
              SKILLNEXUS <span className="rg-ai-text">AI</span>
            </span>
          </div>

          <div className="rg-tagline-pill">
            <span>Academic & Industry Talent Platform</span>
          </div>
        </div>
      </header>

      {/* Main Login Viewport */}
      <main className="rg-content">
        {/* Center Hero Section */}
        <section className="rg-hero-block">
          <div className="rg-welcome-kicker">
            UNIFIED TALENT PLATFORM
          </div>
          <h1 className="rg-main-title">
            Select Your Workspace
          </h1>
          <p className="rg-main-subtitle">
            Connect institutional learning programs, faculty supervision, and industry recruitment.
          </p>

          <div className="rg-value-props">
            <span className="rg-vp-label">Verified Skill Credentials</span>
            <span className="rg-vp-divider">•</span>
            <span className="rg-vp-label">Academic Telemetry</span>
            <span className="rg-vp-divider">•</span>
            <span className="rg-vp-label">Direct Hiring Pipeline</span>
          </div>
        </section>

        {/* SIH 2026 LIVE DEMO QUICK ACCESS */}
        <SihDemoAccessBar onSelectRoleWithCreds={(roleId, creds) => onSelectRole(roleId, creds)} onShowToast={onShowToast} />

        {/* 4 Role Cards Grid */}
        <section className="rg-cards-container" aria-label="Role selection cards">
          {roles.map((r) => {
            const BadgeIcon = r.badgeIcon;

            return (
              <article
                key={r.id}
                className={`rg-card rg-card-${r.id}`}
                onClick={() => onSelectRole(r.id)}
              >
                {/* Upper Half: Left Illustration + Right Header */}
                <div className="rg-card-upper">
                  {/* Role Vector Emblem Box */}
                  <div className={`rg-visual-box rg-visual-${r.id}`} style={{
                    width: '100%',
                    height: '130px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: r.panelBg,
                    border: `1px solid ${r.panelBorder}`,
                    overflow: 'hidden'
                  }}>
                    {/* Background geometric accents */}
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%',
                      background: r.accentColor,
                      opacity: 0.1
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-15px',
                      left: '-15px',
                      width: '55px',
                      height: '55px',
                      borderRadius: '50%',
                      background: r.accentColor,
                      opacity: 0.08
                    }} />

                    {/* Central Icon Emblem */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: r.accentColor,
                      border: `1px solid ${r.panelBorder}`,
                      zIndex: 2
                    }}>
                      <BadgeIcon size={28} strokeWidth={2} />
                    </div>

                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: r.accentColor,
                      zIndex: 2
                    }}>
                      {r.badge} PORTAL
                    </div>
                  </div>

                  {/* Right Header Area */}
                  <div className="rg-card-info">
                    <div className="rg-badge-pill">
                      <BadgeIcon size={12} className="rg-badge-icon" />
                      <span>{r.badge}</span>
                    </div>

                    <h2 className="rg-card-title">{r.title}</h2>
                    <p className="rg-card-subtitle">{r.subtitle}</p>
                  </div>
                </div>

                {/* Middle: Checklist Features */}
                <ul className="rg-features-list">
                  {r.features.map((item, index) => (
                    <li key={index} className="rg-feature-item">
                      <div className="rg-check-circle">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="rg-feature-text">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Bottom: Gradient Pill CTA Button */}
                <button
                  type="button"
                  className={`rg-cta-btn ${r.btnClass}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole(r.id);
                  }}
                >
                  <span>{r.buttonText}</span>
                  <ArrowRight size={17} className="rg-btn-arrow" />
                </button>
              </article>
            );
          })}
        </section>

        {/* Safe & Secure Trust Footer */}
        <footer className="rg-trust-footer">
          <div className="rg-trust-line">
            <Lock size={14} color="#218739" />
            <span className="rg-trust-text">
              Secure System &bull; Verified Credentials &bull; ISO &amp; AICTE Aligned
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
