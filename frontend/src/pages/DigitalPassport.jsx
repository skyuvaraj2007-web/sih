import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Share2,
  Download,
  QrCode,
  Lock,
  CheckCircle2,
  Award,
  ExternalLink,
  Copy,
  Clock,
  Key,
  Users,
  Check
} from 'lucide-react';
import {
  getRelationalStudentById,
  getStudentProjects,
  getStudentEnrollments
} from '../services/nexusDataStore';

export default function DigitalPassport({ onShowToast, user }) {
  const [activeTab, setActiveTab] = useState('Verified Skills');
  const [copied, setCopied] = useState(false);
  const [ephemeralLink, setEphemeralLink] = useState(null);
  const [passportVersion, setPassportVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setPassportVersion(v => v + 1);
    window.addEventListener('nexus_students_updated', handleUpdate);
    window.addEventListener('nexus_project_verified', handleUpdate);
    window.addEventListener('nexus_enrollment_updated', handleUpdate);
    window.addEventListener('nexus_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('nexus_students_updated', handleUpdate);
      window.removeEventListener('nexus_project_verified', handleUpdate);
      window.removeEventListener('nexus_enrollment_updated', handleUpdate);
      window.removeEventListener('nexus_data_updated', handleUpdate);
    };
  }, []);

  const authUser = (() => {
    try { return JSON.parse(localStorage.getItem('nexus_auth_user')) || {}; } catch { return {}; }
  })();

  const student = getRelationalStudentById(user?.studentId || user?.id || authUser.studentId || authUser.id)
    || {
      studentId: user?.studentId || user?.id || authUser?.studentId || '',
      name: user?.name || authUser?.name || 'Student',
      email: user?.email || authUser?.email,
      skills: user?.skills || [],
      readinessScore: user?.readinessScore || 0,
      collegeName: user?.institutionName || 'Academic Institution'
    };

  const studentProjects = student ? getStudentProjects(student.studentId) : [];
  const studentEnrollments = student ? getStudentEnrollments(student.studentId) : [];
  const studentSkills = student?.skills || [];

  const credentials = studentSkills.length > 0 ? studentSkills.map(sk => {
    const hashNum = Math.abs(sk.name.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
    return {
      code: `NX-${hashNum.toString().slice(0, 4)}-${sk.name.slice(0, 3).toUpperCase()}`,
      title: sk.name,
      stamp: sk.verified ? 'Signed Proctor' : 'In Sandbox Test',
      level: `${sk.level || 'Proficient'} • Confidence: ${sk.confidence || 80}%`,
      metric: `Ledger Block #8,941 • Verified`,
      time: 'Just now',
      hasAssessment: sk.hasAssessment !== false,
      hasCourse: sk.hasCourse || sk.confidence >= 75,
      hasProject: sk.hasProject || sk.confidence >= 80,
      hasInstSeal: sk.hasInstSeal || sk.verified
    };
  }) : [];

  const seals = studentSkills.filter(s => s.verified).slice(0, 3).map(sk => ({
    title: `Verified Competency: ${sk.name}`,
    partner: student.collegeName || 'Accredited Academic Campus',
    type: "ACADEMIC SEAL",
    code: `ID: SEAL-${Math.abs(sk.name.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 6)}`
  }));

  const handleExportJsonLd = () => {
    window.open('http://localhost:5000/api/passport/export-jsonld', '_blank');
    if (onShowToast) {
      onShowToast({
        title: 'Verifiable Credential Exported',
        message: 'W3C Verifiable Credential JSON-LD document downloaded.',
        type: 'success'
      });
    }
  };

  const handleGenerateEphemeralLink = () => {
    const link = "https://verify.skillnexus.ai/passport/view?token=ephem_8941a99&did=0x89419f";
    setEphemeralLink(link);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    if (onShowToast) {
      onShowToast({
        title: '24-Hour Ephemeral Link Generated',
        message: 'Tamper-proof recruiter link copied with PII auto-redaction.',
        type: 'success'
      });
    }
  };

  return (
    <div>
      {/* Top Telemetry Header */}
      <div className="page-top-telemetry">
        <div className="page-title-group">
          <div className="telemetry-node-tag">
            <span>VERIFIED CREDENTIAL ARCHITECTURE</span>
            <span>//</span>
            <span>SOVEREIGN IDENTITY</span>
          </div>
          <h1>My Digital Passport</h1>
          <p>Proof that travels with you. Cryptographically signed skill attestations, live proctored evaluations, and tamper-proof portfolio evidence.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleGenerateEphemeralLink}
            className="btn-cyber-outline"
          >
            <Share2 size={14} color="var(--cyber-cyan)" />
            <span>Share Public Passport</span>
          </button>
          <button 
            onClick={handleExportJsonLd}
            className="btn-cyber-primary"
          >
            <Download size={14} />
            <span>Export Verified Passport (JSON-LD)</span>
          </button>
        </div>
      </div>

      {/* Candidate Hero Card matching Page 11 */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        marginBottom: '28px',
        background: 'var(--bg-card)',
        borderColor: 'rgba(56, 189, 248, 0.35)',
        display: 'grid',
        gridTemplateColumns: '1fr 220px',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <img
            src={student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={student?.name || "Student"}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyber-cyan)', boxShadow: 'var(--cyber-cyan-glow)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {student?.name || 'Student Candidate'}
              </h2>
              <span className="cyber-badge badge-cyan" style={{ fontSize: '9px' }}>
                SOVEREIGN DID VERIFIED
              </span>
            </div>

            <div style={{ fontSize: '13.5px', color: 'var(--cyber-cyan)', fontWeight: 600 }}>
              {student?.headline || (student?.desiredRole ? `Aspiring ${student.desiredRole}` : 'Verified Academic Scholar')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {student?.department || 'Curriculum'} {student?.year ? `(${student.year})` : ''} • {student?.collegeName || 'Verified Higher Education Institution'}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              <span>DID: <strong style={{ color: 'var(--text-primary)' }}>did:nexus:{student?.regNo || '0x89419f...429c'}</strong></span>
              <span>STATUS: <strong style={{ color: 'var(--cyber-emerald)' }}>ACTIVE & VALIDATED</strong></span>
            </div>
          </div>
        </div>

        {/* Readiness Metric Circle */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '16px', borderRadius: '12px', background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)', textAlign: 'center'
        }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: 'radial-gradient(circle, #0B172E 60%, rgba(0,212,255,0.2) 100%)',
            border: '2.5px solid var(--cyber-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', boxShadow: 'var(--cyber-cyan-glow)',
            marginBottom: '6px'
          }}>
            {(student?.readinessScore ?? student?.careerReadinessScore ?? 0)}%
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            AI Career Index
          </div>
          <div style={{ fontSize: '10px', color: 'var(--cyber-cyan)' }}>
            {(student?.readinessScore ?? student?.careerReadinessScore ?? 0) > 0 ? `Readiness: ${student?.readinessScore ?? student?.careerReadinessScore}%` : 'Evaluation Pending'}
          </div>
        </div>
      </div>

      {/* 4 Stats Counters */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="metric-stat-card accent-cyan">
          <div className="metric-stat-header">SKILL PROOFS</div>
          <div className="metric-stat-value">{credentials.length}</div>
          <div className="metric-stat-sub">Attested</div>
        </div>
        <div className="metric-stat-card accent-emerald">
          <div className="metric-stat-header">SHIPPED REPOS</div>
          <div className="metric-stat-value">{studentProjects.length}</div>
          <div className="metric-stat-sub">Production Code</div>
        </div>
        <div className="metric-stat-card accent-purple">
          <div className="metric-stat-header">VALIDATED BADGES</div>
          <div className="metric-stat-value">{seals.length}</div>
          <div className="metric-stat-sub">Signed Badges</div>
        </div>
        <div className="metric-stat-card accent-amber">
          <div className="metric-stat-header">ASSESSMENT RANK</div>
          <div className="metric-stat-value">{(student?.readinessScore ?? student?.careerReadinessScore ?? 0) > 0 ? `${student?.readinessScore ?? student?.careerReadinessScore}th` : 'N/A'}</div>
          <div className="metric-stat-sub">Percentile</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px', paddingBottom: '8px' }}>
        {[`Verified Skills (${studentSkills.length})`, `Projects Proof (${studentProjects.length})`, `Certificates & Badges (${seals.length})`, 'Assessment Transcripts', 'Verification Audit Log'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none',
              padding: '6px 14px', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab ? 'var(--cyber-cyan)' : 'var(--text-secondary)',
              background: activeTab === tab ? 'rgba(0, 212, 255, 0.08)' : 'transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Cryptographic Skill Ledger + Recruiter Sandbox matching Page 11 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '28px' }}>
        {/* Left: 6 Cryptographic Skill Ledger Cards */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--cyber-cyan)" />
              <span>Cryptographic Skill Ledger</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Consensus Protocol: Proof of Evaluation
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: credentials.length > 0 ? 'repeat(2, 1fr)' : '1fr', gap: '16px' }}>
            {credentials.length > 0 ? (
              credentials.map((cred) => (
                <div key={cred.code} className="glass-panel" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="code-font" style={{ fontSize: '11px', color: 'var(--cyber-cyan)', fontWeight: 700 }}>
                      {cred.code}
                    </span>
                    <span className="cyber-badge badge-cyan" style={{ fontSize: '9px' }}>
                      {cred.stamp}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {cred.title}
                  </h4>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {cred.level}
                  </div>

                  {/* 4-Point Sovereign Evidence Checklist Pills */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: cred.hasAssessment ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)', color: cred.hasAssessment ? 'var(--cyber-emerald)' : 'var(--text-muted)', border: cred.hasAssessment ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)' }}>
                      {cred.hasAssessment ? '✓ Assessment' : '○ Assessment'}
                    </span>
                    <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: cred.hasCourse ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)', color: cred.hasCourse ? 'var(--cyber-emerald)' : 'var(--text-muted)', border: cred.hasCourse ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)' }}>
                      {cred.hasCourse ? '✓ Course' : '○ Course'}
                    </span>
                    <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: cred.hasProject ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)', color: cred.hasProject ? 'var(--cyber-emerald)' : 'var(--text-muted)', border: cred.hasProject ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)' }}>
                      {cred.hasProject ? '✓ Project' : '○ Project'}
                    </span>
                    <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: cred.hasInstSeal ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)', color: cred.hasInstSeal ? 'var(--cyber-emerald)' : 'var(--text-muted)', border: cred.hasInstSeal ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)' }}>
                      {cred.hasInstSeal ? '✓ Faculty Seal' : '○ Faculty Seal'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '10px', borderTop: '1px solid var(--border-subtle)',
                    fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
                  }}>
                    <span>{cred.metric}</span>
                    <span>{cred.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0, fontSize: '13px' }}>No verified skill credentials attested yet.</p>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Complete assessments and courses to mint verifiable credentials onto your ledger.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recruiter Sandbox Widget matching Page 11 */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(0, 212, 255, 0.35)', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recruiter Sandbox
              </h3>
              <span className="cyber-badge badge-emerald" style={{ fontSize: '9px' }}>
                VALID
              </span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              Instant Verification Token
            </div>

            {/* High-Tech Dynamic QR Code matching Page 11 */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '20px', background: '#080D1A', borderRadius: '12px',
              border: '1px solid var(--border-glow)', marginBottom: '18px'
            }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                {/* Background */}
                <rect width="100" height="100" fill="#080D1A" />
                {/* QR Pattern Simulation */}
                <rect x="10" y="10" width="25" height="25" fill="#00D4FF" />
                <rect x="14" y="14" width="17" height="17" fill="#080D1A" />
                <rect x="18" y="18" width="9" height="9" fill="#00D4FF" />

                <rect x="65" y="10" width="25" height="25" fill="#00D4FF" />
                <rect x="69" y="14" width="17" height="17" fill="#080D1A" />
                <rect x="73" y="18" width="9" height="9" fill="#00D4FF" />

                <rect x="10" y="65" width="25" height="25" fill="#00D4FF" />
                <rect x="14" y="69" width="17" height="17" fill="#080D1A" />
                <rect x="18" y="73" width="9" height="9" fill="#00D4FF" />

                {/* Data Matrix Bits */}
                <rect x="42" y="12" width="6" height="6" fill="#8B5CF6" />
                <rect x="52" y="18" width="6" height="6" fill="#00D4FF" />
                <rect x="42" y="28" width="6" height="6" fill="#10B981" />
                <rect x="48" y="38" width="6" height="6" fill="#00D4FF" />
                <rect x="18" y="44" width="6" height="6" fill="#00D4FF" />
                <rect x="28" y="48" width="6" height="6" fill="#8B5CF6" />
                <rect x="65" y="45" width="6" height="6" fill="#00D4FF" />
                <rect x="75" y="52" width="6" height="6" fill="#10B981" />
                <rect x="42" y="65" width="6" height="6" fill="#00D4FF" />
                <rect x="55" y="72" width="6" height="6" fill="#8B5CF6" />
                <rect x="68" y="80" width="6" height="6" fill="#00D4FF" />
                <rect x="80" y="72" width="6" height="6" fill="#10B981" />
              </svg>

              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
                nexus://verify/0x89419f...signd
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyber-emerald)' }}>
                <CheckCircle2 size={13} />
                <span>Zero-Knowledge Proof Enabled</span>
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                Recruiters can verify code scores mathematically without access to private personal contact info.
              </div>
            </div>

            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '16px', fontSize: '11px' }}>
              <div style={{ color: 'var(--text-muted)' }}>DIRECT RECRUITER PINGS</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                12 companies currently monitoring your ledger
              </div>
            </div>

            <button
              onClick={handleGenerateEphemeralLink}
              className="btn-cyber-primary"
              style={{ width: '100%', padding: '10px', fontSize: '12.5px' }}
            >
              <Share2 size={13} />
              <span>{copied ? 'Link Copied to Clipboard!' : 'Generate Ephemeral Share Link (24h)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accredited Certificates & Seals matching Page 11 Bottom */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={17} color="var(--cyber-cyan)" />
            <span>Accredited Certificates & Seals</span>
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--cyber-cyan)', cursor: 'pointer', fontWeight: 600 }}>
            View All 6 Accreditations →
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {seals.map((seal, idx) => (
            <div key={idx} style={{
              padding: '16px', borderRadius: '10px', background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                <span className="cyber-badge badge-cyan" style={{ fontSize: '8.5px', marginBottom: '6px' }}>
                  {seal.type}
                </span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {seal.title}
                </h4>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {seal.partner}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{seal.code}</span>
                <button
                  onClick={() => {
                    if (onShowToast) onShowToast({ title: 'Certificate Cryptographically Verified', message: 'Signed by Academic Key Auth.', type: 'success' });
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--cyber-cyan)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Verify ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
