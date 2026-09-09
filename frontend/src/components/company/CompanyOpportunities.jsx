import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

export default function CompanyOpportunities({
  opportunities = [],
  filterType = 'All', // 'All' | 'Internships' | 'Full-Time' | 'Apprenticeships'
  currentTab = 'opportunities',
  onCreateOpportunity,
  onUpdateOpportunity,
  onDeleteOpportunity,
  onCloseOpportunity,
  onFindMatchingStudents,
  onShowToast,
  user
}) {
  const isJobsMode = currentTab === 'jobs' || filterType === 'Full-Time';
  const isInternshipsMode = currentTab === 'internships' || filterType === 'Internships';

  const [activeTab, setActiveTab] = useState(() => {
    if (isJobsMode) return 'Full-Time';
    if (isInternshipsMode) return 'Internships';
    return filterType || 'All';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [deleteTargetOpp, setDeleteTargetOpp] = useState(null);

  useEffect(() => {
    if (isJobsMode) {
      setActiveTab('Full-Time');
    } else if (isInternshipsMode) {
      setActiveTab('Internships');
    } else if (filterType) {
      setActiveTab(filterType);
    }
  }, [filterType, isJobsMode, isInternshipsMode]);

  // Form State for Create / Edit Opportunity
  const [formData, setFormData] = useState({
    type: isJobsMode ? 'Full-Time' : 'Internship',
    title: '',
    description: '',
    department: 'Software Engineering',
    requiredSkills: 'React, Next.js, JavaScript, TypeScript, Git',
    eligibleColleges: 'All Partnered Colleges',
    eligibleDepartments: 'CSE, IT, AI & DS',
    eligibleYears: '3rd Year, 4th Year',
    minProgress: 80,
    minMatch: 80,
    location: 'Chennai (Hybrid)',
    workMode: 'Hybrid',
    positions: 4,
    deadline: '2026-10-15',
    selectionProcess: 'Resume Evidence Screening → Proctored Code Diagnostic → Technical Interview'
  });

  const companyName = user?.companyName || user?.company || 'TechCorp Global Systems';

  // Defensive list of opportunities
  const safeOpps = useMemo(() => {
    return Array.isArray(opportunities) ? opportunities : [];
  }, [opportunities]);

  // Handle Tab Switch and Filtering
  const filteredOpps = useMemo(() => {
    return safeOpps.filter(opp => {
      if (!opp || typeof opp !== 'object') return false;
      const oppType = (opp.type || '').toLowerCase();

      // Type Tab Filter
      if (activeTab === 'Internships') {
        if (!oppType.includes('intern')) return false;
      } else if (activeTab === 'Full-Time') {
        if (!oppType.includes('full') && !oppType.includes('job')) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (opp.title || opp.role || '').toLowerCase().includes(q);
        const matchesDept = (opp.department || '').toLowerCase().includes(q);
        const matchesLocation = (opp.location || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDept && !matchesLocation) return false;
      }

      return true;
    });
  }, [safeOpps, activeTab, searchQuery]);

  const handleOpenCreate = () => {
    setEditingOpp(null);
    setFormData({
      type: isJobsMode ? 'Full-Time' : 'Internship',
      title: '',
      description: '',
      department: 'Software Engineering',
      requiredSkills: 'React, Next.js, JavaScript, TypeScript, Git',
      eligibleColleges: 'All Partnered Colleges',
      eligibleDepartments: 'CSE, IT, AI & DS',
      eligibleYears: '3rd Year, 4th Year',
      minProgress: 80,
      minMatch: 80,
      location: 'Chennai (Hybrid)',
      workMode: 'Hybrid',
      positions: 4,
      deadline: '2026-10-15',
      selectionProcess: 'Resume Evidence Screening → Proctored Code Diagnostic → Technical Interview'
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (opp) => {
    setEditingOpp(opp);
    setFormData({
      type: opp.type || 'Internship',
      title: opp.title || opp.role || '',
      description: opp.description || '',
      department: opp.department || 'Engineering',
      requiredSkills: Array.isArray(opp.requiredSkills) ? opp.requiredSkills.join(', ') : (opp.requiredSkills || ''),
      eligibleColleges: opp.eligibleColleges || 'All Partnered Colleges',
      eligibleDepartments: opp.eligibleDepartments || 'CSE, IT, AI & DS',
      eligibleYears: opp.eligibleYears || '3rd Year, 4th Year',
      minProgress: opp.minProgress || 80,
      minMatch: opp.minMatch || 80,
      location: opp.location || 'Chennai',
      workMode: opp.workMode || opp.mode || 'Hybrid',
      positions: opp.positions || 4,
      deadline: opp.deadline || '2026-10-15',
      selectionProcess: opp.selectionProcess || 'Screening → Assessment → Interview'
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveOpportunity = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an opportunity title.');
      return;
    }

    const oppId = editingOpp ? (editingOpp.opportunityId || editingOpp.oppId || editingOpp.id) : `OPP-${Date.now().toString().slice(-4)}`;

    const oppPayload = {
      opportunityId: oppId,
      oppId: oppId,
      id: oppId,
      title: formData.title,
      role: formData.title,
      type: formData.type,
      department: formData.department,
      company: companyName,
      companyName: companyName,
      companyId: user?.companyId || 'COM001',
      location: formData.location,
      workMode: formData.workMode,
      positions: parseInt(formData.positions) || 2,
      deadline: formData.deadline,
      minProgress: parseInt(formData.minProgress) || 80,
      minMatch: parseInt(formData.minMatch) || 80,
      requiredSkills: typeof formData.requiredSkills === 'string'
        ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        : (formData.requiredSkills || []),
      eligibleColleges: formData.eligibleColleges,
      eligibleDepartments: formData.eligibleDepartments,
      eligibleYears: formData.eligibleYears,
      selectionProcess: formData.selectionProcess,
      description: formData.description,
      status: editingOpp ? (editingOpp.status || 'Active') : 'Active',
      applicantsCount: editingOpp ? (editingOpp.applicantsCount ?? editingOpp.applicantCount ?? editingOpp.applicants ?? 0) : 0,
      shortlistedCount: editingOpp ? (editingOpp.shortlistedCount ?? editingOpp.shortlisted ?? 0) : 0,
      createdAt: editingOpp ? editingOpp.createdAt : new Date().toISOString()
    };

    if (editingOpp) {
      if (onUpdateOpportunity) onUpdateOpportunity(oppPayload);
      if (onShowToast) onShowToast({ title: 'Opportunity Updated', message: `"${formData.title}" was updated successfully.`, type: 'success' });
    } else {
      if (onCreateOpportunity) onCreateOpportunity(oppPayload);
      if (onShowToast) onShowToast({ title: 'Opportunity Published', message: `"${formData.title}" is now published on the Sovereign Ledger.`, type: 'success' });
    }

    setIsCreateModalOpen(false);
  };

  return (
    <div className="comp-stack">
      {/* ── TOP TELEMETRY TAG ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div className="comp-telemetry-tag">
          <span>SKILLNEXUS ENTERPRISE</span>
          <span>//</span>
          <span>{isJobsMode ? 'FULL-TIME JOBS & CAREER OPENINGS' : isInternshipsMode ? 'INTERNSHIP OPPORTUNITIES & PIPELINE' : 'OPPORTUNITY PIPELINE & LEDGER POSTINGS'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="comp-badge comp-badge-purple">
            {filteredOpps.length} {isJobsMode ? 'JOBS' : isInternshipsMode ? 'INTERNSHIPS' : 'ROLES'}
          </span>
        </div>
      </div>

      {/* Screen Title & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Opportunities
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94A3B8)', marginTop: '4px', margin: 0 }}>
            Create and manage job opportunities, internships and apprenticeships.
          </p>
        </div>

        <button
          type="button"
          className="btn-cyber-primary"
          onClick={handleOpenCreate}
          style={{ padding: '8px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Create Opportunity</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '14px', paddingBottom: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          display: 'flex', padding: '3px', borderRadius: '10px',
          background: 'rgba(10, 18, 36, 0.8)', border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          {[
            { id: 'All', label: 'All' },
            { id: 'Internships', label: 'Internships' },
            { id: 'Full-Time', label: 'Full-Time' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'transparent',
                color: activeTab === tab.id ? '#00D4FF' : 'var(--text-muted, #94A3B8)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94A3B8)' }} />
          <input
            type="text"
            placeholder="Filter by title, role or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="company-input"
            style={{ width: '100%', paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="comp-grid-3">
        {filteredOpps.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted, #94A3B8)' }} className="comp-card">
            <Briefcase size={36} style={{ margin: '0 auto 12px', opacity: 0.4, color: '#00D4FF' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>No opportunities found</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)', maxWidth: '400px', margin: '0 auto 16px' }}>
              No postings match your current filter. Click "Create Opportunity" to publish a new role.
            </p>
            <button
              type="button"
              className="btn-cyber-primary"
              onClick={handleOpenCreate}
              style={{ padding: '6px 16px', fontSize: '12px' }}
            >
              + Create Opportunity
            </button>
          </div>
        ) : (
          filteredOpps.map((opp, idx) => {
            const oppKey = opp.opportunityId || opp.oppId || opp.id || `opp-${idx}`;
            const skills = Array.isArray(opp.requiredSkills)
              ? opp.requiredSkills
              : typeof opp.requiredSkills === 'string'
                ? opp.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
                : ['React', 'Python'];
            const appCount = opp.applicantsCount ?? opp.applicantCount ?? opp.applicants ?? 0;
            const shortCount = opp.shortlistedCount ?? opp.shortlisted ?? 0;
            const isActive = opp.status === 'Active' || opp.status === 'ACTIVE';

            return (
              <div key={oppKey} className="comp-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top line: Type Badge + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="comp-badge comp-badge-cyan">
                      {opp.type || 'Internship'}
                    </span>
                    <span className={`comp-badge ${isActive ? 'comp-badge-emerald' : 'comp-badge-amber'}`}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isActive ? '#10B981' : '#F59E0B' }} />
                      <span>{opp.status || 'Active'}</span>
                    </span>
                  </div>

                  {/* Title & Department */}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0 0 4px' }}>{opp.title || opp.role || 'Untitled Opportunity'}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)', margin: '0 0 10px' }}>{opp.department || 'Engineering'}</p>

                  {/* Location & Mode */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#00D4FF" />
                      <span>{opp.location || 'Chennai (Hybrid)'}</span>
                    </span>
                    <span>•</span>
                    <span>{opp.workMode || opp.mode || 'Hybrid'}</span>
                  </div>

                  {/* Required Skills Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skills.slice(0, 4).map((sk, i) => (
                      <span key={i} style={{
                        fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-secondary, #94A3B8)', fontFamily: 'var(--font-mono)'
                      }}>
                        {typeof sk === 'object' ? sk.name : sk}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted, #94A3B8)' }}>
                        +{skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: Applicant metrics + Action Buttons */}
                <div style={{ paddingTop: '14px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted, #94A3B8)', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={13} color="#00D4FF" />
                      <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{appCount}</strong> Applications
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <UserCheck size={13} color="#8B5CF6" />
                      <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{shortCount}</strong> Shortlisted
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onFindMatchingStudents && onFindMatchingStudents(opp)}
                      className="btn-cyber-primary"
                      style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Find matching skilled candidates"
                    >
                      <Sparkles size={12} />
                      <span>Find Candidates</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(opp)}
                      className="btn-cyber-outline"
                      style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>

                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => onCloseOpportunity && onCloseOpportunity(oppKey)}
                        className="btn-cyber-outline"
                        style={{ padding: '5px 10px', fontSize: '11px', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }}
                      >
                        Close
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, #94A3B8)' }}>Closed</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteTargetOpp(opp)}
                      className="btn-cyber-outline"
                      style={{ padding: '5px 8px', fontSize: '11px', color: '#F43F5E', borderColor: 'rgba(244,63,94,0.3)' }}
                      title="Delete Opportunity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── CREATE / EDIT OPPORTUNITY MODAL (Cyber Theme) ── */}
      {isCreateModalOpen && (
        <div className="company-modal-overlay">
          <div className="company-modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D4FF' }}>
                  <Briefcase size={16} />
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {editingOpp ? 'Edit Opportunity Posting' : 'Publish Opportunity to Talent Ledger'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94A3B8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOpportunity} className="comp-stack-sm">
              <div className="comp-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Role Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="company-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time (Graduate Role)</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Positions Available</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.positions}
                    onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                    className="company-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Opportunity Title</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Cloud & Full-Stack Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="company-input"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div className="comp-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="company-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Location &amp; Mode</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="company-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Required Verified Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="company-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="comp-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Min. Course Milestone (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.minProgress}
                    onChange={(e) => setFormData({ ...formData, minProgress: e.target.value })}
                    className="company-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: '5px' }}>Min. AI Match Threshold (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.minMatch}
                    onChange={(e) => setFormData({ ...formData, minMatch: e.target.value })}
                    className="company-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-cyber-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyber-primary"
                >
                  {editingOpp ? 'Update Opportunity' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTargetOpp && (
        <div className="company-modal-overlay">
          <div className="company-modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Archive Posting?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94A3B8)', marginBottom: '18px' }}>
              Are you sure you want to archive <strong>{deleteTargetOpp.title}</strong>? Candidates will no longer be able to submit applications.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteTargetOpp(null)}
                className="btn-cyber-outline"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteOpportunity) onDeleteOpportunity(deleteTargetOpp.opportunityId || deleteTargetOpp.oppId || deleteTargetOpp.id);
                  setDeleteTargetOpp(null);
                }}
                className="btn-cyber-outline"
                style={{ color: '#F43F5E', borderColor: 'rgba(244,63,94,0.4)' }}
              >
                Archive Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
