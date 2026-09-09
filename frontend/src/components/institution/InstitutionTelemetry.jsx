import React, { useState } from 'react';
import {
  Users,
  Award,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { getInstitutionAlerts } from '../../services/institutionData';

export default function InstitutionTelemetry({
  institutionDisplayName,
  collegeId,
  totalStudentsCount,
  avgReadiness,
  verifiedSkillsCount,
  placementReadyCount,
  cohorts,
  onShowToast,
  setActivePage
}) {
  const [alerts, setAlerts] = useState(getInstitutionAlerts());
  const [selectedCohort, setSelectedCohort] = useState(null);

  // Skill Growth Trends Data
  const growthTrends = [
    { month: 'Oct 2025', cse: 68, it: 64, aids: 72, overall: 68 },
    { month: 'Nov 2025', cse: 71, it: 66, aids: 75, overall: 71 },
    { month: 'Dec 2025', cse: 73, it: 69, aids: 79, overall: 73 },
    { month: 'Jan 2026', cse: 75, it: 70, aids: 81, overall: 75 },
    { month: 'Feb 2026', cse: 76, it: 72, aids: 84, overall: 77.2 }
  ];

  const competencyTracks = [
    { track: 'Data Science & AI', pct: 84, color: 'var(--cyber-cyan)', students: 312 },
    { track: 'Full Stack & Cloud', pct: 71, color: 'var(--cyber-purple)', students: 248 },
    { track: 'Generative AI & LLMOps', pct: 92, color: 'var(--cyber-emerald)', students: 144 },
    { track: 'Cybersecurity & Defense', pct: 65, color: 'var(--cyber-amber)', students: 97 },
    { track: 'Embedded Systems & IoT', pct: 58, color: 'var(--cyber-rose)', students: 59 }
  ];

  return (
    <div>
      {/* ── 1. ALERT BANNER PANEL ── */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '24px', borderLeft: '4px solid var(--cyber-cyan)', background: 'linear-gradient(90deg, rgba(40,215,255,0.06) 0%, rgba(10,16,30,0.85) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(40,215,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} color="var(--cyber-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Campus Telemetry Intelligence Alerts
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Real-time AI diagnostic triggers across {institutionDisplayName} cohorts
              </span>
            </div>
          </div>
          <span className="cyber-badge badge-cyan" style={{ fontSize: '10px', padding: '3px 8px' }}>
            {alerts.filter(a => a.unread).length} Unresolved Alerts
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {alerts.map((al) => (
            <div
              key={al.id}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(10, 16, 30, 0.75)',
                border: `1px solid ${al.type === 'critical' ? 'rgba(239, 68, 68, 0.3)' : al.type === 'opportunity' ? 'rgba(245, 158, 11, 0.3)' : al.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: al.type === 'critical' ? 'var(--cyber-rose)' : al.type === 'opportunity' ? 'var(--cyber-amber)' : al.type === 'success' ? 'var(--cyber-emerald)' : 'var(--cyber-blue)' }}>
                    {al.severity}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{al.timestamp}</span>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {al.title}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {al.message}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button
                  onClick={() => {
                    if (setActivePage && al.actionRoute) {
                      setActivePage(al.actionRoute);
                    }
                    if (onShowToast) {
                      onShowToast({ title: 'Navigating', message: `Opening ${al.actionLabel}...`, type: 'info' });
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--cyber-cyan)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  {al.actionLabel} <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. 4 CORE METRIC CARDS ── */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="metric-stat-card accent-purple">
          <div className="metric-stat-header">TOTAL ENROLLED STUDENTS</div>
          <div className="metric-stat-value">{totalStudentsCount}</div>
          <div className="metric-stat-sub">Across All Active Cohorts</div>
        </div>
        <div className="metric-stat-card accent-cyan">
          <div className="metric-stat-header">CAMPUS READINESS AVG</div>
          <div className="metric-stat-value">{avgReadiness}</div>
          <div className="metric-stat-sub">+12.4% vs Tamil Nadu Benchmark</div>
        </div>
        <div className="metric-stat-card accent-emerald">
          <div className="metric-stat-header">VERIFIED SKILL PROOFS</div>
          <div className="metric-stat-value">{verifiedSkillsCount}</div>
          <div className="metric-stat-sub">Cryptographically Minted on Ledger</div>
        </div>
        <div className="metric-stat-card accent-amber">
          <div className="metric-stat-header">PLACEMENT READY COHORTS</div>
          <div className="metric-stat-value">{placementReadyCount}</div>
          <div className="metric-stat-sub">High Competency Threshold (≥75%)</div>
        </div>
      </div>

      {/* ── 3. COHORTS GRID CARDS (B.Tech CSE, IT, AI & DS) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--cyber-cyan)" /> Department & Cohort Readiness Roster
        </h3>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Select cohort for drilldown analytics
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {cohorts.map((coh) => (
          <div
            key={coh.id}
            className="glass-panel"
            style={{
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: selectedCohort?.id === coh.id ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)'
            }}
            onClick={() => setSelectedCohort(coh)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className="cyber-badge badge-purple" style={{ fontSize: '9px', marginBottom: '6px' }}>ACTIVE COHORT</span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {coh.name}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {coh.readinessAverage}
                </span>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Avg Readiness</div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              padding: '12px',
              background: 'rgba(10, 16, 30, 0.6)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
              fontSize: '11.5px'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>STUDENTS</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{coh.totalStudents}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>SKILLS MINTED</div>
                <div style={{ fontWeight: 700, color: 'var(--cyber-emerald)' }}>{coh.verifiedSkillsCount}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>PLACEMENT READY</div>
                <div style={{ fontWeight: 700, color: 'var(--cyber-amber)' }}>{coh.placementReady}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>TOP TRACK</div>
                <div style={{ fontWeight: 700, color: 'var(--cyber-purple)', fontSize: '11px' }}>{coh.topTrack}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--cyber-emerald)' }}>
                ● 100% Attestation Synced
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCohort(coh);
                  if (onShowToast) {
                    onShowToast({ title: 'Cohort Calibrated', message: `Telemetry calibrated for ${coh.name}.`, type: 'info' });
                  }
                }}
                style={{ background: 'none', border: 'none', color: 'var(--cyber-cyan)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
              >
                Inspect Cohort →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cohort Drilldown Modal */}
      {selectedCohort && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '28px', border: '1px solid var(--cyber-cyan)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span className="cyber-badge badge-purple" style={{ fontSize: '10px' }}>DETAILED COHORT DOSSIER</span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedCohort.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCohort(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(10,16,30,0.6)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ENROLLED</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCohort.totalStudents}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(10,16,30,0.6)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AVERAGE READINESS</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cyber-cyan)' }}>{selectedCohort.readinessAverage}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(10,16,30,0.6)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PLACEMENT READY</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cyber-amber)' }}>{selectedCohort.placementReady}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              RECOMMENDED NEXT ACTIONS FOR {selectedCohort.name.toUpperCase()}
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              <li>Enforce Cloud & DevOps hands-on lab assessment for the bottom quartile.</li>
              <li>Schedule mock technical interviews with Zoho & TechCorp partner alumni.</li>
              <li>Mint pending cryptographic certificates for {selectedCohort.verifiedSkillsCount} verified skills.</li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedCohort(null);
                  if (setActivePage) setActivePage('institution-students');
                }}
                className="btn-cyber-primary"
                style={{ padding: '8px 16px', fontSize: '12.5px' }}
              >
                View Enrolled Student Roster →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. TWO-COLUMN LAYOUT: COMPETENCY DISTRIBUTION & SKILL GROWTH TRENDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Competency Track Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="var(--cyber-cyan)" /> Competency Track Distribution
          </h3>
          {competencyTracks.map((t, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.track}</span>
                <span style={{ color: t.color, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {t.pct}% · {t.students} students
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${t.pct}%`, height: '100%', background: t.color, borderRadius: '3px', opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Skill Growth Trends Over Time */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="var(--cyber-emerald)" /> Campus Skill Growth Trends (Last 5 Months)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {growthTrends.map((gt, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(10,16,30,0.6)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '80px' }}>
                    {gt.month}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--cyber-cyan)' }}>CSE: {gt.cse}%</span>
                  <span style={{ color: 'var(--cyber-purple)' }}>IT: {gt.it}%</span>
                  <span style={{ color: 'var(--cyber-emerald)' }}>AI&DS: {gt.aids}%</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--cyber-emerald)', fontFamily: 'var(--font-mono)' }}>
                  {gt.overall}%
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--cyber-emerald)' }}>
            <Sparkles size={14} />
            <span>Overall campus competency velocity has increased <strong>+9.2%</strong> quarter-over-quarter.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
