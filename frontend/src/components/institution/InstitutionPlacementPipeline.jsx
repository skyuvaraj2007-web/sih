import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  Building,
  DollarSign,
  ArrowRight,
  Filter
} from 'lucide-react';
import { PLACEMENT_FUNNELS } from '../../services/institutionData';

export default function InstitutionPlacementPipeline({ onShowToast }) {
  const [funnels] = useState(PLACEMENT_FUNNELS);
  const [selectedCompany, setSelectedCompany] = useState(funnels[0]?.company || 'Google India');

  const selectedFunnel = funnels.find(f => f.company === selectedCompany) || funnels[0];

  const candidateRoster = [
    { name: 'Arun Kumar', regNo: 'RA2211003010001', dept: 'CSE', cgpa: '8.92', company: 'Google India', role: 'Associate Software Engineer', ctc: '₹38.5 LPA', stage: 'Selected' },
    { name: 'Rahul Krishnan', regNo: 'RA2111003010112', dept: 'IT', cgpa: '9.35', company: 'Zoho Corporation', role: 'Product Developer', ctc: '₹14.0 LPA', stage: 'Joined' },
    { name: 'Deepika Raman', regNo: 'RA2211003010204', dept: 'AI & DS', cgpa: '9.18', company: 'TechCorp Global Systems', role: 'GenAI Specialist', ctc: '₹18.0 LPA', stage: 'Interview' },
    { name: 'Priya Sundaram', regNo: 'RA2211003010045', dept: 'ECE', cgpa: '8.45', company: 'Bosch Engineering', role: 'Embedded Engineer', ctc: '₹11.0 LPA', stage: 'Selected' },
    { name: 'Karthik Venkatesh', regNo: 'RA2111003010078', dept: 'CSE', cgpa: '8.88', company: 'Google India', role: 'Associate Software Engineer', ctc: '₹38.5 LPA', stage: 'Interview' },
    { name: 'Swetha Natarajan', regNo: 'RA2211003010278', dept: 'IT', cgpa: '8.76', company: 'Infosys SpringBoard', role: 'Specialist Programmer', ctc: '₹9.5 LPA', stage: 'Shortlisted' }
  ];

  const getStageColor = (st) => {
    switch (st) {
      case 'Joined': return 'var(--cyber-blue)';
      case 'Selected': return 'var(--cyber-emerald)';
      case 'Interview': return 'var(--cyber-amber)';
      case 'Shortlisted': return 'var(--cyber-purple)';
      default: return 'var(--cyber-cyan)';
    }
  };

  return (
    <div>
      {/* ── TOP BANNER & METRICS ── */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="metric-stat-card accent-emerald">
          <div className="metric-stat-header">HIGHEST CTC SECURED</div>
          <div className="metric-stat-value">₹54.0 LPA</div>
          <div className="metric-stat-sub">Google India — AI Platform</div>
        </div>
        <div className="metric-stat-card accent-cyan">
          <div className="metric-stat-header">AVERAGE CTC</div>
          <div className="metric-stat-value">₹14.6 LPA</div>
          <div className="metric-stat-sub">Across 89 Placed Students</div>
        </div>
        <div className="metric-stat-card accent-purple">
          <div className="metric-stat-header">COMPANIES VISITED</div>
          <div className="metric-stat-value">34 Active</div>
          <div className="metric-stat-sub">Tier 1 & Strategic MoUs</div>
        </div>
        <div className="metric-stat-card accent-amber">
          <div className="metric-stat-header">PLACEMENT RATE</div>
          <div className="metric-stat-value">84.2%</div>
          <div className="metric-stat-sub">CSE / IT / AI & DS Cohorts</div>
        </div>
      </div>

      {/* ── COMPANY RECRUITMENT FUNNEL BREAKDOWN ── */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} color="var(--cyber-cyan)" /> Company-wise Recruitment Funnel
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Opportunity → Eligible Students → Applications → Shortlisted → Assessment → Interview → Selected → Joined
            </span>
          </div>

          {/* Company Picker */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {funnels.map(f => (
              <button
                key={f.company}
                onClick={() => setSelectedCompany(f.company)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCompany === f.company ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)',
                  background: selectedCompany === f.company ? 'rgba(0,242,254,0.12)' : 'transparent',
                  color: selectedCompany === f.company ? 'var(--cyber-cyan)' : 'var(--text-muted)'
                }}
              >
                {f.company}
              </button>
            ))}
          </div>
        </div>

        {/* The 7-Stage Funnel Flow for Selected Company */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          padding: '16px',
          background: 'rgba(10,16,30,0.6)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          {[
            { stage: 'Eligible', count: selectedFunnel.eligible, color: 'var(--cyber-cyan)' },
            { stage: 'Applied', count: selectedFunnel.applied, color: 'var(--cyber-purple)' },
            { stage: 'Shortlisted', count: selectedFunnel.shortlisted, color: 'var(--cyber-amber)' },
            { stage: 'Interview', count: selectedFunnel.interviewed, color: 'var(--cyber-blue)' },
            { stage: 'Selected', count: selectedFunnel.selected, color: 'var(--cyber-emerald)' },
            { stage: 'Joined', count: selectedFunnel.joined, color: 'var(--cyber-emerald)' }
          ].map((st, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: st.color, fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                {st.count}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{st.stage}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Top Role: <strong style={{ color: 'var(--text-primary)' }}>{selectedFunnel.topRole}</strong>
          </span>
          <span className="cyber-badge badge-cyan" style={{ fontSize: '10px' }}>
            Current Drive Status: {selectedFunnel.status}
          </span>
        </div>
      </div>

      {/* ── PLACEMENT CANDIDATE ROSTER ── */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Active Recruitment Candidate Roster
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Real-time stage updates from campus placement cell
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Candidate', 'Department', 'CGPA', 'Recruiter', 'Role Profile', 'Secured CTC', 'Funnel Stage', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidateRoster.map((c, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.regNo}</div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{c.dept}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--cyber-cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.cgpa}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>{c.company}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{c.role}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--cyber-emerald)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.ctc}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      background: `${getStageColor(c.stage)}18`,
                      color: getStageColor(c.stage),
                      textTransform: 'uppercase'
                    }}>
                      {c.stage}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        if (onShowToast) onShowToast({ title: 'Candidate Dossier', message: `Displaying placement file for ${c.name}.`, type: 'info' });
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--cyber-cyan)',
                        padding: '4px 10px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Offer Letter →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
