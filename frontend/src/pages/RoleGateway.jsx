import React, { useState } from 'react';
import { User, Building2, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import './RoleGateway.css';

export default function RoleGateway({ onSelectRole }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      emoji: '🎓',
      badge: 'LEARNER',
      badgeColor: 'var(--cyber-cyan)',
      badgeBg: 'var(--cyber-cyan-dim)',
      icon: User,
      iconBg: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(59,130,246,0.2) 100%)',
      iconBorder: 'rgba(0,212,255,0.4)',
      description: 'Access your career journey. Assess your strengths, build verified skills, and match with top opportunities.',
      flow: 'Assess • Learn • Build • Prove',
      buttonText: 'Continue',
      buttonClass: 'btn-cyber-primary'
    },
    {
      id: 'institution',
      title: 'Institution',
      emoji: '🏫',
      badge: 'ACADEMIA',
      badgeColor: 'var(--cyber-purple)',
      badgeBg: 'var(--cyber-purple-dim)',
      icon: Building2,
      iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(168,85,247,0.2) 100%)',
      iconBorder: 'rgba(139,92,246,0.4)',
      description: 'Manage student talent ecosystem. Track cohort readiness, verify competencies, and automate placements.',
      flow: 'Assess • Develop • Track • Connect',
      buttonText: 'Continue',
      buttonClass: 'btn-cyber-purple'
    },
    {
      id: 'industry',
      title: 'Industry',
      emoji: '🏢',
      badge: 'ENTERPRISE',
      badgeColor: 'var(--cyber-emerald)',
      badgeBg: 'var(--cyber-emerald-dim)',
      icon: Briefcase,
      iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.2) 100%)',
      iconBorder: 'rgba(16,185,129,0.4)',
      description: 'Discover and hire future talent. Access evidence-backed student skill proofs and hire verified candidates.',
      flow: 'Discover • Match • Verify • Hire',
      buttonText: 'Continue',
      buttonClass: 'btn-cyber-emerald'
    }
  ];

  return (
    <div className="role-gateway-wrapper">
      {/* Dedicated Page Header Area */}
      <header className="role-gateway-header">
        <div className="role-gateway-header-inner">
          <div className="role-gateway-brand">
            <div className="role-gateway-logo-icon">
              ⚡
            </div>
            <span className="role-gateway-brand-title">
              SKILLNEXUS <span>AI</span>
            </span>
          </div>

          <div className="role-gateway-tagline-pill">
            <span className="role-gateway-tagline-dot"></span>
            <span>Where Skills Meet Opportunities</span>
            <span className="role-gateway-tagline-dot"></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="role-gateway-content">
        {/* Dedicated Section Heading with Comfortable Vertical Spacing */}
        <div className="role-gateway-heading-block">
          <h1 className="role-gateway-title">
            Choose Your Login
          </h1>
          <p className="role-gateway-subtitle">
            Who are you? Select your sector to access your dedicated AI workspace.
          </p>
        </div>

        {/* 3 Role Cards Grid — Baseline Aligned */}
        <div className="role-gateway-grid">
          {roles.map((r) => {
            const isHovered = hoveredCard === r.id;
            return (
              <div
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                onMouseEnter={() => setHoveredCard(r.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`role-card card-${r.id} ${isHovered ? 'is-hovered' : ''}`}
              >
                {/* Top Section */}
                <div className="role-card-top">
                  <div className="role-card-badge-row">
                    <div
                      className="role-card-icon-box"
                      style={{
                        background: r.iconBg,
                        border: `1px solid ${isHovered ? 'var(--cyber-cyan)' : r.iconBorder}`
                      }}
                    >
                      <span>{r.emoji}</span>
                    </div>

                    <span
                      className="role-card-badge"
                      style={{
                        color: r.badgeColor,
                        background: r.badgeBg,
                        border: `1px solid ${r.iconBorder}`
                      }}
                    >
                      {r.badge}
                    </span>
                  </div>

                  <h2 className="role-card-title">
                    {r.title}
                  </h2>

                  <p className="role-card-desc">
                    {r.description}
                  </p>
                </div>

                {/* Bottom Section (Sticky to Baseline) */}
                <div className="role-card-bottom">
                  <div className="role-card-flow">
                    {r.flow}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRole(r.id);
                    }}
                    className={`role-card-btn ${r.buttonClass} role-card-btn-${r.id}`}
                  >
                    <span>{r.buttonText}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Area with Clear Separation */}
        <footer className="role-gateway-footer">
          <div className="role-gateway-footer-main">
            <span className="role-gateway-footer-sparkle">
              <Sparkles size={14} /> NEXUS AI
            </span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Your skills. Your journey. Your future.
            </span>
          </div>
          <div className="role-gateway-footer-sub">
            Enterprise-grade cryptographic verification & evidence-based talent infrastructure • SIH 2026 Edition
          </div>
        </footer>
      </main>
    </div>
  );
}
