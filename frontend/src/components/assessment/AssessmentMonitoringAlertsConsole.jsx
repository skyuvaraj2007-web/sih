import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  User,
  BookOpen,
  Send,
  Check,
  X,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  Users
} from 'lucide-react';

export default function AssessmentMonitoringAlertsConsole({
  role = 'faculty', // 'faculty' | 'coordinator' | 'institution' | 'company'
  user = null,
  onShowToast = null
}) {
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const token = localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');

  // Resolve API endpoint based on role
  const getEndpoint = useCallback(() => {
    switch (role) {
      case 'coordinator':
        return '/api/assessments/monitoring/coordinator-alerts';
      case 'institution':
        return '/api/assessments/monitoring/institution-overview';
      case 'company':
      case 'industry':
        return '/api/assessments/monitoring/company-alerts';
      case 'faculty':
      default:
        return '/api/assessments/monitoring/faculty-alerts';
    }
  }, [role]);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = getEndpoint();
      const statusParam = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await fetch(`${endpoint}${statusParam}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (role === 'institution' && json.events) {
          setAlerts(json.events || []);
          setMetrics(json.metrics || null);
        } else {
          setAlerts(json.data || []);
        }
      }
    } catch (err) {
      console.warn('[AssessmentAlertsConsole] Load note:', err.message);
    } finally {
      setLoading(false);
    }
  }, [getEndpoint, filterStatus, role, token]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Handle Review Action (CONFIRMED, DISMISSED, NEEDS_MORE_REVIEW)
  const handleReviewAction = async (eventId, reviewStatus) => {
    try {
      setReviewing(true);
      const res = await fetch(`/api/assessments/monitoring/events/${eventId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          reviewStatus,
          notes: reviewNotes.trim()
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (onShowToast) {
          onShowToast({
            title: 'Event Reviewed',
            message: `Event marked as "${reviewStatus}". Updated in PostgreSQL audit ledger.`,
            type: 'success'
          });
        }
        setSelectedEvent(null);
        setReviewNotes('');
        loadAlerts();
      } else {
        if (onShowToast) onShowToast({ title: 'Review Failed', message: json.message, type: 'error' });
      }
    } catch (err) {
      if (onShowToast) onShowToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  // Handle Escalation to Coordinator or Company Admin
  const handleEscalateAction = async (eventId) => {
    try {
      setReviewing(true);
      const targetRole = role === 'company' || role === 'industry' ? 'company_admin' : 'coordinator';
      const res = await fetch(`/api/assessments/monitoring/events/${eventId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          notes: reviewNotes.trim() || 'Escalated for senior academic/evaluator confirmation.',
          targetRole
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (onShowToast) {
          onShowToast({
            title: 'Event Escalated',
            message: `Event escalated to ${targetRole}. Immediate authority notification dispatched.`,
            type: 'success'
          });
        }
        setSelectedEvent(null);
        setReviewNotes('');
        loadAlerts();
      } else {
        if (onShowToast) onShowToast({ title: 'Escalation Failed', message: json.message, type: 'error' });
      }
    } catch (err) {
      if (onShowToast) onShowToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Math.max(0, Math.floor((new Date() - new Date(dateStr)) / 1000));
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  // Severity pill styling
  const renderSeverityBadge = (severity) => {
    const s = String(severity || 'WARNING').toUpperCase();
    if (s === 'REVIEW_REQUIRED' || s === 'HIGH' || s === 'CRITICAL') {
      return (
        <span style={{
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <AlertOctagon size={12} />
          <span>REVIEW REQUIRED</span>
        </span>
      );
    }
    if (s === 'WARNING' || s === 'MEDIUM') {
      return (
        <span style={{
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <AlertTriangle size={12} />
          <span>WARNING</span>
        </span>
      );
    }
    return (
      <span style={{
        background: 'rgba(56, 189, 248, 0.15)',
        color: '#38bdf8',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Clock size={12} />
        <span>INFO</span>
      </span>
    );
  };

  // Status pill styling
  const renderStatusBadge = (status) => {
    const st = String(status || 'PENDING_REVIEW').toUpperCase();
    if (st === 'CONFIRMED') {
      return <span style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Confirmed Flag</span>;
    }
    if (st === 'DISMISSED') {
      return <span style={{ color: '#4ade80', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Dismissed (Benign)</span>;
    }
    if (st === 'ESCALATED') {
      return <span style={{ color: '#c084fc', background: 'rgba(192,132,252,0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Escalated</span>;
    }
    if (st === 'NEEDS_MORE_REVIEW') {
      return <span style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Under Review</span>;
    }
    return <span style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Pending Review</span>;
  };

  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.student_name && a.student_name.toLowerCase().includes(q)) ||
      (a.candidate_name && a.candidate_name.toLowerCase().includes(q)) ||
      (a.roll_number && a.roll_number.toLowerCase().includes(q)) ||
      (a.assessment_title && a.assessment_title.toLowerCase().includes(q)) ||
      (a.event_type && a.event_type.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ marginTop: '20px' }}>
      {/* ── HEADER TITLE & CONTROLS ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert style={{ color: 'var(--cyber-cyan, #00d9ff)', width: '22px', height: '22px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-heading, #f8fafc)' }}>
              Assessment Monitoring & Authority Alerts
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0' }}>
            {role === 'company' || role === 'industry'
              ? 'Real-time telemetry and suspicious activity alerts strictly for your candidate assessments.'
              : role === 'coordinator'
              ? 'Department-wide integrity events and escalated alerts requiring coordinator oversight.'
              : role === 'institution'
              ? 'Institution-wide examination telemetry, active proctored sessions, and academic reviews.'
              : 'Real-time proctoring alerts and integrity signals for your assigned students and course exams.'}
          </p>
        </div>

        <button
          onClick={loadAlerts}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── INSTITUTION METRICS OVERVIEW (if available) ── */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>TOTAL SESSIONS</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{metrics.total_sessions || 0}</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>ACTIVE SESSIONS</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{metrics.active_sessions || 0}</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>PENDING REVIEWS</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>{metrics.pending_reviews || 0}</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600 }}>ESCALATED CASES</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>{metrics.escalated_reviews || 0}</div>
          </div>
        </div>
      )}

      {/* ── STATUS FILTER PILLS & SEARCH BAR ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'PENDING_REVIEW', label: 'Pending Review' },
            { id: 'ESCALATED', label: 'Escalated Cases' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'DISMISSED', label: 'Dismissed' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.08)',
                background: filterStatus === f.id ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                color: filterStatus === f.id ? 'var(--cyber-cyan, #00d9ff)' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search student, test, or event..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '7px 12px 7px 32px',
              borderRadius: '8px',
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '12.5px'
            }}
          />
        </div>
      </div>

      {/* ── ALERTS TABLE / LIST ── */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: '13px', margin: 0 }}>Scanning monitoring telemetry...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div style={{
          padding: '48px 20px',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '12px',
          border: '1px dashed rgba(255,255,255,0.1)',
          color: '#94a3b8'
        }}>
          <ShieldCheck size={36} style={{ color: '#4ade80', margin: '0 auto 10px', opacity: 0.8 }} />
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>
            No Active Integrity Signals
          </h4>
          <p style={{ margin: 0, fontSize: '13px' }}>
            All candidate assessment sessions are operating within standard integrity guidelines.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '11.5px' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>CANDIDATE / STUDENT</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>ASSESSMENT</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>EVENT TYPE</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>SEVERITY</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>OCCURRED</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(ev => {
                  const studentName = ev.student_name || ev.candidate_name || 'Candidate';
                  const studentRoll = ev.roll_number || 'N/A';
                  return (
                    <tr
                      key={ev.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{studentName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{studentRoll}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{ev.assessment_title || 'Assessment'}</div>
                        <div style={{ fontSize: '11px', color: '#38bdf8' }}>{ev.assessment_type || 'ACADEMIC'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontFamily: 'monospace' }}>
                          {ev.event_type}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.event_description || 'Potential integrity event'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {renderSeverityBadge(ev.severity)}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px' }}>
                        {formatTimeAgo(ev.occurred_at || ev.event_timestamp)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {renderStatusBadge(ev.review_status)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedEvent(ev);
                            setReviewNotes('');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#38bdf8',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE EVENT REVIEW & ESCALATION MODAL ── */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0d1527',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
                  HUMAN REVIEW WORKFLOW // {selectedEvent.assessment_type}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {selectedEvent.event_type} Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Event Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>CANDIDATE</span>
                <strong style={{ color: '#f8fafc', fontSize: '14px' }}>
                  {selectedEvent.student_name || selectedEvent.candidate_name || 'Candidate'}
                </strong>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{selectedEvent.roll_number || 'N/A'}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ASSESSMENT</span>
                <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{selectedEvent.assessment_title}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>SEVERITY LEVEL</span>
                <div style={{ marginTop: '2px' }}>{renderSeverityBadge(selectedEvent.severity)}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>TIME OF EVENT</span>
                <div style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '2px' }}>
                  {new Date(selectedEvent.occurred_at || selectedEvent.event_timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Event Description & Diagnostic Metadata */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                TELEMETRY DIAGNOSTIC
              </span>
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px',
                color: '#f8fafc',
                lineHeight: 1.5
              }}>
                {selectedEvent.event_description || 'Telemetry signal recorded during assessment.'}
                {selectedEvent.duration_seconds > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#38bdf8' }}>
                    Signal duration: {selectedEvent.duration_seconds} seconds • Confidence: {selectedEvent.confidence || 100}%
                  </div>
                )}
              </div>
            </div>

            {/* Reviewer Comment Box */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                REVIEWER OBSERVATION / COMMENTS
              </label>
              <textarea
                rows={3}
                placeholder="Enter objective assessment notes (e.g., student looked down at scratch paper, or intentional tab switch noted)..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Review Decision Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <button
                  disabled={reviewing}
                  onClick={() => handleReviewAction(selectedEvent.id, 'DISMISSED')}
                  style={{
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: reviewing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={16} />
                  <span>Dismiss (False Positive)</span>
                </button>

                <button
                  disabled={reviewing}
                  onClick={() => handleReviewAction(selectedEvent.id, 'CONFIRMED')}
                  style={{
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: reviewing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertOctagon size={16} />
                  <span>Confirm Integrity Flag</span>
                </button>
              </div>

              {/* Escalation Action Button */}
              {(role === 'faculty' || role === 'industry' || role === 'company') && (
                <button
                  disabled={reviewing}
                  onClick={() => handleEscalateAction(selectedEvent.id)}
                  style={{
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'rgba(192, 132, 252, 0.15)',
                    border: '1px solid rgba(192, 132, 252, 0.4)',
                    color: '#c084fc',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: reviewing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowUpRight size={16} />
                  <span>
                    {role === 'company' || role === 'industry'
                      ? 'Escalate to Company Assessment Administrator'
                      : 'Escalate to Academic Coordinator'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

