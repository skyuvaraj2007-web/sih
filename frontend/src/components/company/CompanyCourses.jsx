import React, { useState, useMemo } from 'react';
import { BookOpen, Users, Clock, Award, CheckCircle2, ChevronRight, X, Sparkles, Code, Check, Eye } from 'lucide-react';
import { getAllCourses } from '../../services/nexusDataStore';
import '../common/CompactDataList.css';

export default function CompanyCourses({ onTabSelect }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically load courses from relational store
  const courses = useMemo(() => {
    const list = getAllCourses();
    return list && list.length > 0 ? list : [
      {
        courseId: 'CRS-01',
        courseName: 'Full Stack Web Architecture with React & Next.js',
        courseCode: 'CS-504-FSW',
        category: 'Software Engineering',
        duration: '8 Weeks',
        durationWeeks: 8,
        enrolledCount: 480,
        completionRate: '92%',
        skillsDeveloped: ['React', 'Next.js', 'PostgreSQL', 'Tailwind', 'REST APIs'],
        instructor: 'Dr. S. K. Narayanan (HOD CSE, VCET)',
        description: 'Comprehensive software engineering curriculum covering reactive frontend architecture, SSR optimization, database pooling, and API design.'
      },
      {
        courseId: 'CRS-02',
        courseName: 'Applied Deep Learning & NLP Transformers',
        courseCode: 'CS-702-DL',
        category: 'Artificial Intelligence',
        duration: '8 Weeks',
        durationWeeks: 8,
        enrolledCount: 340,
        completionRate: '88%',
        skillsDeveloped: ['Python', 'PyTorch', 'FastAPI', 'HuggingFace', 'LangChain'],
        instructor: 'Prof. R. Anitha (AI & Systems)',
        description: 'End-to-end neural network fine-tuning, transformer attention layers, and FastAPI vector endpoint deployment.'
      },
      {
        courseId: 'CRS-03',
        courseName: 'Cloud Native Microservices & Docker Orchestration',
        courseCode: 'IT-601-CLD',
        category: 'Cloud Infrastructure',
        duration: '6 Weeks',
        durationWeeks: 6,
        enrolledCount: 290,
        completionRate: '90%',
        skillsDeveloped: ['Docker', 'Linux', 'AWS', 'Kubernetes', 'CI/CD'],
        instructor: 'AWS Certified Faculty Fellow',
        description: 'Container lifecycle management, cloud-native resilience, horizontal autoscaling, and GitHub Actions CI/CD workflows.'
      },
      {
        courseId: 'CRS-04',
        courseName: 'High Performance Database Engineering & Indexing',
        courseCode: 'CS-403-DBE',
        category: 'Data Systems',
        duration: '6 Weeks',
        durationWeeks: 6,
        enrolledCount: 410,
        completionRate: '94%',
        skillsDeveloped: ['SQL', 'PostgreSQL', 'Redis', 'Database Tuning'],
        instructor: 'Enterprise Data Lab Proctor',
        description: 'Deep dive into B-Tree indexing, query execution planning, transactional concurrency, and caching architectures.'
      }
    ];
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(c =>
      (c.courseName || c.title || '').toLowerCase().includes(q) ||
      (c.courseCode || c.code || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Curriculum & Course Telemetry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Attested university curriculum and competency learning tracks evaluated by SKILLNEXUS AI.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search verified courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="company-input w-full text-xs"
          />
        </div>
      </div>

      {/* ── COMPACT COURSES TABLE ── */}
      <div className="compact-table-container" style={{ marginBottom: '28px' }}>
        <div className="compact-table-scroll">
          <table className="compact-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Course Curriculum</th>
                <th style={{ width: '13%' }}>Category</th>
                <th style={{ width: '10%' }}>Duration</th>
                <th style={{ width: '11%' }}>Enrolled</th>
                <th style={{ width: '11%' }}>Completion</th>
                <th style={{ width: '13%' }}>Skills Developed</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No courses matched your search filter.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const id = course.courseId || course.id;
                  const title = course.courseName || course.title;
                  const code = course.courseCode || course.code;
                  const duration = course.duration || `${course.durationWeeks || 6} Weeks`;
                  const enrolled = course.enrolledCount || course.enrolled || 300;
                  const completion = course.completionRate || '90%';
                  const skills = course.skillsDeveloped || course.skills || ['React', 'Python', 'SQL'];
                  const instructor = course.instructor || 'Campus Faculty CoE';

                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedCourse(course)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(168,85,247,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(168,85,247,0.25)',
                            color: 'var(--cyber-purple)',
                            flexShrink: 0
                          }}>
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="compact-cell-title">{title}</span>
                              <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 5px', fontFamily: 'monospace' }}>
                                {code}
                              </span>
                            </div>
                            <div className="compact-cell-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={11} color="var(--cyber-emerald)" />
                              <span>{instructor}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                          {course.category || 'General CS'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                          <Clock size={12} color="var(--text-muted)" /> {duration}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {enrolled.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>students</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyber-emerald)' }}>
                          {completion}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {skills.slice(0, 2).map((sk) => (
                            <span key={sk} className="badge badge-cyan" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                              {sk}
                            </span>
                          ))}
                          {skills.length > 2 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              +{skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourse(course);
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

      {/* DEDICATED COURSE DETAILS MODAL (Phase 15) */}
      {selectedCourse && (
        <div className="company-modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="company-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {selectedCourse.courseName || selectedCourse.title}
                  </h2>
                  <span className="text-xs text-cyan-300 font-mono">
                    {selectedCourse.courseCode || selectedCourse.code} • Sovereign Verified Course Track
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedCourse.description || 'Comprehensive curriculum providing practical technical skills and project-backed evidence.'}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Duration</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {selectedCourse.duration || `${selectedCourse.durationWeeks || 6} Weeks`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Enrolled Students</span>
                  <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">
                    {(selectedCourse.enrolledCount || selectedCourse.enrolled || 320).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Completion Rate</span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                    {selectedCourse.completionRate || '92%'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Attested Competencies & Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedCourse.skillsDeveloped || selectedCourse.skills || ['React', 'Python', 'SQL']).map(sk => (
                    <span key={sk} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-cyan-300 font-mono text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/[0.04] border border-purple-500/20">
                <span className="text-xs font-bold text-purple-300 block mb-1">Instructor / Evaluator</span>
                <p className="text-slate-300 text-[11px]">
                  {selectedCourse.instructor || 'Campus Faculty Lead'}
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  All module completions require proctored unit test submissions and verified code reviews.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-5">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="company-btn-secondary text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourse(null);
                  onTabSelect('students');
                }}
                className="company-btn-gradient text-xs"
              >
                <span>Find Completers in Talent Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
