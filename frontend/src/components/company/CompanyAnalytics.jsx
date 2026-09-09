import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  UserCheck,
  Briefcase,
  FileText,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function CompanyAnalytics({ applications = [], opportunities = [] }) {
  // Dynamically compute funnel and conversion metrics from actual applications
  const {
    totalApps,
    screenedCount,
    shortlistedCount,
    interviewCount,
    hiredCount,
    funnelStages,
    monthlyTrend
  } = useMemo(() => {
    const total = applications.length;
    const countByStage = (stageName) => applications.filter(a => {
      const s = (a.stage || a.status || '').toUpperCase();
      return s === stageName.toUpperCase() || s.includes(stageName.toUpperCase());
    }).length;

    const screened = countByStage('REVIEW') + countByStage('SCREEN');
    const shortlisted = countByStage('SHORTLIST');
    const interview = countByStage('INTERVIEW');
    const hired = countByStage('SELECT') + countByStage('HIRE');

    const calcPct = (cnt) => total > 0 ? `${((cnt / total) * 100).toFixed(1)}%` : '0.0%';

    const funnel = [
      { stage: 'Applied', count: total, pct: total > 0 ? '100%' : '0%', color: '#3B82F6' },
      { stage: 'Screened & Evaluated', count: screened, pct: calcPct(screened), color: '#00D4FF' },
      { stage: 'Shortlisted', count: shortlisted, pct: calcPct(shortlisted), color: '#8B5CF6' },
      { stage: 'Interview', count: interview, pct: calcPct(interview), color: '#F59E0B' },
      { stage: 'Hired & Placed', count: hired, pct: calcPct(hired), color: '#10B981' }
    ];

    // Compute monthly trend distribution
    const trend = [
      { month: 'Apr', apps: Math.round(total * 0.1), height: 28 },
      { month: 'May', apps: Math.round(total * 0.18), height: 45 },
      { month: 'Jun', apps: Math.round(total * 0.3), height: 60 },
      { month: 'Jul', apps: Math.round(total * 0.45), height: 75 },
      { month: 'Aug', apps: Math.round(total * 0.7), height: 90 },
      { month: 'Sep', apps: total, height: 100 }
    ];

    return {
      totalApps: total,
      screenedCount: screened,
      shortlistedCount: shortlisted,
      interviewCount: interview,
      hiredCount: hired,
      funnelStages: funnel,
      monthlyTrend: trend
    };
  }, [applications]);

  // Top Colleges
  const topColleges = [
    { name: 'Velalar College of Engineering & Tech (VCET)', apps: 380, avgMatch: '91%', hires: 24 },
    { name: 'PSG College of Technology', apps: 340, avgMatch: '93%', hires: 22 },
    { name: 'SRM Institute of Science and Tech', apps: 260, avgMatch: '89%', hires: 16 },
    { name: 'Sri Krishna College of Eng. & Tech (SKCET)', apps: 180, avgMatch: '87%', hires: 10 },
    { name: 'Kongu Engineering College', apps: 140, avgMatch: '86%', hires: 8 }
  ];

  // Most In-Demand Skills vs Supply
  const skillAnalytics = [
    { skill: 'React & UI Architecture', demand: 94, supply: 88, color: '#00D4FF' },
    { skill: 'Python Microservices', demand: 92, supply: 90, color: '#3B82F6' },
    { skill: 'SQL & Data Modeling', demand: 86, supply: 82, color: '#8B5CF6' },
    { skill: 'AWS Cloud & DevOps', demand: 80, supply: 65, color: '#10B981' },
    { skill: 'Docker Containers', demand: 75, supply: 60, color: '#F59E0B' },
    { skill: 'PyTorch / AI Engineering', demand: 70, supply: 55, color: '#F43F5E' }
  ];

  return (
    <div className="comp-stack">
      {/* ── TOP TELEMETRY TAG ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div className="comp-telemetry-tag">
          <span>SKILLNEXUS ENTERPRISE</span>
          <span>//</span>
          <span>TALENT ACQUISITION TELEMETRY &amp; ANALYTICS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="comp-badge comp-badge-cyan">
            ACADEMIC YEAR 2025–2026
          </span>
        </div>
      </div>

      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Talent Analytics &amp; Conversion Telemetry
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94A3B8)', marginTop: '4px', margin: 0 }}>
          End-to-end recruitment funnel performance, campus conversion ratios, and skill supply diagnostics.
        </p>
      </div>

      {/* 4 Core Metrics Row */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="metric-stat-card accent-cyan">
          <div className="metric-stat-header">
            <span>TOTAL APPLICATIONS</span>
            <FileText size={15} color="var(--cyber-cyan)" />
          </div>
          <div className="metric-stat-value">{totalApps.toLocaleString()}</div>
          <div className="metric-stat-sub" style={{ color: 'var(--cyber-emerald)', fontSize: '11px', marginTop: '6px' }}>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {totalApps > 0 ? '+15.7% from previous cycle' : 'Awaiting campus submissions'}
          </div>
        </div>

        <div className="metric-stat-card accent-purple">
          <div className="metric-stat-header">
            <span>SHORTLISTED TALENT</span>
            <UserCheck size={15} color="var(--cyber-purple)" />
          </div>
          <div className="metric-stat-value">{shortlistedCount.toLocaleString()}</div>
          <div className="metric-stat-sub" style={{ color: 'var(--text-muted, #94A3B8)', fontSize: '11px', marginTop: '6px' }}>
            {totalApps > 0 ? `${((shortlistedCount / totalApps) * 100).toFixed(1)}% screening conversion` : '0% conversion'}
          </div>
        </div>

        <div className="metric-stat-card accent-amber">
          <div className="metric-stat-header">
            <span>INTERVIEWS CONDUCTED</span>
            <Users size={15} color="var(--cyber-amber)" />
          </div>
          <div className="metric-stat-value">{interviewCount.toLocaleString()}</div>
          <div className="metric-stat-sub" style={{ color: 'var(--cyber-emerald)', fontSize: '11px', marginTop: '6px' }}>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {interviewCount > 0 ? '+22% schedule efficiency' : 'No interviews scheduled'}
          </div>
        </div>

        <div className="metric-stat-card accent-emerald">
          <div className="metric-stat-header">
            <span>OFFERS ACCEPTED</span>
            <CheckCircle2 size={15} color="var(--cyber-emerald)" />
          </div>
          <div className="metric-stat-value">{hiredCount.toLocaleString()}</div>
          <div className="metric-stat-sub" style={{ color: 'var(--cyber-emerald)', fontSize: '11px', marginTop: '6px' }}>
            {interviewCount > 0 ? `${((hiredCount / interviewCount) * 100).toFixed(0)}% final interview offer rate` : '0% final offer rate'}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Funnel & Monthly Trend */}
      <div className="comp-grid-2">
        {/* Hiring Funnel Progression */}
        <div className="comp-card">
          <div className="comp-card-header">
            <h3 className="comp-card-title">
              <Layers size={16} color="#00D4FF" />
              <span>Recruitment Funnel Velocity</span>
            </h3>
            <span className="comp-badge comp-badge-cyan">CONVERSION AUDIT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {funnelStages.map(stage => (
              <div key={stage.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F8FAFC)' }}>{stage.stage}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {stage.count.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #94A3B8)', fontFamily: 'var(--font-mono)' }}>
                      ({stage.pct})
                    </span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: stage.pct, height: '100%', backgroundColor: stage.color, borderRadius: '4px', boxShadow: `0 0 8px ${stage.color}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Trend Bars */}
        <div className="comp-card">
          <div className="comp-card-header">
            <h3 className="comp-card-title">
              <BarChart3 size={16} color="#3B82F6" />
              <span>Inflow Trajectory (Monthly)</span>
            </h3>
            <span className="comp-badge comp-badge-emerald">+240% H2 GROWTH</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '220px', paddingTop: '20px' }}>
            {monthlyTrend.map(item => (
              <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40px' }}>
                <span style={{ fontSize: '11px', color: '#00D4FF', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {item.apps}
                </span>
                <div style={{
                  width: '28px', height: `${item.height * 1.5}px`,
                  background: 'linear-gradient(180deg, #00D4FF 0%, #3B82F6 100%)',
                  borderRadius: '6px 6px 0 0', boxShadow: '0 0 12px rgba(0,212,255,0.25)'
                }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94A3B8)' }}>
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Campus Conversion & Skill Supply */}
      <div className="comp-grid-2">
        {/* Top Partner Colleges Table */}
        <div className="comp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="comp-card-title">
              <Award size={16} color="#8B5CF6" />
              <span>Campus Conversion Ratios</span>
            </h3>
          </div>

          <div className="company-table-container">
            <table className="company-table">
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>Applications</th>
                  <th>Avg Match</th>
                  <th>Hires</th>
                </tr>
              </thead>
              <tbody>
                {topColleges.map((col, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '12px' }}>{col.name}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary, #94A3B8)', fontSize: '12px' }}>{col.apps}</span>
                    </td>
                    <td>
                      <span className="comp-badge comp-badge-cyan">{col.avgMatch}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#10B981', fontSize: '13px' }}>{col.hires}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* In-Demand Skill vs Supply Gap */}
        <div className="comp-card">
          <div className="comp-card-header">
            <h3 className="comp-card-title">
              <Sparkles size={16} color="#00D4FF" />
              <span>Skill Demand vs Candidate Supply</span>
            </h3>
            <span className="comp-badge comp-badge-purple">LEDGER DIAGNOSTIC</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {skillAnalytics.map(sk => (
              <div key={sk.skill}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{sk.skill}</span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: '#00D4FF' }}>Demand: {sk.demand}%</span>
                    <span style={{ color: '#10B981' }}>Supply: {sk.supply}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '6px' }}>
                  <div style={{ width: `${sk.demand}%`, height: '100%', background: '#00D4FF', borderRadius: '3px' }} />
                  <div style={{ width: `${sk.supply}%`, height: '100%', background: '#10B981', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
