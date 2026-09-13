import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Plus,
  Brain,
  CheckCircle,
  Clock,
  Users,
  Search,
  AlertCircle,
  Trash2,
  Edit,
  Code,
  FileText,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Send,
  Building,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

export default function CompanyTargetedAssessments({ user, onShowToast }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssessment, setViewingAssessment] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Assessment Form State
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: 'Answer all questions independently. Programming challenges run in a secure sandbox.',
    timeLimitMinutes: 45,
    totalMarks: 100,
    categories: ['Logical Reasoning', 'Aptitude', 'Programming']
  });

  // Targeting state
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstIds, setSelectedInstIds] = useState(new Set());
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Question builder state
  const [questions, setQuestions] = useState([]);
  const [showManualQModal, setShowManualQModal] = useState(false);
  const [manualQ, setManualQ] = useState({
    category: 'Logical Reasoning',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '0',
    marks: 5,
    difficulty: 'Intermediate',
    programmingLanguage: 'JavaScript',
    starterCode: 'function solution(input) {\n  // Write solution\n}',
    testCases: [{ input: '1, 2', expectedOutput: '3', isHidden: false }]
  });

  // NEXUS AI Draft state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiParams, setAiParams] = useState({
    category: 'Logical Reasoning',
    topic: 'Graph Algorithms & Concurrency',
    difficulty: 'Intermediate',
    count: 3,
    targetRole: 'Software Engineer'
  });
  const [aiDrafts, setAiDrafts] = useState([]);

  const token = localStorage.getItem('nexus_token') || localStorage.getItem('token');
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '') + '/api';

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/company/assessments`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setAssessments(data.data);
      }
    } catch (err) {
      console.error('[CompanyTargetedAssessments] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  const fetchInstitutions = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/college-master`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setInstitutions(data.data);
      }
    } catch (e) {}
  }, [apiBase, token]);

  const fetchStudentsForInstitutions = useCallback(async (instIds) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`${apiBase}/company/candidates`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        const filtered = instIds.size > 0
          ? data.data.filter(s => instIds.has(s.institutionId) || instIds.has(s.institution_id) || instIds.has(s.collegeId))
          : data.data;
        setAvailableStudents(filtered);
      }
    } catch (e) {
      setAvailableStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [apiBase, token]);

  useEffect(() => {
    fetchAssessments();
    fetchInstitutions();
  }, [fetchAssessments, fetchInstitutions]);

  useEffect(() => {
    if (showCreateModal && formStep === 2) {
      fetchStudentsForInstitutions(selectedInstIds);
    }
  }, [showCreateModal, formStep, selectedInstIds, fetchStudentsForInstitutions]);

  // Handle NEXUS AI Draft Generation
  const handleGenerateAiDrafts = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch(`${apiBase}/company/assessments/ai-drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(aiParams)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'AI generation failed');
      }
      setAiDrafts(data.data || []);
      if (onShowToast) {
        onShowToast({
          title: 'NEXUS AI Drafts Ready',
          message: `Generated ${data.data.length} questions. Please review and approve each item.`,
          type: 'success'
        });
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          title: 'AI Unavailable',
          message: err.message || 'NEXUS AI service is currently offline. You can create questions manually.',
          type: 'warning'
        });
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const approveAiDraft = (draft) => {
    setQuestions(prev => [...prev, { ...draft, approved: true }]);
    setAiDrafts(prev => prev.filter(d => d.id !== draft.id));
    if (onShowToast) {
      onShowToast({ title: 'Question Approved', message: 'Added to assessment questions.', type: 'info' });
    }
  };

  const handleAddManualQuestion = () => {
    if (!manualQ.questionText.trim()) return;
    setQuestions(prev => [...prev, { ...manualQ, id: `manual_${Date.now()}` }]);
    setShowManualQModal(false);
    setManualQ({
      category: 'Logical Reasoning',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '0',
      marks: 5,
      difficulty: 'Intermediate',
      programmingLanguage: 'JavaScript',
      starterCode: 'function solution(input) {\n  // Write solution\n}',
      testCases: [{ input: '1, 2', expectedOutput: '3', isHidden: false }]
    });
  };

  // Create & Publish Assessment
  const handleCreateAssessment = async (publishImmediately = false) => {
    try {
      // 1. Create Assessment Record
      const res = await fetch(`${apiBase}/company/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create assessment');
      const assessmentId = data.data.id;

      // 2. Add Questions
      for (const q of questions) {
        await fetch(`${apiBase}/company/assessments/${assessmentId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(q)
        });
      }

      // 3. Assign Targets
      if (selectedStudentIds.size > 0) {
        await fetch(`${apiBase}/company/assessments/${assessmentId}/targets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ studentIds: Array.from(selectedStudentIds) })
        });
      }

      // 4. Publish if requested
      if (publishImmediately) {
        await fetch(`${apiBase}/company/assessments/${assessmentId}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
      }

      if (onShowToast) {
        onShowToast({
          title: publishImmediately ? 'Assessment Published! 🚀' : 'Assessment Draft Saved',
          message: publishImmediately
            ? `Assigned to ${selectedStudentIds.size} students with notifications dispatched.`
            : 'Assessment saved as draft in your company workspace.',
          type: 'success'
        });
      }

      setShowCreateModal(false);
      setFormStep(1);
      setQuestions([]);
      setSelectedStudentIds(new Set());
      setSelectedInstIds(new Set());
      fetchAssessments();
    } catch (err) {
      if (onShowToast) onShowToast({ title: 'Creation Failed', message: err.message, type: 'error' });
    }
  };

  const handlePublishExisting = async (assessmentId) => {
    try {
      const res = await fetch(`${apiBase}/company/assessments/${assessmentId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Publish failed');
      if (onShowToast) {
        onShowToast({
          title: 'Assessment Published',
          message: 'Targeted students have been notified via secure platform ledger.',
          type: 'success'
        });
      }
      fetchAssessments();
    } catch (err) {
      if (onShowToast) onShowToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleViewResults = async (asmt) => {
    setViewingAssessment(asmt);
    setLoadingResults(true);
    try {
      const res = await fetch(`${apiBase}/company/assessments/${asmt.id}/results`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAssessmentResults(data.data);
      }
    } catch (e) {
      setAssessmentResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = (a.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'DRAFTS') return a.status === 'DRAFT';
    if (filterTab === 'PUBLISHED') return a.status === 'PUBLISHED';
    return true;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
              background: 'rgba(0, 212, 255, 0.12)', color: 'var(--cyber-cyan, #00d9ff)',
              border: '1px solid rgba(0, 212, 255, 0.3)', letterSpacing: '0.05em'
            }}>
              INDUSTRY TARGETED ASSESSMENTS
            </span>
            <span style={{ color: '#64748b' }}>//</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>TALENT VERIFICATION SUITE</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
            Targeted Technical Assessments
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#94a3b8' }}>
            Create tailored problem sets, generate question drafts via NEXUS AI, target specific institution cohorts, and review sandbox-evaluated candidate submissions.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              instructions: 'Answer all questions independently. Programming challenges run in a secure sandbox.',
              timeLimitMinutes: 45,
              totalMarks: 100,
              categories: ['Logical Reasoning', 'Aptitude', 'Programming']
            });
            setQuestions([]);
            setSelectedStudentIds(new Set());
            setSelectedInstIds(new Set());
            setFormStep(1);
            setShowCreateModal(true);
          }}
          className="btn-cyber-primary"
          style={{
            padding: '10px 20px', fontSize: '13.5px', fontWeight: 700, borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} />
          <span>Create Targeted Assessment</span>
        </button>
      </div>

      {/* ── FILTER TABS & SEARCH ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'ALL', label: 'All Assessments' },
            { id: 'PUBLISHED', label: 'Active & Published' },
            { id: 'DRAFTS', label: 'Drafts' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.08)',
                background: filterTab === t.id ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                color: filterTab === t.id ? 'var(--cyber-cyan, #00d9ff)' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px 8px 34px', borderRadius: '8px', width: '100%',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff', fontSize: '12.5px'
            }}
          />
        </div>
      </div>

      {/* ── ASSESSMENT LIST ── */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>Loading enterprise assessments...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <Award size={44} style={{ opacity: 0.25, margin: '0 auto 14px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '17px', color: '#ffffff' }}>No Assessments Created Yet</h3>
          <p style={{ margin: '0 0 18px', fontSize: '13px' }}>
            Author targeted challenges across Logical Reasoning, Aptitude, and Programming to benchmark priority talent.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-cyber-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Create Your First Assessment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredAssessments.map(asmt => (
            <div
              key={asmt.id}
              className="glass-card"
              style={{
                padding: '22px', borderRadius: '14px',
                border: asmt.status === 'PUBLISHED' ? '1px solid rgba(0, 212, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px',
                    background: asmt.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: asmt.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                    border: asmt.status === 'PUBLISHED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {asmt.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {asmt.time_limit_minutes || 45} mins
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                  {asmt.title}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  {asmt.description || 'Targeted technical assessment evaluated against enterprise criteria.'}
                </p>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Questions</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{asmt.question_count || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Targeted</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cyber-cyan, #00d9ff)' }}>{asmt.target_count || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Completed</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>{asmt.completed_count || 0}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                {asmt.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublishExisting(asmt.id)}
                    className="btn-cyber-primary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Send size={13} />
                    <span>Publish & Notify</span>
                  </button>
                )}
                <button
                  onClick={() => handleViewResults(asmt)}
                  className="btn-cyber-outline"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Award size={13} />
                  <span>Results ({asmt.completed_count || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE ASSESSMENT WIZARD MODAL ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 26, 51, 0.88)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            padding: '28px', borderRadius: '16px', background: 'rgba(10, 37, 64, 0.98)',
            border: '1px solid rgba(0, 212, 255, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.7)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#ffffff' }}>
                  Create Targeted Technical Assessment
                </h2>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Step {formStep} of 3: {formStep === 1 ? 'Assessment Parameters' : formStep === 2 ? 'Cohort Targeting' : 'Question Authoring & AI Drafts'}
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* STEP 1: PARAMETERS */}
            {formStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems & Core Algorithms Benchmark"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff', fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief overview of evaluation scope..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff', fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Time Limit (Minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.timeLimitMinutes}
                      onChange={e => setFormData({ ...formData, timeLimitMinutes: Number(e.target.value) })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff', fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={formData.totalMarks}
                      onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff', fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button
                    disabled={!formData.title.trim()}
                    onClick={() => setFormStep(2)}
                    className="btn-cyber-primary"
                    style={{ padding: '9px 20px', fontSize: '13px' }}
                  >
                    Next: Target Candidates →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: TARGETING */}
            {formStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                    1. Filter by Institution(s)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {institutions.map(inst => {
                      const isSelected = selectedInstIds.has(inst.id || inst.institutionId);
                      return (
                        <button
                          key={inst.id || inst.institutionId}
                          type="button"
                          onClick={() => {
                            setSelectedInstIds(prev => {
                              const next = new Set(prev);
                              const id = inst.id || inst.institutionId;
                              if (next.has(id)) next.delete(id);
                              else next.add(id);
                              return next;
                            });
                          }}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px',
                            border: isSelected ? '1px solid var(--cyber-cyan, #00d9ff)' : '1px solid rgba(255,255,255,0.1)',
                            background: isSelected ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? 'var(--cyber-cyan, #00d9ff)' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {inst.name || inst.institutionName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#cbd5e1' }}>
                      2. Select Target Students ({selectedStudentIds.size} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedStudentIds.size === availableStudents.length) {
                          setSelectedStudentIds(new Set());
                        } else {
                          setSelectedStudentIds(new Set(availableStudents.map(s => s.id || s.studentId)));
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--cyber-cyan, #00d9ff)', fontSize: '11.5px', cursor: 'pointer' }}
                    >
                      {selectedStudentIds.size === availableStudents.length ? 'Deselect All' : 'Select All Filtered'}
                    </button>
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)' }}>
                    {loadingStudents ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading candidates...</div>
                    ) : availableStudents.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No students found for selected filter.</div>
                    ) : (
                      availableStudents.map(stu => {
                        const sid = stu.id || stu.studentId;
                        const isChecked = selectedStudentIds.has(sid);
                        return (
                          <div
                            key={sid}
                            onClick={() => {
                              setSelectedStudentIds(prev => {
                                const next = new Set(prev);
                                if (next.has(sid)) next.delete(sid);
                                else next.add(sid);
                                return next;
                              });
                            }}
                            style={{
                              padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              background: isChecked ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                              cursor: 'pointer', marginBottom: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input type="checkbox" checked={isChecked} onChange={() => {}} />
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{stu.name}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                  {stu.collegeName || stu.institution || 'College'} • {stu.department || 'Engineering'}
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: '11.5px', color: 'var(--cyber-cyan, #00d9ff)', fontWeight: 700 }}>
                              CGPA: {stu.cgpa || '8.0'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button onClick={() => setFormStep(1)} className="btn-cyber-outline" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                    ← Back
                  </button>
                  <button onClick={() => setFormStep(3)} className="btn-cyber-primary" style={{ padding: '8px 20px', fontSize: '12.5px' }}>
                    Next: Add Questions ({questions.length}) →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: QUESTIONS */}
            {formStep === 3 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    Questions in Assessment ({questions.length})
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setShowManualQModal(true)}
                      className="btn-cyber-outline"
                      style={{ padding: '7px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={13} /> Add Manually
                    </button>
                    <button
                      onClick={() => setShowAiModal(true)}
                      className="btn-cyber-primary"
                      style={{
                        padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #00d9ff 100%)', border: 'none'
                      }}
                    >
                      <Sparkles size={13} /> Generate AI Drafts
                    </button>
                  </div>
                </div>

                {/* Question Cards List */}
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {questions.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                      No questions added yet. Use manual authoring or NEXUS AI drafts.
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,212,255,0.1)', color: 'var(--cyber-cyan, #00d9ff)' }}>
                              {q.category}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{q.marks} Marks • {q.difficulty}</span>
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{q.questionText}</div>
                        </div>
                        <button
                          onClick={() => setQuestions(prev => prev.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom Wizard Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <button onClick={() => setFormStep(2)} className="btn-cyber-outline" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                    ← Back
                  </button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleCreateAssessment(false)}
                      className="btn-cyber-outline"
                      style={{ padding: '9px 16px', fontSize: '12.5px' }}
                    >
                      Save as Draft
                    </button>
                    <button
                      disabled={questions.length === 0}
                      onClick={() => handleCreateAssessment(true)}
                      className="btn-cyber-primary"
                      style={{ padding: '9px 20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} />
                      <span>Publish & Notify Targets</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NEXUS AI DRAFT MODAL ── */}
      {showAiModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 26, 51, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
            padding: '24px', borderRadius: '14px', background: 'rgba(10, 37, 64, 0.98)',
            border: '1px solid rgba(124, 58, 237, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#a78bfa" />
                <h3 style={{ margin: 0, fontSize: '17px', color: '#ffffff' }}>NEXUS AI Question Drafts</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#cbd5e1', marginBottom: '4px' }}>Category</label>
                <select
                  value={aiParams.category}
                  onChange={e => setAiParams({ ...aiParams, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                >
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Aptitude">Quantitative Aptitude</option>
                  <option value="Programming">Programming & Algorithms</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#cbd5e1', marginBottom: '4px' }}>Difficulty</label>
                <select
                  value={aiParams.difficulty}
                  onChange={e => setAiParams({ ...aiParams, difficulty: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#cbd5e1', marginBottom: '4px' }}>Topic / Skill Focus</label>
              <input
                type="text"
                value={aiParams.topic}
                onChange={e => setAiParams({ ...aiParams, topic: e.target.value })}
                placeholder="e.g. Graph Traversals, Sliding Window, Probability..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
              />
            </div>

            <button
              disabled={aiGenerating}
              onClick={handleGenerateAiDrafts}
              className="btn-cyber-primary"
              style={{
                width: '100%', padding: '9px', fontSize: '13px', fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed 0%, #00d9ff 100%)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px'
              }}
            >
              {aiGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{aiGenerating ? 'NEXUS AI is drafting challenges...' : 'Generate 3 AI Draft Questions'}</span>
            </button>

            {/* Drafts Review Area */}
            {aiDrafts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#a78bfa' }}>
                  Review Draft Questions (Required before adding):
                </div>
                {aiDrafts.map((draft, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px', borderRadius: '8px',
                      background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)',
                      display: 'flex', flexDirection: 'column', gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#a78bfa', background: 'rgba(124,58,237,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                        DRAFT // REVIEW REQUIRED
                      </span>
                      <button
                        onClick={() => approveAiDraft(draft)}
                        className="btn-cyber-primary"
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <CheckCircle size={12} /> Approve & Add
                      </button>
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff' }}>{draft.questionText}</div>
                    {draft.options && draft.options.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Options: {draft.options.join(' • ')} (Key: {draft.correctAnswer})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MANUAL QUESTION MODAL ── */}
      {showManualQModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 26, 51, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
            padding: '24px', borderRadius: '14px', background: 'rgba(10, 37, 64, 0.98)',
            border: '1px solid rgba(0, 212, 255, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#ffffff' }}>Add Manual Question</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Category</label>
                <select
                  value={manualQ.category}
                  onChange={e => setManualQ({ ...manualQ, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                >
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Aptitude">Quantitative Aptitude</option>
                  <option value="Programming">Programming (Code Challenge)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Question / Problem Statement</label>
                <textarea
                  rows={3}
                  value={manualQ.questionText}
                  onChange={e => setManualQ({ ...manualQ, questionText: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                />
              </div>

              {manualQ.category !== 'Programming' ? (
                <>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Options (A, B, C, D)</label>
                    {manualQ.options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={e => {
                          const next = [...manualQ.options];
                          next[i] = e.target.value;
                          setManualQ({ ...manualQ, options: next });
                        }}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', marginBottom: '4px' }}
                      />
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Correct Answer (Index 0-3 or exact text)</label>
                    <input
                      type="text"
                      value={manualQ.correctAnswer}
                      onChange={e => setManualQ({ ...manualQ, correctAnswer: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Starter Code</label>
                  <textarea
                    rows={4}
                    value={manualQ.starterCode}
                    onChange={e => setManualQ({ ...manualQ, starterCode: e.target.value })}
                    style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#00d9ff', fontSize: '12px' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setShowManualQModal(false)} className="btn-cyber-outline" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  Cancel
                </button>
                <button onClick={handleAddManualQuestion} className="btn-cyber-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>
                  Add to Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS MODAL ── */}
      {viewingAssessment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 26, 51, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '720px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
            padding: '24px', borderRadius: '16px', background: 'rgba(10, 37, 64, 0.98)',
            border: '1px solid rgba(0, 212, 255, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>
                  Candidate Performance: {viewingAssessment.title}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Targeted Student Cohort Results
                </p>
              </div>
              <button onClick={() => setViewingAssessment(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {loadingResults ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                Loading scoreboard...
              </div>
            ) : !assessmentResults || assessmentResults.results.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                No candidate attempts submitted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessmentResults.results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>
                        {r.student_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {r.institution_name} • {r.department}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '15px', fontWeight: 800,
                        color: r.result_status === 'PASSED' ? '#10b981' : (r.score !== null ? '#f87171' : '#94a3b8')
                      }}>
                        {r.score !== null ? `${r.score}%` : 'PENDING'}
                      </div>
                      <span style={{
                        fontSize: '9.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px',
                        background: r.result_status === 'PASSED' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                        color: r.result_status === 'PASSED' ? '#10b981' : '#94a3b8'
                      }}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
