import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  X,
  Code
} from 'lucide-react';
import {
  submitProjectForValidation,
  getAllProjects,
  getStudentProjects
} from '../services/nexusDataStore';

export default function MyProjects({ onShowToast }) {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('GENERATIVE AI & LLMOPS');
  const [newTech, setNewTech] = useState('Python, FastAPI, ChromaDB');

  const [projects, setProjects] = useState([
    {
      id: "prj_01",
      title: "AI Chatbot using LLM + RAG",
      category: "GENERATIVE AI & LLMOPS",
      progress: 60,
      status: "In Progress",
      statusClass: "badge-cyan",
      note: "Peer Review Pending (1 of 2 Reviews Done)",
      linkedTo: "Linked to Generative AI Fundamentals (Module 6)",
      techStack: ["Python", "FastAPI", "ChromaDB", "LangChain", "Llama 3"],
      repoUrl: "https://github.com/arunkumar/llm-rag-enterprise-assistant",
      sandboxText: "Launch Sandbox"
    },
    {
      id: "prj_02",
      title: "Data Analytics & Predictive Retention Dashboard",
      category: "DATA SCIENCE & BI",
      progress: 100,
      benchmarkMatch: "94% Benchmark Match",
      status: "Validated & Minted",
      statusClass: "badge-emerald",
      note: "Cryptographically Verified • Ledger Block #NX-89214",
      linkedTo: "Linked to Digital Talent Passport for Corporate Screening",
      techStack: ["Python", "Pandas", "Streamlit", "PostgreSQL", "Scikit-Learn"],
      repoUrl: "https://github.com/arunkumar/customer-churn-retention-bi",
      demoUrl: "https://retention-dashboard-demo.nexus.app",
      proofAvailable: true
    },
    {
      id: "prj_03",
      title: "Modern Developer Portfolio & Interactive Tech Sandbox",
      category: "FRONTEND & FULL STACK",
      progress: 100,
      benchmarkMatch: "100% Complete",
      status: "Completed",
      statusClass: "badge-cyan",
      note: "98 Lighthouse Score • Production CI/CD Deployed",
      linkedTo: "Public URL & Code Repos Indexed",
      techStack: ["React", "Tailwind CSS", "TypeScript", "Vite"],
      repoUrl: "https://github.com/arunkumar/dev-portfolio-sandbox",
      demoUrl: "https://arunkumar.nexusdev.app"
    },
    {
      id: "prj_04",
      title: "Multi-Agent Algorithmic Market Scanner",
      category: "AGENTIC AI & QUANT",
      progress: 25,
      status: "In Progress (Sandbox Active)",
      statusClass: "badge-purple",
      note: "Worker: sandbox-running: agent-worker-01.nexus",
      linkedTo: "Connected to Emerging Tech Radar #03",
      techStack: ["AutoGen", "Python", "Docker", "Redis"],
      repoUrl: "https://github.com/arunkumar/agentic-quant-scanner",
      sandboxText: "Resume Session"
    }
  ]);

  // Reactive listener for faculty verification updates
  useEffect(() => {
    const handleProjectUpdate = () => {
      const allPrjs = getAllProjects();
      setProjects(prev => prev.map(p => {
        const found = allPrjs.find(ap => ap.title.toLowerCase() === p.title.toLowerCase() || ap.projectId === p.id);
        if (found) {
          return {
            ...p,
            status: found.status === 'Verified' ? 'Validated & Minted' : found.status === 'Submitted' ? 'Submitted for Faculty Validation' : p.status,
            statusClass: found.status === 'Verified' ? 'badge-emerald' : found.status === 'Submitted' ? 'badge-amber' : p.statusClass,
            note: found.status === 'Verified' 
              ? `Cryptographically Verified • Ledger Block ${found.validation?.blockNumber || '#NX-89412'}` 
              : found.status === 'Submitted' 
                ? 'Submitted to Faculty Queue • Sandbox Automated Testing Active'
                : p.note
          };
        }
        return p;
      }));
    };

    window.addEventListener('nexus_project_verified', handleProjectUpdate);
    window.addEventListener('nexus_project_submitted', handleProjectUpdate);
    window.addEventListener('nexus_data_updated', handleProjectUpdate);
    return () => {
      window.removeEventListener('nexus_project_verified', handleProjectUpdate);
      window.removeEventListener('nexus_project_submitted', handleProjectUpdate);
      window.removeEventListener('nexus_data_updated', handleProjectUpdate);
    };
  }, []);

  const handleSubmitForValidation = (prj) => {
    let auth = {};
    try { auth = JSON.parse(localStorage.getItem('nexus_auth_user')) || {}; } catch {}

    const submitted = submitProjectForValidation({
      studentId: auth.studentId || auth.id || 'STU-TN010-001',
      studentName: auth.name || 'Arun Kumar',
      department: auth.department || 'CSE',
      institutionId: auth.collegeId || 'TN010',
      title: prj.title,
      category: prj.category,
      technologies: prj.techStack,
      repositoryUrl: prj.repoUrl
    });

    setProjects(prev => prev.map(p => (p.id === prj.id || p.title === prj.title) ? {
      ...p,
      status: 'Submitted for Faculty Validation',
      statusClass: 'badge-amber',
      note: 'Submitted to Faculty Queue • Sandbox Automated Testing Active'
    } : p));

    if (onShowToast) {
      onShowToast({
        title: 'Submitted for Faculty Review',
        message: `"${prj.title}" dispatched to ${auth.college || 'Institution'} faculty ledger verification queue.`,
        type: 'success'
      });
    }
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let auth = {};
    try { auth = JSON.parse(localStorage.getItem('nexus_auth_user')) || {}; } catch {}

    const newPrj = {
      id: "prj_" + Date.now(),
      title: newTitle,
      category: newCategory,
      progress: 10,
      status: "In Progress (Active Sandbox)",
      statusClass: "badge-cyan",
      note: "Initial commits indexed & verified via Git",
      linkedTo: "Linked to Active Development Ledger",
      techStack: newTech.split(',').map(s => s.trim()),
      repoUrl: "https://github.com/arunkumar/" + newTitle.toLowerCase().replace(/\s+/g, '-'),
      sandboxText: "Launch Sandbox"
    };

    setProjects([newPrj, ...projects]);
    setShowNewModal(false);
    setNewTitle('');

    // Register project into central nexusDataStore
    submitProjectForValidation({
      studentId: auth.studentId || auth.id || 'STU-TN010-001',
      studentName: auth.name || 'Arun Kumar',
      department: auth.department || 'CSE',
      institutionId: auth.collegeId || 'TN010',
      title: newPrj.title,
      category: newPrj.category,
      technologies: newPrj.techStack,
      repositoryUrl: newPrj.repoUrl
    });

    if (onShowToast) {
      onShowToast({
        title: 'Project Initialized & Dispatched',
        message: `${newTitle} registered with VCS tracking & submitted for verification.`,
        type: 'success'
      });
    }
  };

  return (
    <div>
      {/* Header Telemetry */}
      <div className="page-top-telemetry">
        <div className="page-title-group">
          <div className="telemetry-node-tag">
            <span>PROJECT EVIDENCE MATRIX</span>
            <span>//</span>
            <span>BUILD & VALIDATE</span>
            <span>•</span>
            <span>4 Live Node</span>
          </div>
          <h1>My Projects</h1>
          <p>Don't just learn. Prove it. Turn classroom theory into production-grade verified project proof authenticated directly against corporate engineering baselines.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
            fontSize: '11.5px', fontFamily: 'var(--font-mono)'
          }}>
            <GitBranch size={14} color="var(--cyber-emerald)" />
            <span>VCS Connection: <strong style={{ color: 'var(--cyber-emerald)' }}>GitHub Active</strong></span>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="btn-cyber-primary"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Row matching Page 9 */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-stat-card accent-cyan">
          <div className="metric-stat-header">
            <span>TOTAL PROJECTS</span>
            <FolderGit2 size={13} color="var(--cyber-cyan)" />
          </div>
          <div className="metric-stat-value">{projects.length}</div>
          <div className="metric-stat-sub">2 Active • 2 Verified</div>
        </div>

        <div className="metric-stat-card accent-emerald">
          <div className="metric-stat-header">
            <span>VERIFIED COMMITS</span>
            <GitBranch size={13} color="var(--cyber-emerald)" />
          </div>
          <div className="metric-stat-value">142</div>
          <div className="metric-stat-sub">Synced via Git</div>
        </div>

        <div className="metric-stat-card accent-purple">
          <div className="metric-stat-header">
            <span>RECRUITER PROOF RATE</span>
            <ShieldCheck size={13} color="var(--cyber-purple)" />
          </div>
          <div className="metric-stat-value">88%</div>
          <div className="metric-stat-sub">Tier-1 Ready</div>
        </div>

        <div className="metric-stat-card accent-amber">
          <div className="metric-stat-header">
            <span>CLOUD SANDBOXES</span>
            <Terminal size={13} color="var(--cyber-amber)" />
          </div>
          <div className="metric-stat-value">2</div>
          <div className="metric-stat-sub">Running Online</div>
        </div>
      </div>

      {/* Filter Tabs Row matching Page 9 */}
      <div className="filter-tabs-row">
        <div className="filter-pills-group">
          {['All Projects (4)', 'In Progress (2)', 'Completed (1)', 'Validated (2)', 'Recommended (3)'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`filter-pill ${activeFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          SORT BY: <strong style={{ color: 'var(--text-primary)' }}>Recent Activity</strong>
        </div>
      </div>

      {/* Main Grid: 4 Project Cards on Left + Right Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Left: Project Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {projects.map((prj) => (
            <div key={prj.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`cyber-badge ${prj.statusClass}`} style={{ fontSize: '9.5px' }}>
                      {prj.status}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {prj.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {prj.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--cyber-cyan)', marginTop: '2px' }}>
                    {prj.linkedTo}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {prj.progress}%
                  </span>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {prj.benchmarkMatch || 'M1/20 Tasks Cleared'}
                  </div>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {prj.techStack.map((tech, idx) => (
                  <span key={idx} style={{
                    padding: '3px 8px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                    fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>

              {/* Status Note Banner */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--bg-input)',
                borderRadius: '8px', border: '1px solid var(--border-subtle)',
                marginBottom: '16px', fontSize: '11.5px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span className="status-dot-pulse"></span>
                  <span>{prj.note}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                {prj.status !== 'Validated & Minted' && prj.status !== 'Verified' && !prj.status.includes('Submitted') && (
                  <button
                    onClick={() => handleSubmitForValidation(prj)}
                    className="btn-cyber-outline"
                    style={{ fontSize: '12px', padding: '7px 14px', borderColor: 'rgba(16,185,129,0.5)', color: 'var(--cyber-emerald)' }}
                  >
                    <ShieldCheck size={13} />
                    <span>Submit for Validation</span>
                  </button>
                )}

                <a
                  href={prj.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cyber-outline"
                  style={{ textDecoration: 'none', fontSize: '12px', padding: '7px 14px' }}
                >
                  <ExternalLink size={13} />
                  <span>View Repository</span>
                </a>

                {prj.sandboxText && (
                  <button
                    onClick={() => {
                      if (onShowToast) {
                        onShowToast({
                          title: 'Sandbox Initializing',
                          message: `Cloud worker provisioned for ${prj.title}. Port 8080 open.`,
                          type: 'info'
                        });
                      }
                    }}
                    className="btn-cyber-primary"
                    style={{ fontSize: '12px', padding: '7px 14px' }}
                  >
                    <Terminal size={13} fill="#060B14" />
                    <span>{prj.sandboxText}</span>
                  </button>
                )}

                {prj.demoUrl && (
                  <a
                    href={prj.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber-primary"
                    style={{ textDecoration: 'none', fontSize: '12px', padding: '7px 14px' }}
                  >
                    <ExternalLink size={13} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Rail: Nexus AI Evaluation & Recommended Capstones matching Page 9 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nexus AI Evaluation */}
          <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyber-purple)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              <Sparkles size={14} />
              <span>NEXUS AI EVALUATION</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              "Your AI Chatbot project is 1 test suite away from proving Intermediate RAG engineering competency. Completing Milestone 3 will boost your TechCorp internship match from 92% to 96%."
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '12px', fontSize: '11.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>RAG Readiness Factor:</span>
              <strong style={{ color: 'var(--cyber-cyan)' }}>84% / 100%</strong>
            </div>

            <button
              onClick={() => {
                if (onShowToast) {
                  onShowToast({
                    title: 'Test Directives Loaded',
                    message: 'Milestone 3 RAG integration tests added to active workspace.',
                    type: 'info'
                  });
                }
              }}
              className="btn-cyber-outline"
              style={{ width: '100%', padding: '8px', fontSize: '12px' }}
            >
              Review Test Suite Directives
            </button>
          </div>

          {/* Recommended Capstones */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              RECOMMENDED CAPSTONES
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Production blueprints calibrated for Arun's profile to maximize recruiter visibility.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span className="cyber-badge badge-cyan" style={{ fontSize: '8.5px', marginBottom: '4px' }}>HIGH YIELD</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Distributed Vector Similarity Engine
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Build a concurrent vector similarity indexer with HNSW graph indexing in C++/Rust.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: 'var(--cyber-emerald)' }}>+18% Recruiter Inbound</span>
                  <button 
                    onClick={() => {
                      setNewTitle('Distributed Vector Similarity Engine');
                      setNewCategory('CLOUD & DISTRIBUTED');
                      setNewTech('C++, Rust, HNSW, Python, Docker');
                      setShowNewModal(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--cyber-cyan)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Fork Blueprint →
                  </button>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span className="cyber-badge badge-emerald" style={{ fontSize: '8.5px', marginBottom: '4px' }}>FINTECH STANDARD</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Real-Time Financial Fraud Stream
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Kafka streaming consumer paired with an isolation forest model detecting anomalies.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: 'var(--cyber-emerald)' }}>+15% Recruiter Inbound</span>
                  <button 
                    onClick={() => {
                      setNewTitle('Real-Time Financial Fraud Stream');
                      setNewCategory('DATA SCIENCE & BI');
                      setNewTech('Kafka, Python, Isolation Forest, Redis, Docker');
                      setShowNewModal(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--cyber-cyan)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Fork Blueprint →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Share Evidence Dossier Button */}
          <button
            onClick={() => {
              if (onShowToast) {
                onShowToast({
                  title: 'Evidence Dossier Exported',
                  message: 'Public authenticated dossier link copied to clipboard.',
                  type: 'success'
                });
              }
            }}
            className="btn-cyber-outline"
            style={{ width: '100%', padding: '10px', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Share2 size={14} color="var(--cyber-cyan)" />
            <span>Share Evidence Dossier</span>
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-content-box" style={{ padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Initialize New Project & Cloud Sandbox
              </h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  PROJECT TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Vector Similarity Engine"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  CATEGORY
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option>GENERATIVE AI & LLMOPS</option>
                  <option>DATA SCIENCE & BI</option>
                  <option>AGENTIC AI & QUANT</option>
                  <option>FRONTEND & FULL STACK</option>
                  <option>CLOUD & DISTRIBUTED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  TECH STACK (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, Docker, ChromaDB"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn-cyber-primary" style={{ marginTop: '8px', padding: '11px' }}>
                Create & Launch Cloud Sandbox
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
