import React, { useState, useMemo } from 'react';
import {
  Building,
  Briefcase,
  Search,
  MapPin,
  Users,
  Mail,
  Phone,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Eye
} from 'lucide-react';
import { COMPANY_DIRECTORY } from '../../services/institutionData';
import '../common/CompactDataList.css';

export default function InstitutionCompanyIntelligence({ onShowToast, setActivePage }) {
  const [companies] = useState(COMPANY_DIRECTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filtered = useMemo(() => {
    return companies.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.companyName.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.highDemandSkills.some(s => s.name.toLowerCase().includes(q))
      );
    });
  }, [companies, searchQuery]);

  return (
    <div>
      {/* ── HEADER & SEARCH ── */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,26,48,0.7) 0%, rgba(10,16,30,0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="var(--cyber-cyan)" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Corporate Partners & Industry Intelligence
              </h2>
              <span className="cyber-badge badge-cyan" style={{ fontSize: '10px' }}>
                LIVE DEMAND TELEMETRY
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Real-time skill requirements, hiring volume, HR relationships, and campus recruitment profiles for corporate partners.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                if (onShowToast) onShowToast({ title: 'MoU Sync Complete', message: 'Corporate partner directory refreshed from state ledger.', type: 'success' });
              }}
              className="btn-cyber-outline"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <span>Refresh Industry Feed</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by company name, industry, location, or demanded skill (e.g. Microsoft, Azure, Python)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cyber-input"
            style={{ paddingLeft: '36px', width: '100%', fontSize: '12.5px' }}
          />
        </div>
      </div>

      {/* ── COMPACT COMPANY LIST TABLE ── */}
      <div className="compact-table-container" style={{ marginBottom: '28px' }}>
        <div className="compact-table-scroll">
          <table className="compact-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Corporate Partner</th>
                <th style={{ width: '14%' }}>Location & Size</th>
                <th style={{ width: '14%' }}>Placement Telemetry</th>
                <th style={{ width: '12%' }}>Openings</th>
                <th style={{ width: '20%' }}>Critical Demand Skills</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No corporate partners matched your search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((comp) => {
                  const totalOpenings = comp.currentOpenings.reduce((sum, o) => sum + (o.openings || 1), 0);
                  return (
                    <tr
                      key={comp.id}
                      onClick={() => setSelectedCompany(comp)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-subtle)',
                            flexShrink: 0
                          }}>
                            <Building size={16} color="var(--cyber-cyan)" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="compact-cell-title">{comp.companyName}</span>
                              <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 6px' }}>
                                {comp.partnerStatus}
                              </span>
                            </div>
                            <div className="compact-cell-sub">{comp.industry}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} color="var(--text-muted)" /> {comp.location}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {comp.companySize} employees
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyber-emerald)' }}>
                          {comp.previousRecruitment.avgCTC} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>avg</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {comp.previousRecruitment.totalHired} alumni hired
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 700 }}>
                          {totalOpenings} Roles
                        </span>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {comp.currentOpenings.length} categories
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {comp.highDemandSkills.slice(0, 3).map((sk, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: sk.demandLevel.includes('Critical') ? 'rgba(239,68,68,0.14)' : 'rgba(40,215,255,0.1)',
                                color: sk.demandLevel.includes('Critical') ? 'var(--cyber-rose)' : 'var(--cyber-cyan)',
                                border: `1px solid ${sk.demandLevel.includes('Critical') ? 'rgba(239,68,68,0.25)' : 'rgba(40,215,255,0.2)'}`
                              }}
                            >
                              {sk.name}
                            </span>
                          ))}
                          {comp.highDemandSkills.length > 3 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                              +{comp.highDemandSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompany(comp);
                          }}
                          className="btn-compact-details"
                        >
                          <Eye size={12} />
                          <span>Details →</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── COMPANY DOSSIER MODAL ── */}
      {selectedCompany && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '750px', width: '100%', padding: '28px', border: '1px solid var(--cyber-cyan)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div>
                <span className="cyber-badge badge-purple" style={{ fontSize: '10px' }}>{selectedCompany.partnerStatus}</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', margin: '6px 0 2px' }}>
                  {selectedCompany.companyName}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--cyber-cyan)' }}>{selectedCompany.industry} · {selectedCompany.location}</div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* HR Contact info */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(10,16,30,0.6)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyber-cyan)', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Official Campus Relationship Contact
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
                <div><strong>Contact:</strong> {selectedCompany.hrContact.name} ({selectedCompany.hrContact.designation})</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} color="var(--cyber-cyan)" /> {selectedCompany.hrContact.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} color="var(--cyber-emerald)" /> {selectedCompany.hrContact.phone}</div>
              </div>
            </div>

            {/* Current Openings Details */}
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              DETAILED ROLE SPECIFICATIONS & SKILL REQUIREMENTS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedCompany.currentOpenings.map((op, idx) => (
                <div key={idx} style={{ padding: '14px', background: 'rgba(10,16,30,0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{op.role}</span>
                    <span className="cyber-badge badge-amber" style={{ fontSize: '10px' }}>{op.openings} Open Positions</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Division: {op.department}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <strong>Required Skills:</strong> {(op.requiredSkills || []).join(', ')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                    <strong>Qualifications:</strong> {op.preferredQualifications}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedCompany(null);
                  if (setActivePage) setActivePage('institution-matching');
                }}
                className="btn-cyber-primary"
                style={{ padding: '8px 18px', fontSize: '12.5px' }}
              >
                Match Students Against These Openings →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
