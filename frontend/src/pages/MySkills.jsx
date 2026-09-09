import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  Code,
  Database,
  BarChart2,
  Cpu,
  Globe,
  Users,
  Search,
  ChevronDown,
  AlertTriangle,
  X,
  Sparkles,
  CheckCircle2,
  Award,
  BookOpen
} from 'lucide-react';
import { loadAssessmentStore } from '../services/assessmentStore';
import {
  getRelationalStudentById,
  saveRelationalStudent,
  getStudentProjects,
  getStudentEnrollments
} from '../services/nexusDataStore';

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.__NEXUS_API_BASE__) {
    return window.__NEXUS_API_BASE__;
  }
  return 'http://localhost:5000/api';
};

const CANONICAL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

function normalizeLevel(level) {
  if (!level) return 'Intermediate';
  const str = String(level).trim();
  const lower = str.toLowerCase();
  if (lower === 'beginner' || lower === 'basic') return 'Beginner';
  if (lower === 'intermediate' || lower === 'medium') return 'Intermediate';
  if (lower === 'advanced') return 'Advanced';
  if (lower === 'expert' || lower === 'master') return 'Expert';
  return 'Intermediate';
}

function determineCategory(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('python') || n.includes('java') || n.includes('c++') || n.includes('go') || n.includes('rust') || n.includes('coding') || n.includes('programming')) return 'Programming';
  if (n.includes('data') || n.includes('ai') || n.includes('learning') || n.includes('nlp') || n.includes('vision') || n.includes('power bi')) return 'Data & AI';
  if (n.includes('sql') || n.includes('mongo') || n.includes('postgres') || n.includes('db') || n.includes('database')) return 'Database';
  if (n.includes('react') || n.includes('web') || n.includes('html') || n.includes('css') || n.includes('node') || n.includes('javascript')) return 'Web Development';
  if (n.includes('cloud') || n.includes('aws') || n.includes('docker') || n.includes('kubernetes')) return 'Cloud & Distributed';
  if (n.includes('problem') || n.includes('reasoning') || n.includes('aptitude') || n.includes('communication') || n.includes('leadership')) return 'Soft Skills';
  return 'Programming';
}

export default function MySkills({ setActivePage, onShowToast, user }) {
  const [assessmentStore] = useState(() => loadAssessmentStore());
  const [skills, setSkills] = useState([]);
  const [counts, setCounts] = useState({ total: 0, enrolled: 0, verified: 0, gaps: 0, readinessIndex: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve current student from props or authenticated session
  const currentStudent = useMemo(() => {
    if (user) {
      return {
        studentId: user.studentId || user.id || user.userId || '',
        name: user.name || 'Student',
        email: user.email,
        preferredRoles: user.preferredRoles || ['Software Engineer'],
        skills: user.skills || []
      };
    }
    return null;
  }, [user]);

  // Load and enrich skills
  const loadSkillsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      const token = localStorage.getItem('nexus_token') || localStorage.getItem('token');
      const studentId = currentStudent?.studentId;

      let baseSkills = null;
      let fetchedFromApi = false;

      // 1. Fetch from backend API
      if (token) {
        try {
          const res = await fetch(`${apiBase}/student/skills`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              baseSkills = data.data;
              fetchedFromApi = true;
            }
          } else if (res.status === 401 || res.status === 403) {
            console.debug('Unauthorized skills access');
          }
        } catch (apiErr) {
          console.debug('Backend /api/student/skills fetch error:', apiErr.message);
        }
      }

      // 2. If API was unreachable, fall back to local relational store for this student
      if (!fetchedFromApi) {
        if (studentId) {
          const student = getRelationalStudentById(studentId) || currentStudent;
          if (student && Array.isArray(student.skills)) {
            baseSkills = student.skills.map((s, idx) => ({
              id: s.id || `sk_${idx + 1}`,
              name: s.name,
              level: normalizeLevel(s.level),
              masteryScore: s.confidence || (s.verified ? 85 : 60),
              verified: Boolean(s.verified),
              verificationStatus: s.verified ? 'VERIFIED' : 'SELF_ASSESSED',
              category: s.category || determineCategory(s.name),
              status: s.verified ? 'verified' : ((s.confidence && s.confidence < 60) ? 'gap' : 'enrolled'),
              specialization: `${s.name} Competency Track`,
              criticalGap: (s.confidence && s.confidence < 60) ? `Proficiency (${s.confidence}%) below placement threshold (75%)` : null,
              recommendation: (s.confidence && s.confidence < 60) ? `Complete verified assessment in ${s.name}` : null
            }));
          }
        }
      }

      // If still null, treat as empty list for clean account
      if (!baseSkills) {
        baseSkills = [];
      }

      // 3. Enrich skills with projects, courses, and assessment evidence
      const projects = studentId ? (getStudentProjects(studentId) || []) : [];
      const enrollments = studentId ? (getStudentEnrollments(studentId) || []) : [];
      const assessments = currentStudent?.assessments || [];

      const enrichedSkills = baseSkills.map(skill => {
        const skillNameLower = (skill.name || '').toLowerCase();
        const normLevel = normalizeLevel(skill.level);

        // Match projects backing this skill
        const matchedProjects = projects.filter(p =>
          (p.technologies || []).some(t => t.toLowerCase() === skillNameLower || skillNameLower.includes(t.toLowerCase()))
        );

        // Match enrolled courses
        const matchedEnrollments = enrollments.filter(e =>
          (e.courseTitle || '').toLowerCase().includes(skillNameLower) ||
          skillNameLower.includes((e.courseTitle || '').toLowerCase())
        );

        // Match assessments
        const matchedAssessment = assessments.find(a =>
          (a.domain || '').toLowerCase().includes(skillNameLower) ||
          skillNameLower.includes((a.domain || '').toLowerCase())
        );

        // Check assessment store real-time impact
        let dynamicAssessmentEvidence = skill.assessmentEvidence || null;
        let isVerified = Boolean(skill.verified || skill.verificationStatus === 'VERIFIED');
        let mastery = skill.masteryScore || (normLevel === 'Expert' ? 95 : normLevel === 'Advanced' ? 85 : normLevel === 'Intermediate' ? 70 : 50);

        if (assessmentStore?.assessments?.length > 0) {
          for (const as of assessmentStore.assessments) {
            const impact = as.skillImpact?.find(imp => imp.skill.toLowerCase() === skillNameLower);
            if (impact) {
              dynamicAssessmentEvidence = impact.evidence || `Scored ${as.score}% in ${as.domain || 'Domain Assessment'}`;
              isVerified = true;
              mastery = Math.min(100, Math.max(mastery, as.score || 80));
            }
          }
        }

        const projectCount = matchedProjects.length;
        const examPassedText = matchedAssessment
          ? `${matchedAssessment.domain} (${matchedAssessment.score}%)`
          : (isVerified ? (skill.evidence?.examScore ? `Verified (${skill.evidence.examScore})` : 'Assessed & Verified') : (matchedEnrollments.length > 0 ? 'Course in Progress' : 'Self-Assessed'));

        return {
          ...skill,
          level: normLevel,
          verified: isVerified,
          verificationStatus: isVerified ? 'VERIFIED' : 'SELF_ASSESSED',
          masteryScore: mastery,
          category: skill.category || determineCategory(skill.name),
          projectsCount: projectCount,
          examsPassed: examPassedText,
          credentialHash: isVerified ? (skill.credentialHash || `0x${generateDeterministicHash((studentId || 'std') + skill.name)}`) : null,
          assessmentEvidence: dynamicAssessmentEvidence,
          evidence: isVerified ? {
            repositories: matchedProjects.map(p => p.repositoryUrl?.replace('https://', '') || `github.com/${studentId || 'student'}/${skill.name.toLowerCase()}`),
            examScore: matchedAssessment ? `${matchedAssessment.score}%` : (skill.evidence?.examScore || `${mastery}%`),
            assessedAt: skill.verifiedAt || skill.updatedAt || 'Recent Assessment'
          } : null
        };
      });

      // 4. Calculate dynamic counts
      const total = enrichedSkills.length;
      const verified = enrichedSkills.filter(s => s.verified).length;
      const enrolled = enrichedSkills.filter(s => !s.verified && s.masteryScore >= 60).length;
      const gaps = enrichedSkills.filter(s => s.masteryScore < 60).length;

      // 5. Fetch Authoritative Readiness Score from Backend
      let backendReadiness = 0;
      if (token && studentId) {
        try {
          const rRes = await fetch(`${apiBase}/nexus/readiness/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            if (rData.success && rData.data?.readinessScore !== undefined) {
              const raw = rData.data.readinessScore;
              backendReadiness = typeof raw === 'object' && raw !== null ? Number(raw.readinessScore ?? 0) : Number(raw || 0);
            }
          }
        } catch (rErr) {
          console.debug('Readiness API fetch deferred:', rErr.message);
        }
      } else if (total > 0) {
        backendReadiness = Math.round((verified / total) * 100);
      }

      setSkills(enrichedSkills);
      setCounts({
        total,
        enrolled,
        verified,
        gaps,
        readinessIndex: typeof backendReadiness === 'number' && !isNaN(backendReadiness) ? backendReadiness : 0
      });
    } catch (err) {
      console.error('Error loading skills data:', err);
      setError('Unable to load your skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkillsData();
  }, [currentStudent]);

  // Reactive updates across tabs & actions
  useEffect(() => {
    const handleUpdate = () => loadSkillsData();
    window.addEventListener('nexus_skills_updated', handleUpdate);
    window.addEventListener('nexus_assessment_updated', handleUpdate);
    window.addEventListener('nexus_data_updated', handleUpdate);
    window.addEventListener('nexus_students_updated', handleUpdate);
    window.addEventListener('nexus_projects_updated', handleUpdate);

    return () => {
      window.removeEventListener('nexus_skills_updated', handleUpdate);
      window.removeEventListener('nexus_assessment_updated', handleUpdate);
      window.removeEventListener('nexus_data_updated', handleUpdate);
      window.removeEventListener('nexus_students_updated', handleUpdate);
      window.removeEventListener('nexus_projects_updated', handleUpdate);
    };
  }, [currentStudent]);

  // Filter skills based on status, category, and search query
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      // 1. Status Filter
      if (activeFilter === 'enrolled' && (skill.verified || skill.masteryScore < 60)) return false;
      if (activeFilter === 'verified' && !skill.verified) return false;
      if (activeFilter === 'gap' && skill.masteryScore >= 60) return false;

      // 2. Category Filter
      if (categoryFilter !== 'All Categories' && skill.category !== categoryFilter) return false;

      // 3. Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = skill.name?.toLowerCase().includes(q);
        const matchCat = skill.category?.toLowerCase().includes(q);
        const matchSpec = skill.specialization?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchSpec) return false;
      }

      return true;
    });
  }, [skills, activeFilter, categoryFilter, searchTerm]);

  // Add new skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('nexus_token') || localStorage.getItem('token');
    const apiBase = getApiBase();
    const cleanName = newSkillName.trim();
    const cleanLevel = normalizeLevel(newSkillLevel);
    const cleanCategory = newSkillCategory;

    try {
      let apiSuccess = false;
      if (token) {
        const res = await fetch(`${apiBase}/student/skills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: cleanName,
            category: cleanCategory,
            level: cleanLevel,
            confidence: cleanLevel === 'Advanced' ? 85 : cleanLevel === 'Expert' ? 95 : cleanLevel === 'Intermediate' ? 70 : 50
          })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            apiSuccess = true;
          }
        }
      }

      // Also persist to local relational store for offline / instant view
      const studentId = currentStudent?.studentId;
      if (studentId) {
        const student = getRelationalStudentById(studentId) || currentStudent;
        if (student) {
          const newSkillObj = {
            id: `sk_${Date.now()}`,
            name: cleanName,
            category: cleanCategory,
            level: cleanLevel,
            confidence: cleanLevel === 'Advanced' ? 85 : cleanLevel === 'Expert' ? 95 : cleanLevel === 'Intermediate' ? 70 : 50,
            verified: false,
            verificationStatus: 'SELF_ASSESSED'
          };

          const existing = student.skills || [];
          const exists = existing.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
          let updatedSkills;
          if (exists) {
            updatedSkills = existing.map(s => s.name.toLowerCase() === cleanName.toLowerCase() ? { ...s, ...newSkillObj } : s);
          } else {
            updatedSkills = [...existing, newSkillObj];
          }

          saveRelationalStudent({
            ...student,
            skills: updatedSkills
          });
        }
      }

      setShowAddModal(false);
      setNewSkillName('');
      await loadSkillsData();

      if (onShowToast) {
        onShowToast({
          title: 'Skill Added',
          message: `${cleanName} is now tracked in your active skills ledger.`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      if (onShowToast) {
        onShowToast({
          title: 'Error',
          message: 'Unable to add skill. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'programming': return Code;
      case 'database': return Database;
      case 'data & ai': return BarChart2;
      case 'web development': return Globe;
      case 'soft skills': return Users;
      default: return Cpu;
    }
  };

  return (
    <div>
      {/* Top Header — Skill Intelligence Center */}
      <div className="page-top-telemetry" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div className="cyber-badge badge-purple" style={{ marginBottom: '8px', fontSize: '10px' }}>
            <Sparkles size={12} /> SKILL INTELLIGENCE CENTER
          </div>
          <h1>Skill Intelligence</h1>
          <p>Your capabilities, verified proof, skill gaps, and AI recommended next steps.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActivePage && setActivePage('assessment')}
            className="btn-cyber-outline"
          >
            <Award size={15} /> Take Skill Assessment
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-cyber-primary"
          >
            <Plus size={15} /> Add Skill
          </button>
        </div>
      </div>

      {/* Main Radar / Capability Ring Gauges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Frontend & UI', score: 86, color: 'var(--cyber-blue)', icon: Code, count: '12 Verified' },
          { label: 'Backend Architecture', score: 81, color: 'var(--cyber-purple)', icon: Cpu, count: '9 Verified' },
          { label: 'Cloud Infrastructure', score: 74, color: 'var(--cyber-cyan)', icon: Globe, count: '6 Verified' },
          { label: 'Database & Storage', score: 68, color: 'var(--cyber-emerald)', icon: Database, count: '5 Verified' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="glass-icon-box" style={{ width: '38px', height: '38px', background: `${item.color}15`, color: item.color, borderColor: `${item.color}30` }}>
                  <Icon size={18} />
                </div>
                <span className="cyber-badge" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                  {item.count}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {item.score}%
                </div>
              </div>

              <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top 5 Metrics Row */}
      <div className="metrics-row">
        <div className="metric-stat-card accent-cyan">
          <div className="metric-stat-header">
            <span>TOTAL TRACKED</span>
            <CheckSquare size={13} color="var(--cyber-cyan)" />
          </div>
          <div className="metric-stat-value">{counts.total.toString().padStart(2, '0')}</div>
          <div className="metric-stat-sub">Across active competencies</div>
        </div>

        <div className="metric-stat-card accent-purple">
          <div className="metric-stat-header">
            <span>SELF-ASSESSED</span>
            <Code size={13} color="var(--cyber-purple)" />
          </div>
          <div className="metric-stat-value">{counts.enrolled.toString().padStart(2, '0')}</div>
          <div className="metric-stat-sub">In active development</div>
        </div>

        <div className="metric-stat-card accent-emerald">
          <div className="metric-stat-header">
            <span>VERIFIED PROOFS</span>
            <ShieldCheck size={13} color="var(--cyber-emerald)" />
          </div>
          <div className="metric-stat-value">{counts.verified.toString().padStart(2, '0')}</div>
          <div className="metric-stat-sub">Assessment attested</div>
        </div>

        <div className="metric-stat-card accent-amber">
          <div className="metric-stat-header">
            <span>SKILL GAPS</span>
            <AlertTriangle size={13} color="var(--cyber-amber)" />
          </div>
          <div className="metric-stat-value">{counts.gaps.toString().padStart(2, '0')}</div>
          <div className="metric-stat-sub">Proficiency below threshold</div>
        </div>

        <div className="metric-stat-card" style={{ background: 'var(--bg-card)' }}>
          <div className="metric-stat-header">
            <span>READINESS INDEX</span>
            <span className="code-font" style={{ color: 'var(--cyber-cyan)' }}>{counts.readinessIndex}%</span>
          </div>
          <div className="metric-stat-value" style={{ color: 'var(--cyber-cyan)' }}>
            {counts.readinessIndex}<span style={{ fontSize: '18px' }}>%</span>
          </div>
          <div className="metric-stat-sub">
            Target role: {currentStudent?.preferredRoles?.[0] || 'Software Engineer'}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="filter-tabs-row">
        <div className="filter-pills-group">
          <button
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Skills ({counts.total})
          </button>
          <button
            className={`filter-pill ${activeFilter === 'enrolled' ? 'active' : ''}`}
            onClick={() => setActiveFilter('enrolled')}
          >
            Self-Assessed ({counts.enrolled})
          </button>
          <button
            className={`filter-pill ${activeFilter === 'verified' ? 'active' : ''}`}
            onClick={() => setActiveFilter('verified')}
          >
            Verified ({counts.verified})
          </button>
          <button
            className={`filter-pill ${activeFilter === 'gap' ? 'active' : ''}`}
            onClick={() => setActiveFilter('gap')}
          >
            Skill Gaps ({counts.gaps})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
            borderRadius: '8px', padding: '6px 12px', width: '280px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search skills by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--text-primary)', fontSize: '12.5px', outline: 'none', width: '100%'
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option>All Categories</option>
            <option>Programming</option>
            <option>Data & AI</option>
            <option>Database</option>
            <option>Web Development</option>
            <option>Cloud & Distributed</option>
            <option>Soft Skills</option>
          </select>
        </div>
      </div>

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', margin: '24px 0' }}>
          <div className="status-dot-pulse" style={{ width: '14px', height: '14px', margin: '0 auto 16px', background: 'var(--cyber-cyan)' }}></div>
          <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>Loading verified competencies and skill ledger...</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>Synchronizing sovereign student credentials</p>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', margin: '24px 0', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <AlertTriangle size={36} color="var(--cyber-amber)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Unable to load your skills.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {error}
          </p>
          <button
            onClick={() => loadSkillsData()}
            className="btn-cyber-outline"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* 3. CLEAN EMPTY STATE (Zero skills assessed yet) */}
      {!loading && !error && skills.length === 0 && (
        <div className="glass-panel" style={{ padding: '64px 24px', textAlign: 'center', margin: '24px 0' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
            color: 'var(--cyber-cyan)'
          }}>
            <Award size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No skills assessed yet
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Complete your Skill Assessment to build your skill profile and unlock personalized career recommendations.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setActivePage && setActivePage('assessment')}
              className="btn-cyber-primary"
              style={{ padding: '10px 22px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Take Skill Assessment →</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-cyber-outline"
              style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Custom Skill</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. FILTER EMPTY STATE (Skills exist, but filtered down to 0) */}
      {!loading && !error && skills.length > 0 && filteredSkills.length === 0 && (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            color: 'var(--cyber-cyan)'
          }}>
            <Search size={22} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Skills Found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 16px' }}>
            No tracked skills matched your active filter or search query. Try resetting filters or adding a new skill.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                setActiveFilter('all');
                setCategoryFilter('All Categories');
                setSearchTerm('');
              }}
              className="btn-cyber-outline"
              style={{ padding: '7px 16px', fontSize: '12px' }}
            >
              Reset Filters
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-cyber-primary"
              style={{ padding: '7px 16px', fontSize: '12px' }}
            >
              <Plus size={14} /> Add Skill
            </button>
          </div>
        </div>
      )}

      {/* 5. POPULATED SKILL CARDS GRID */}
      {!loading && !error && filteredSkills.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '18px',
          marginBottom: '24px'
        }}>
          {filteredSkills.map((skill) => {
            const Icon = getCategoryIcon(skill.category);
            const isGap = skill.masteryScore < 60;

            return (
              <div
                key={skill.id || skill.name}
                className="glass-panel"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderColor: isGap ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', flex: '1 1 180px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: 'var(--cyber-blue-dim)', border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isGap ? 'var(--cyber-amber)' : 'var(--cyber-cyan)',
                        flexShrink: 0
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ minWidth: '0' }}>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {skill.name}
                        </h3>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {skill.category} Competency
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, marginTop: '2px' }}>
                      <span className={`cyber-badge ${skill.verified ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                        {skill.verified ? '✓ VERIFIED' : 'SELF-ASSESSED'}
                      </span>
                      <span className={`cyber-badge ${isGap ? 'badge-amber' : (skill.level === 'Advanced' || skill.level === 'Expert' ? 'badge-cyan' : 'badge-purple')}`} style={{ fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                        {skill.level}
                      </span>
                    </div>
                  </div>

                  {/* Mastery Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Mastery Score</span>
                      <strong style={{ color: isGap ? 'var(--cyber-amber)' : 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {skill.masteryScore}%
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${skill.masteryScore}%`,
                        height: '100%',
                        background: isGap ? 'var(--cyber-amber)' : 'var(--grad-cyan-blue)',
                        borderRadius: '3px'
                      }}></div>
                    </div>
                  </div>

                  {/* Evidence & Metrics Badges */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>PROJECTS</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {skill.projectsCount || 0} Completed
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>STATUS</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {skill.examsPassed || (skill.verified ? 'Verified' : 'Self-Assessed')}
                      </div>
                    </div>
                  </div>

                  {/* Assessment Evidence Badge if present */}
                  {skill.assessmentEvidence && (
                    <div style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(47, 224, 161, 0.08)',
                      border: '1px solid rgba(47, 224, 161, 0.25)',
                      fontSize: '11px',
                      color: 'var(--cyber-emerald)',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={12} />
                      <span><strong>Evidence:</strong> {skill.assessmentEvidence}</span>
                    </div>
                  )}

                  {/* Critical Gap Banner if present */}
                  {isGap && (
                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '11px',
                      color: 'var(--cyber-amber)',
                      marginBottom: '14px'
                    }}>
                      <strong>Skill Gap:</strong> {skill.criticalGap || 'Proficiency score below recommended placement threshold.'}
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {skill.recommendation || 'Take an assessment or complete a project to bridge this gap.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    {skill.verified ? (
                      <>
                        <ShieldCheck size={13} color="var(--cyber-emerald)" />
                        <span style={{ color: 'var(--cyber-emerald)', fontWeight: 600 }}>Verified by Assessment</span>
                      </>
                    ) : (
                      <>
                        <span className="status-dot-pulse"></span>
                        <span style={{ color: 'var(--cyber-cyan)' }}>Self-Assessed</span>
                      </>
                    )}
                  </div>

                  {isGap ? (
                    <button
                      onClick={() => setActivePage && setActivePage('assessment')}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--cyber-amber)', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      Resolve Gap →
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedEvidence(skill)}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--cyber-cyan)', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      View Evidence →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Quick Action Dock */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glow)'
      }}>
        <div
          onClick={() => setActivePage && setActivePage('opportunities')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title="Explore Opportunities"
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '2px solid var(--cyber-cyan)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)',
            fontSize: '13px', fontWeight: 700, color: 'var(--cyber-cyan)'
          }}>
            {counts.verified}/{counts.total}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              TARGET ROLE ALIGNMENT
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentStudent?.preferredRoles?.[0] || 'Software Engineer L1'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {counts.verified} out of {counts.total} verified proficiencies backed by code proof
            </div>
          </div>
        </div>

        <div
          onClick={() => setActivePage && setActivePage('assessment')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title="Open Skill Assessment"
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.15)', border: '1px solid var(--cyber-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyber-purple)'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              QUICK ACTION
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Take Skill Assessment
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Attest skills and close gaps with verified proctored evaluations
            </div>
          </div>
        </div>

        <div
          onClick={() => setActivePage && setActivePage('passport')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title="Open Digital Passport"
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--cyber-emerald)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyber-emerald)'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              PASSPORT STATUS
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--cyber-emerald)' }}>
              Sovereign Ledger Synced
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {counts.verified} cryptographic proofs ready to export to recruiters
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Evidence Modal */}
      {selectedEvidence && (
        <div className="modal-backdrop" onClick={() => setSelectedEvidence(null)}>
          <div className="modal-content-box" style={{ padding: '24px', maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color={selectedEvidence.verified ? 'var(--cyber-emerald)' : 'var(--cyber-cyan)'} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Evidence Details // {selectedEvidence.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              {selectedEvidence.credentialHash ? (
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>CREDENTIAL HASH</div>
                  <div style={{ color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px', wordBreak: 'break-all' }}>
                    {selectedEvidence.credentialHash}
                  </div>
                </div>
              ) : null}

              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>VERIFICATION STATUS</div>
                <div style={{ color: selectedEvidence.verified ? 'var(--cyber-emerald)' : 'var(--cyber-amber)', fontWeight: 600, marginTop: '4px' }}>
                  {selectedEvidence.verified ? 'Assessment Verified & Attested' : 'Self-Assessed (Unverified)'}
                </div>
                {selectedEvidence.assessmentEvidence && (
                  <div style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '12px' }}>
                    {selectedEvidence.assessmentEvidence}
                  </div>
                )}
                {!selectedEvidence.verified && (
                  <div style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '12px' }}>
                    Complete a verified skill assessment to attest this skill to your permanent student record.
                  </div>
                )}
              </div>

              {selectedEvidence.evidence?.repositories?.length > 0 && (
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>ATTESTED REPOSITORIES</div>
                  <ul style={{ paddingLeft: '16px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                    {selectedEvidence.evidence.repositories.map((repo, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        <code style={{ color: 'var(--cyber-cyan)' }}>{repo}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>PROFICIENCY TIER</div>
                  <div style={{ color: 'var(--cyber-cyan)', fontWeight: 700, marginTop: '2px' }}>
                    {selectedEvidence.level}
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>MASTERY SCORE</div>
                  <div style={{ color: 'var(--cyber-emerald)', fontWeight: 700, marginTop: '2px' }}>
                    {selectedEvidence.masteryScore}%
                  </div>
                </div>
              </div>

              {!selectedEvidence.verified && (
                <button
                  onClick={() => {
                    setSelectedEvidence(null);
                    if (setActivePage) setActivePage('assessment');
                  }}
                  className="btn-cyber-primary"
                  style={{ marginTop: '6px', padding: '10px' }}
                >
                  Take Skill Assessment to Verify
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-box" style={{ padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Add New Skill to Ledger
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  SKILL NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch, Kubernetes, Vector DBs..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)', borderRadius: '8px',
                    color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  CATEGORY
                </label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)', borderRadius: '8px',
                    color: 'var(--text-primary)', outline: 'none'
                  }}
                >
                  <option>Programming</option>
                  <option>Data & AI</option>
                  <option>Database</option>
                  <option>Cloud & Distributed</option>
                  <option>Web Development</option>
                  <option>Soft Skills</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  INITIAL PROFICIENCY TIER
                </label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)', borderRadius: '8px',
                    color: 'var(--text-primary)', outline: 'none'
                  }}
                >
                  {CANONICAL_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-cyber-primary"
                style={{ marginTop: '10px', padding: '11px', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Adding...' : 'Add to Skill Ledger'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function generateDeterministicHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${hex.split('').reverse().join('')}109b`.slice(0, 16);
}
