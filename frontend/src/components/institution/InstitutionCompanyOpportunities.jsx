import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Users,
  Award,
  Eye,
  X
} from 'lucide-react';
import {
  getInstitutionOpportunities,
  approveAndPublishOpportunity
} from '../../services/institutionData';
import '../common/CompactDataList.css';

export default function InstitutionCompanyOpportunities({ onShowToast, setActivePage }) {
  const [opportunities, setOpportunities] = useState(getInstitutionOpportunities());
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailOpp, setSelectedDetailOpp] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setOpportunities(getInstitutionOpportunities());
    };
    window.addEventListener('nexus_institution_opportunities_changed', handleUpdate);
    return () => window.removeEventListener('nexus_institution_opportunities_changed', handleUpdate);
  }, []);

  const types = ['ALL', 'Internship', 'Job', 'Hackathon', 'Industry Training'];

  const filtered = useMemo(() => {
    return opportunities.filter(op => {
      if (typeFilter !== 'ALL' && !op.type.toLowerCase().includes(typeFilter.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = op.title.toLowerCase().includes(q);
        const matchComp = op.companyName.toLowerCase().includes(q);
        const matchSkill = op.requiredSkills.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchComp && !matchSkill) return false;
      }
      return true;
    });
  }, [opportunities, typeFilter, searchQuery]);

  const handleApprove = (oppId, title) => {
    const updated = approveAndPublishOpportunity(oppId);
    setOpportunities(updated);
    if (selectedDetailOpp && selectedDetailOpp.id === oppId) {
      setSelectedDetailOpp(prev => ({ ...prev, approvedByInstitution: true }));
    }
    if (onShowToast) {
      onShowToast({
        title: 'Opportunity Approved & Published',
        message: `"${title}" has been broadcast to all eligible students on campus.`,
        type: 'success'
      });
    }
  };

  return (
    <div>
      {/* ── TOP BANNER ── */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16,26,48,0.7) 0%, rgba(10,16,30,0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--cyber-amber)" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Corporate Opportunities & Campus Broadcast Hub
              </h2>
              <span className="cyber-badge badge-amber" style={{ fontSize: '10px' }}>
                INSTITUTION APPROVAL WORKFLOW
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Review, validate requirements, and publish corporate Jobs, Internships, Projects, Hackathons, and Training to students.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="var(--cyber-cyan)" />
              <strong>{opportunities.reduce((acc, o) => acc + o.eligibleCount, 0)}</strong> Total Student Matches
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search opportunities, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input"
              style={{ paddingLeft: '34px', width: '100%', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: typeFilter === t ? '1px solid var(--cyber-amber)' : '1px solid var(--border-subtle)',
                  background: typeFilter === t ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: typeFilter === t ? 'var(--cyber-amber)' : 'var(--text-muted)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPACT OPPORTUNITIES TABLE ── */}
      <div className="compact-table-container" style={{ marginBottom: '28px' }}>
        <div className="compact-table-scroll">
          <table className="compact-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Opportunity & Corporate Sponsor</th>
                <th style={{ width: '14%' }}>Type & Location</th>
                <th style={{ width: '14%' }}>Compensation</th>
                <th style={{ width: '14%' }}>Student Matches</th>
                <th style={{ width: '14%' }}>Approval Status</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No corporate opportunities match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((op) => {
                  const isPublished = op.approvedByInstitution;
                  return (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedDetailOpp(op)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(245,158,11,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(245,158,11,0.25)',
                            color: 'var(--cyber-amber)',
                            flexShrink: 0
                          }}>
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="compact-cell-title">{op.title}</span>
                              <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                {op.companyName}
                              </span>
                            </div>
                            <div className="compact-cell-sub" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span>{op.duration}</span>
                              <span>•</span>
                              <span>{op.publishedAt}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-amber" style={{ fontSize: '10px' }}>{op.type}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} /> {op.location}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--cyber-emerald)', fontFamily: 'var(--font-mono)' }}>
                          {op.stipend}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {op.eligibleCount} <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 400 }}>eligible</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--cyber-emerald)', fontWeight: 600 }}>
                          {op.matchingCount} high match
                        </div>
                      </td>
                      <td>
                        {isPublished ? (
                          <span className="badge badge-emerald" style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> Published
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetailOpp(op);
                            }}
                            className="btn-compact-details"
                          >
                            <Eye size={12} />
                            <span>Details →</span>
                          </button>
                          {!isPublished && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(op.id, op.title);
                              }}
                              className="btn-cyber-primary"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              title="Approve & Publish to Campus"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── OPPORTUNITY DETAIL MODAL ── */}
      {selectedDetailOpp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1250,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '26px', border: '1px solid var(--cyber-amber)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '11px', fontWeight: 600 }}>
                    {selectedDetailOpp.companyName}
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                    {selectedDetailOpp.type}
                  </span>
                  <span className={`badge ${selectedDetailOpp.approvedByInstitution ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                    {selectedDetailOpp.approvedByInstitution ? 'Published' : 'Pending Approval'}
                  </span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedDetailOpp.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailOpp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Compensation / Stipend</span>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--cyber-emerald)', fontFamily: 'var(--font-mono)' }}>{selectedDetailOpp.stipend}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Duration & Format</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedDetailOpp.duration}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Work Location</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cyber-cyan)' }}>{selectedDetailOpp.location}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Opportunity Description</span>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'rgba(10,16,30,0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                {selectedDetailOpp.description}
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Required Technical Competencies</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedDetailOpp.requiredSkills.map((sk, idx) => (
                  <span key={idx} className="badge badge-cyan" style={{ fontSize: '11px' }}>
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Eligible Students on Campus</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDetailOpp.eligibleCount} candidates</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Strong Skill Alignment</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--cyber-emerald)' }}>{selectedDetailOpp.matchingCount} students</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDetailOpp(null);
                  if (setActivePage) setActivePage('institution-matching');
                }}
                className="btn-cyber-outline"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                View Match Matrix →
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailOpp(null)}
                className="btn-cyber-outline"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Close
              </button>
              {!selectedDetailOpp.approvedByInstitution && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedDetailOpp.id, selectedDetailOpp.title)}
                  className="btn-cyber-primary"
                  style={{ padding: '8px 18px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={13} />
                  <span>Approve & Broadcast to Students</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
