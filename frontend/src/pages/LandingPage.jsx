import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  Users,
  BarChart3,
  Network,
  ChevronRight,
  Globe,
  Lock
} from 'lucide-react';
import './LandingPage.css';

// Import our 3D illustrations
import studentImg from '../assets/illus/student_card.jpg';
import institutionImg from '../assets/illus/institution_card.jpg';
import industryImg from '../assets/illus/industry_card.jpg';
import facultyImg from '../assets/illus/faculty_card.jpg';

export default function LandingPage({ onGetStarted, onSelectRole }) {
  const [activeTab, setActiveTab] = useState('all');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const roleCards = [
    {
      id: 'student',
      role: 'Student',
      badge: 'STUDENT',
      color: '#00D9FF',
      gradientBorder: 'linear-gradient(135deg, rgba(0, 217, 255, 0.6), rgba(0, 83, 156, 0.2))',
      image: studentImg,
      tagline: 'Build your skills. Track your progress. Discover opportunities.',
      description: 'Unlock personalized AI learning paths, verify your practical competencies, and match with verified internships and full-time careers.',
      features: [
        'AI Skill Gap Diagnostics & Career Roadmaps',
        'Cryptographic Digital Skill Passport',
        'Direct Industry Opportunities & Hackathons'
      ],
      cta: 'Explore as Student'
    },
    {
      id: 'institution',
      role: 'Institution',
      badge: 'INSTITUTION',
      color: '#19D3AE',
      gradientBorder: 'linear-gradient(135deg, rgba(25, 211, 174, 0.6), rgba(0, 180, 216, 0.2))',
      image: institutionImg,
      tagline: 'Manage student talent. Build skills. Connect with industry.',
      description: 'Equip educators and placement cells with real-time cohort analytics, automated curriculum-market alignment, and campus recruitment pipelines.',
      features: [
        'Real-time Cohort Readiness Telemetry',
        'Industry-Aligned Curriculum Mapping',
        'Automated Placement Drives & Verification'
      ],
      cta: 'Explore for Institutions'
    },
    {
      id: 'industry',
      role: 'Industry',
      badge: 'INDUSTRY',
      color: '#E879F9',
      gradientBorder: 'linear-gradient(135deg, rgba(232, 121, 249, 0.6), rgba(124, 58, 237, 0.2))',
      image: industryImg,
      tagline: 'Discover verified talent. Post opportunities. Build stronger teams.',
      description: 'Eliminate hiring friction with tamper-evident student skill proofs, AI candidate matching, and automated university recruitment drives.',
      features: [
        'Access Evidence-Backed Verified Talent',
        'Post High-Yield Jobs & Internships',
        'Direct Collaboration with Top Academia'
      ],
      cta: 'Explore for Industry'
    },
    {
      id: 'faculty',
      role: 'Faculty',
      badge: 'FACULTY',
      color: '#F59E0B',
      gradientBorder: 'linear-gradient(135deg, rgba(245, 158, 11, 0.6), rgba(217, 119, 6, 0.2))',
      image: facultyImg,
      tagline: 'Teach courses. Mentor students. Bridge skill gaps.',
      description: 'Equip faculty with student progress telemetry, automated skill gap diagnostics, course & assessment authoring, and structured mentorship tools.',
      features: [
        'Curate Courses & Verified Assessments',
        'Analyze Real-Time Skill Gaps vs Industry Demand',
        'Mentorship Hub & Smart Recommendations'
      ],
      cta: 'Explore for Faculty'
    }
  ];

  const ecosystemSteps = [
    { num: '01', title: 'Student', subtitle: 'Learner Onboarding', icon: GraduationCap, color: '#00D9FF' },
    { num: '02', title: 'Skills', subtitle: 'Competency Mapping', icon: Cpu, color: '#1688FF' },
    { num: '03', title: 'Learning', subtitle: 'Adaptive AI Modules', icon: Zap, color: '#00539C' },
    { num: '04', title: 'Assessment', subtitle: 'Rigorous Verification', icon: Award, color: '#19D3AE' },
    { num: '05', title: 'Projects', subtitle: 'Proof of Execution', icon: Layers, color: '#7C3AED' },
    { num: '06', title: 'Industry', subtitle: 'Direct Demand Matching', icon: Building2, color: '#8B5CF6' },
    { num: '07', title: 'Career', subtitle: 'Verified Placement', icon: Briefcase, color: '#FFD662' }
  ];

  const capabilities = [
    {
      icon: Cpu,
      title: 'AI Skill Gap Diagnostic',
      desc: 'Deep continuous analysis comparing current learner competencies against real-time live enterprise hiring requisites.',
      pill: 'Neural Mapping',
      color: '#00D9FF'
    },
    {
      icon: ShieldCheck,
      title: 'Digital Skill Passport',
      desc: 'Tamper-proof, cryptographically signed record of projects, peer reviews, course completions, and assessment milestones.',
      pill: 'Zero-Trust Verifiable',
      color: '#19D3AE'
    },
    {
      icon: TrendingUp,
      title: 'Market Demand Radar',
      desc: 'Real-time telemetry tracking top in-demand programming stacks, frameworks, and job role shifts across 300+ enterprise partners.',
      pill: 'Live Telemetry',
      color: '#FFD662'
    },
    {
      icon: Users,
      title: 'Placement Orchestration',
      desc: 'Automated matching connecting verified student talent with corporate job requisitions with transparent qualification scoring.',
      pill: 'Direct Pipeline',
      color: '#E879F9'
    }
  ];

  return (
    <div className="lp-universe">
      {/* Dynamic Futuristic Atmosphere Background */}
      <div className="lp-ambient-backdrop" aria-hidden="true">
        <div className="lp-radial-blob lp-blob-top" />
        <div className="lp-radial-blob lp-blob-mid" />
        <div className="lp-radial-blob lp-blob-bot" />
        <div className="lp-grid-matrix" />
        <div className="lp-stars-layer" />

        {/* Layered Abstract Wave Ribbons */}
        <svg
          className="lp-ribbon-wave top-ribbon"
          viewBox="0 0 1440 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-50 120C280 240 600 -10 940 90C1280 190 1380 40 1500 80V0H-50V120Z"
            fill="url(#lpGradTop)"
            opacity="0.22"
          />
          <defs>
            <linearGradient id="lpGradTop" x1="0" y1="0" x2="1440" y2="250" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00D9FF" />
              <stop offset="0.5" stopColor="#00539C" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="lp-ribbon-wave bottom-ribbon"
          viewBox="0 0 1440 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 180C340 300 680 90 1020 220C1280 320 1390 260 1450 220V380H0V180Z"
            fill="url(#lpGradBot)"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="lpGradBot" x1="0" y1="120" x2="1440" y2="380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00539C" />
              <stop offset="0.5" stopColor="#1688FF" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PREMIUM TOP NAVIGATION HEADER
          ══════════════════════════════════════════════════════════════ */}
      <header className="lp-nav-header">
        <div className="lp-nav-container">
          {/* Brand Logo */}
          <div className="lp-brand-unit" onClick={onGetStarted} role="button" tabIndex={0}>
            <div className="lp-logo-symbol">
              <svg viewBox="0 0 24 24" fill="none" className="lp-bolt-svg">
                <path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="lp-brand-words">
              <span className="lp-brand-skillnexus">SKILLNEXUS</span>
              <span className="lp-brand-ai">AI</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="lp-nav-links" aria-label="Landing navigation">
            <button type="button" onClick={() => scrollToSection('features')} className="lp-nav-link">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('ecosystem')} className="lp-nav-link">
              AI Ecosystem
            </button>
            <button type="button" onClick={() => scrollToSection('roles')} className="lp-nav-link">
              For Roles
            </button>
            <button type="button" onClick={() => scrollToSection('impact')} className="lp-nav-link">
              Impact
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="lp-nav-actions">
            <div className="lp-nav-pill-tagline">
              <Sparkles size={13} className="lp-pill-sparkle" />
              <span>Where Skills Meet Opportunities</span>
            </div>

            <button
              type="button"
              className="lp-btn-get-started"
              onClick={onGetStarted}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════════════ */}
      <section className="lp-hero-zone">
        <div className="lp-hero-inner">
          <div className="lp-hero-kicker">
            <span className="lp-kicker-dash">—</span> WELCOME TO <span className="lp-kicker-dash">—</span>
          </div>

          <h1 className="lp-hero-headline">
            SkillNexus <span className="lp-headline-ai">AI</span>
          </h1>

          <p className="lp-hero-subhead">
            Bridge the gap between skills, education and industry.
          </p>

          {/* Three Value Propositions */}
          <div className="lp-value-bar">
            <div className="lp-vp-unit">
              <span className="lp-vp-icon">🎓</span>
              <span className="lp-vp-txt">Learn</span>
            </div>
            <span className="lp-vp-sep">|</span>
            <div className="lp-vp-unit">
              <span className="lp-vp-icon">📈</span>
              <span className="lp-vp-txt">Grow</span>
            </div>
            <span className="lp-vp-sep">|</span>
            <div className="lp-vp-unit">
              <span className="lp-vp-icon">🤝</span>
              <span className="lp-vp-txt">Get Hired</span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="lp-hero-actions">
            <button
              type="button"
              className="lp-hero-cta-primary"
              onClick={onGetStarted}
            >
              <span>Launch Experience</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="lp-hero-cta-secondary"
              onClick={() => scrollToSection('roles')}
            >
              <span>Explore Roles</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          THREE ROLE ENTRY CARDS (STUDENT, INSTITUTION, INDUSTRY)
          ══════════════════════════════════════════════════════════════ */}
      <section id="roles" className="lp-section lp-roles-section">
        <div className="lp-section-header">
          <div className="lp-section-badge">
            <Sparkles size={13} />
            <span>THREE TAILORED WORKSPACES</span>
          </div>
          <h2 className="lp-section-title">
            Designed for Every Stakeholder in the Talent Economy
          </h2>
          <p className="lp-section-desc">
            Empowering students with verified career progress, institutions with real-time academic telemetry, and industry leaders with evidence-backed talent.
          </p>
        </div>

        <div className="lp-roles-grid">
          {roleCards.map((card) => (
            <div
              key={card.id}
              className={`lp-role-entry-card lp-card-${card.id}`}
              onClick={() => onSelectRole ? onSelectRole(card.id) : onGetStarted()}
            >
              {/* Top Row: Illustration & Role Badge */}
              <div className="lp-rec-header">
                <div className="lp-rec-image-box">
                  <img
                    src={card.image}
                    alt={`${card.role} 3D Visual`}
                    className="lp-rec-img"
                    loading="lazy"
                  />
                  <div className="lp-rec-glow" />
                </div>

                <div className="lp-rec-badge-area">
                  <span className="lp-rec-badge-pill" style={{ borderColor: card.color, color: card.color }}>
                    {card.badge}
                  </span>
                  <h3 className="lp-rec-title">{card.role}</h3>
                  <p className="lp-rec-tagline">{card.tagline}</p>
                </div>
              </div>

              {/* Description & Features */}
              <p className="lp-rec-description">{card.description}</p>

              <ul className="lp-rec-features">
                {card.features.map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="lp-rec-check" style={{ color: card.color }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                type="button"
                className={`lp-rec-btn lp-btn-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectRole) onSelectRole(card.id);
                  else onGetStarted();
                }}
              >
                <span>{card.cta}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONNECTED SKILL-NETWORK ECOSYSTEM PIPELINE
          ══════════════════════════════════════════════════════════════ */}
      <section id="ecosystem" className="lp-section lp-ecosystem-section">
        <div className="lp-section-header">
          <div className="lp-section-badge">
            <Network size={13} />
            <span>AI-POWERED SKILL ECOSYSTEM</span>
          </div>
          <h2 className="lp-section-title">
            The Continuous Verification Lifecycle
          </h2>
          <p className="lp-section-desc">
            Bridging foundational academia to enterprise deployment through synchronized assessment, portfolio proofing, and AI matching.
          </p>
        </div>

        <div className="lp-pipeline-container">
          <div className="lp-pipeline-track" />
          <div className="lp-pipeline-grid">
            {ecosystemSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="lp-pipe-node">
                  <div className="lp-pipe-icon-wrapper" style={{ borderColor: step.color }}>
                    <div className="lp-pipe-glow" style={{ background: step.color }} />
                    <Icon size={22} style={{ color: step.color }} />
                    <span className="lp-pipe-num">{step.num}</span>
                  </div>
                  <h4 className="lp-pipe-title">{step.title}</h4>
                  <p className="lp-pipe-sub">{step.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CORE CAPABILITIES GRID (GLASSMORPHISM & CLAYMORPHISM)
          ══════════════════════════════════════════════════════════════ */}
      <section id="features" className="lp-section lp-capabilities-section">
        <div className="lp-section-header">
          <div className="lp-section-badge">
            <Cpu size={13} />
            <span>INTELLIGENT INFRASTRUCTURE</span>
          </div>
          <h2 className="lp-section-title">
            Enterprise-Grade AI Architecture
          </h2>
          <p className="lp-section-desc">
            Engineered to remove bias, quantify authentic skill mastery, and create high-trust talent channels.
          </p>
        </div>

        <div className="lp-capabilities-grid">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="lp-cap-card">
                <div className="lp-cap-top">
                  <div className="lp-cap-icon-box" style={{ borderColor: cap.color }}>
                    <Icon size={22} style={{ color: cap.color }} />
                  </div>
                  <span className="lp-cap-pill" style={{ color: cap.color, borderColor: `${cap.color}55` }}>
                    {cap.pill}
                  </span>
                </div>
                <h3 className="lp-cap-title">{cap.title}</h3>
                <p className="lp-cap-desc">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ENTERPRISE STATS & TRUST BAR
          ══════════════════════════════════════════════════════════════ */}
      <section id="impact" className="lp-section lp-stats-section">
        <div className="lp-stats-strip">
          <div className="lp-stat-item">
            <span className="lp-stat-number">99.4%</span>
            <span className="lp-stat-label">Verification Precision</span>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat-item">
            <span className="lp-stat-number">50,000+</span>
            <span className="lp-stat-label">Active Student Talents</span>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat-item">
            <span className="lp-stat-number">450+</span>
            <span className="lp-stat-label">Partner Institutions</span>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat-item">
            <span className="lp-stat-number">300+</span>
            <span className="lp-stat-label">Industry Recruiters</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA CONVERSION BANNER
          ══════════════════════════════════════════════════════════════ */}
      <section className="lp-cta-banner-section">
        <div className="lp-cta-banner-card">
          <div className="lp-cta-blob-1" />
          <div className="lp-cta-blob-2" />

          <div className="lp-cta-content">
            <span className="lp-cta-pre">READY TO ACCELERATE YOUR CAREER?</span>
            <h2 className="lp-cta-headline">
              Where Skills Meet Real-World Opportunities
            </h2>
            <p className="lp-cta-subtext">
              Join thousands of students, institutions, and enterprise leaders on the unified SkillNexus AI talent network.
            </p>

            <button
              type="button"
              className="lp-btn-cta-big"
              onClick={onGetStarted}
            >
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SAFE & SECURE TRUST FOOTER
          ══════════════════════════════════════════════════════════════ */}
      <footer className="lp-trust-footer">
        <div className="lp-trust-inner">
          <div className="lp-trust-safe-line">
            <Lock size={15} className="lp-trust-lock-icon" />
            <span>Safe &bull; Secure &bull; Trusted by Students, Institutions &amp; Industry</span>
          </div>

          <div className="lp-trust-brand-row">
            <div className="lp-trust-brand">
              <span className="lp-tb-main">SKILLNEXUS AI</span>
              <span className="lp-tb-sub">Cryptographic Talent Infrastructure &bull; Smart India Hackathon Edition</span>
            </div>
            <div className="lp-trust-links">
              <button type="button" onClick={onGetStarted} className="lp-footer-link">
                Portal Login
              </button>
              <button type="button" onClick={() => scrollToSection('roles')} className="lp-footer-link">
                Role Select
              </button>
              <button type="button" onClick={() => scrollToSection('features')} className="lp-footer-link">
                Architecture
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
