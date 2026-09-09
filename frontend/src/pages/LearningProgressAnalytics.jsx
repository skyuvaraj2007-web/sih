import React, { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  ChevronRight,
  Target,
  Zap,
  Activity
} from 'lucide-react';

export default function LearningProgressAnalytics({ setActivePage, onShowToast }) {
  const [activeSection, setActiveSection] = useState('all');

  /* ── Static data (mirrors MyLearning data) ── */
  const courses = [
    { id: 'crs_01', title: 'Python for Data Science', category: 'DATA & AI', progress: 75, completedModules: 18, totalModules: 24, hoursSpent: 22, color: '#28D7FF' },
    { id: 'crs_02', title: 'Generative AI Fundamentals', category: 'BY NEXUS AI', progress: 42, completedModules: 5, totalModules: 12, hoursSpent: 9, color: '#8B5CF6' },
    { id: 'crs_03', title: 'Advanced SQL for Data Engineering', category: 'DATABASE', progress: 61, completedModules: 8, totalModules: 13, hoursSpent: 12, color: '#2FE0A1' },
    { id: 'crs_04', title: 'Data Analytics Foundations', category: 'ANALYTICS', progress: 56, completedModules: 7, totalModules: 12, hoursSpent: 10, color: '#3478FF' }
  ];

  const weeklyDays = [
    { day: 'Mon', hours: 3.2, height: 64 },
    { day: 'Tue', hours: 4.1, height: 82 },
    { day: 'Wed', hours: 2.8, height: 56 },
    { day: 'Thu', hours: 3.5, height: 70 },
    { day: 'Fri', hours: 4.0, height: 80 },
    { day: 'Sat', hours: 1.9, height: 38, live: true },
    { day: 'Sun', hours: 1.0, height: 20 }
  ];

  const skillGrowth = [
    { skill: 'Logical Reasoning', before: 60, after: 72, color: '#28D7FF' },
    { skill: 'Aptitude', before: 52, after: 64, color: '#8B5CF6' },
    { skill: 'Programming', before: 78, after: 91, color: '#2FE0A1' },
    { skill: 'Python', before: 65, after: 82, color: '#28D7FF' },
    { skill: 'SQL', before: 48, after: 67, color: '#3478FF' },
    { skill: 'Data Analytics', before: 40, after: 56, color: '#EC4899' },
    { skill: 'Advanced Technologies', before: 20, after: 38, color: '#F59E0B' }
  ];

  const assessmentTrend = [
    { label: 'Logical Reasoning', score: 72, percentile: '88th', change: '+12%', color: '#28D7FF' },
    { label: 'Quantitative Aptitude', score: 64, percentile: '74th', change: '+8%', color: '#8B5CF6' },
    { label: 'Programming & Python', score: 84, percentile: '92nd', change: '+16%', color: '#2FE0A1' }
  ];

  const monthlyCompletion = [
    { month: 'Jun', pct: 22 },
    { month: 'Jul', pct: 38 },
    { month: 'Aug', pct: 56 },
    { month: 'Sep', pct: 68 }
  ];

  const overallProgress = Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length);
  const totalHours = courses.reduce((sum, c) => sum + c.hoursSpent, 0);
  const completedCourses = courses.filter(c => c.progress === 100).length;
  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
  const notStarted = courses.filter(c => c.progress === 0).length;

  const sections = [
    { id: 'all', label: 'All Analytics' },
    { id: 'progress', label: 'Progress' },
    { id: 'activity', label: 'Activity' },
    { id: 'skills', label: 'Skill Growth' },
    { id: 'assessments', label: 'Assessments' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '48px' }}>

      {/* ── Page Header ── */}
      <div className="page-top-telemetry">
        <div className="page-title-group">
          <div className="telemetry-node-tag">
            <span>TELEMETRY SYNCED</span>
            <span>//</span>
            <span>Session: Q2 Spring Cohort</span>
            <span>//</span>
            <span>VERIFIED LEDGER BLOCK #8941</span>
          </div>
          <h1>Learning Progress & Analytics</h1>
          <p>Deep-dive into your verified learning trajectory, skill growth, and performance benchmarks.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActivePage('learning')} className="btn-cyber-outline">
            <BookOpen size={14} />
            <span>My Courses</span>
          </button>
          <button onClick={() => setActivePage('enroll')} className="btn-cyber-primary">
            <Zap size={14} />
            <span>Enroll New Course</span>
          </button>
        </div>
      </div>

      {/* ── Section filter tabs ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              background: activeSection === s.id ? 'rgba(0,212,255,0.10)' : 'transparent',
              border: activeSection === s.id ? '1px solid rgba(0,212,255,0.35)' : '1px solid transparent',
              color: activeSection === s.id ? 'var(--cyber-cyan)' : 'var(--text-secondary)',
              padding: '6px 16px', borderRadius: '20px',
              fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 1: Overall Learning Progress
          ════════════════════════════════════════════════ */}
      {(activeSection === 'all' || activeSection === 'progress') && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={16} color="var(--cyber-cyan)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Overall Learning Progress</h2>
          </div>

          {/* Top stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {/* Overall ring */}
            <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{
                width: '86px', height: '86px', borderRadius: '50%',
                background: 'radial-gradient(circle, #0D162C 60%, rgba(0,212,255,0.2) 100%)',
                border: '3px solid var(--cyber-cyan)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--cyber-cyan-glow)'
              }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{overallProgress}%</span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MASTERY</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>OVERALL PROGRESS</div>
              </div>
            </div>

            {[
              { label: 'TOTAL COURSES', value: courses.length, sub: 'enrolled', color: 'var(--text-primary)' },
              { label: 'COMPLETED', value: completedCourses, sub: 'courses', color: 'var(--cyber-emerald)' },
              { label: 'IN PROGRESS', value: inProgress, sub: 'active', color: 'var(--cyber-cyan)' },
              { label: 'NOT STARTED', value: notStarted, sub: 'pending', color: 'var(--text-muted)' },
              { label: 'LEARNING STREAK', value: '12', sub: 'days active', color: 'var(--cyber-amber)' },
              { label: 'TOTAL HOURS', value: `${totalHours}h`, sub: 'verified', color: 'var(--cyber-purple)' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Course Progress bars */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={14} color="var(--cyber-cyan)" /> Course Progress
            </h3>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {courses.map(course => (
                <div key={course.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="cyber-badge" style={{ background: `${course.color}18`, color: course.color, border: `1px solid ${course.color}35`, fontSize: '9px', padding: '2px 7px' }}>
                        {course.category}
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{course.completedModules}/{course.totalModules} modules</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: course.color, fontFamily: 'var(--font-mono)', minWidth: '42px', textAlign: 'right' }}>{course.progress}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${course.progress}%`, height: '100%', borderRadius: '4px',
                      background: `linear-gradient(90deg, ${course.color}, ${course.color}99)`,
                      transition: 'width 0.5s ease', boxShadow: `0 0 8px ${course.color}50`
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    <span>{course.hoursSpent}h spent</span>
                    <span>{course.progress === 100 ? '✓ Complete' : course.progress > 0 ? 'In Progress' : 'Not Started'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          SECTION 2: Weekly Learning Activity
          ════════════════════════════════════════════════ */}
      {(activeSection === 'all' || activeSection === 'activity') && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={16} color="var(--cyber-cyan)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Learning Activity</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Weekly bar chart */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EFFORT INDEX</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Weekly Learning Activity</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>20.5h</div>
                  <div style={{ fontSize: '10px', color: 'var(--cyber-emerald)', fontWeight: 600 }}>▲ 102% Target Hit</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                {weeklyDays.map((d, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                    {d.live && (
                      <span style={{ fontSize: '8px', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>LIVE</span>
                    )}
                    <div
                      title={`${d.hours}h`}
                      style={{
                        width: '22px', height: `${d.height}%`,
                        background: d.live ? 'var(--cyber-cyan)' : 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: d.live ? 'var(--cyber-cyan-glow)' : 'none',
                        minHeight: '4px', transition: 'height 0.3s ease'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.day}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Weekly Target: <strong>20.0h</strong></span>
                <span>Daily Avg: <strong style={{ color: 'var(--cyber-cyan)' }}>2.9h</strong></span>
              </div>
            </div>

            {/* Monthly completion trend */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>COMPLETION TREND</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Progress Curve</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                {monthlyCompletion.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <span style={{ fontSize: '10px', color: 'var(--cyber-emerald)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.pct}%</span>
                    <div style={{
                      width: '28px', height: `${m.pct}%`,
                      background: i === monthlyCompletion.length - 1
                        ? 'linear-gradient(180deg, var(--cyber-cyan) 0%, #1D4ED8 100%)'
                        : 'linear-gradient(180deg, #2FE0A1 0%, #059669 100%)',
                      borderRadius: '4px 4px 0 0', minHeight: '4px',
                      boxShadow: i === monthlyCompletion.length - 1 ? 'var(--cyber-cyan-glow)' : 'none'
                    }} />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.month}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Start: <strong>22%</strong></span>
                <span>Growth: <strong style={{ color: 'var(--cyber-emerald)' }}>+46pp</strong></span>
                <span>Current: <strong style={{ color: 'var(--cyber-cyan)' }}>68%</strong></span>
              </div>
            </div>
          </div>

          {/* Learning streak & badges */}
          <div className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Flame size={22} color="var(--cyber-amber)" />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cyber-amber)', fontFamily: 'var(--font-mono)' }}>12 Days</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Streak</div>
                <div style={{ fontSize: '10px', color: 'var(--cyber-emerald)', marginTop: '2px' }}>Tier-1 Priority</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
                <Clock size={22} color="var(--cyber-cyan)" />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>48.5h</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Learning Hours</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Verified on Ledger</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(47,224,161,0.08)', border: '1px solid rgba(47,224,161,0.25)' }}>
                <CheckCircle2 size={22} color="var(--cyber-emerald)" />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cyber-emerald)', fontFamily: 'var(--font-mono)' }}>3</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Courses Completed</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>4 Badges Earned</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <Award size={22} color="var(--cyber-purple)" />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cyber-purple)', fontFamily: 'var(--font-mono)' }}>31</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Modules Completed</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Across 4 Courses</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          SECTION 3: Skill Growth
          ════════════════════════════════════════════════ */}
      {(activeSection === 'all' || activeSection === 'skills') && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={16} color="var(--cyber-cyan)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Skill Growth</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>— Before vs. After Learning</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {skillGrowth.map((skill, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '180px' }}>{skill.skill}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Before: {skill.before}%</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--cyber-emerald)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      +{skill.after - skill.before}pp
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: skill.color, fontFamily: 'var(--font-mono)', minWidth: '42px', textAlign: 'right' }}>
                      {skill.after}%
                    </span>
                  </div>
                </div>
                {/* Track: grey base, then before marker, then growth fill */}
                <div style={{ position: 'relative', width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  {/* Before level */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${skill.before}%`, background: 'rgba(255,255,255,0.12)', borderRadius: '4px'
                  }} />
                  {/* Growth fill */}
                  <div style={{
                    position: 'absolute', left: `${skill.before}%`, top: 0, height: '100%',
                    width: `${skill.after - skill.before}%`,
                    background: `linear-gradient(90deg, ${skill.color}99, ${skill.color})`,
                    boxShadow: `0 0 6px ${skill.color}60`
                  }} />
                </div>
              </div>
            ))}

            <div style={{
              marginTop: '8px', padding: '12px 16px', borderRadius: '8px',
              background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
              fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', gap: '20px', flexWrap: 'wrap'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '14px', height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px' }} />
                Baseline level before learning
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '14px', height: '6px', background: 'var(--cyber-cyan)', borderRadius: '2px' }} />
                Growth from completed courses
              </span>
            </div>
          </div>

          {/* Skill Growth CTA */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
            <button onClick={() => setActivePage('skills')} className="btn-cyber-outline" style={{ fontSize: '12px', padding: '9px 18px' }}>
              <ShieldCheck size={13} color="var(--cyber-cyan)" />
              <span>Inspect Full Skill Ledger</span>
            </button>
            <button onClick={() => setActivePage('learning')} className="btn-cyber-primary" style={{ fontSize: '12px', padding: '9px 18px' }}>
              <span>Continue Learning Sprint</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          SECTION 4: Assessment Improvement
          ════════════════════════════════════════════════ */}
      {(activeSection === 'all' || activeSection === 'assessments') && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={16} color="var(--cyber-cyan)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Assessment Improvement</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {assessmentTrend.map((a, i) => (
              <div key={i} className="glass-panel" style={{ padding: '22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, ${a.color}, transparent)`
                }} />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                  {a.label.toUpperCase()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: a.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {a.score}%
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="cyber-badge" style={{ background: 'rgba(47,224,161,0.12)', color: 'var(--cyber-emerald)', border: '1px solid rgba(47,224,161,0.3)', fontSize: '10px' }}>
                      {a.change} Improvement
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{a.percentile} Percentile</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${a.score}%`, height: '100%',
                    background: `linear-gradient(90deg, ${a.color}99, ${a.color})`,
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setActivePage('assessment')} className="btn-cyber-primary" style={{ fontSize: '12px', padding: '9px 18px' }}>
              <Award size={13} />
              <span>Take New Assessment</span>
            </button>
            <button onClick={() => setActivePage('skills')} className="btn-cyber-outline" style={{ fontSize: '12px', padding: '9px 18px' }}>
              <span>View Skill Ledger</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          SECTION 5: Learning Insights (Nexus AI)
          ════════════════════════════════════════════════ */}
      {(activeSection === 'all') && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={16} color="var(--cyber-purple)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Learning Insights</h2>
            <span className="cyber-badge badge-purple" style={{ fontSize: '9px' }}>Nexus AI</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(139,92,246,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyber-purple)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
                <Sparkles size={13} /> TACTICAL ACCELERATION
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                "Accelerating Generative AI module 6 will close the gap for 4 high-match internships at TechCorp. Projected career match lift: <strong style={{ color: 'var(--cyber-emerald)' }}>+18.4% readiness</strong>."
              </p>
              <button onClick={() => setActivePage('enroll')} className="btn-cyber-purple" style={{ width: '100%', padding: '8px', fontSize: '12px' }}>
                Fast-Track Module 6
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(0,212,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyber-cyan)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
                <ShieldCheck size={13} /> EVIDENCE SYNC LEDGER
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {[
                  { title: 'SQL CTE Master', sub: 'Unlocked 2 days ago • Level IV', color: 'var(--text-muted)' },
                  { title: 'Python ETL/EDA Lab', sub: '+3.5 hrs verified', color: 'var(--cyber-emerald)' },
                  { title: 'LLM Basics & Attention', sub: '+2.0 hrs verified', color: 'var(--cyber-emerald)' }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px' }}>{item.title}</div>
                    <div style={{ color: item.color, fontSize: '10px', marginTop: '2px' }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setActivePage('passport')} className="btn-cyber-outline" style={{ width: '100%', padding: '8px', fontSize: '12px' }}>
                View Full Passport Ledger →
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(47,224,161,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyber-emerald)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
                <BarChart3 size={13} /> LEARNING CONSISTENCY
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                12-day streak preserves Tier-1 candidate priority in recruiter discovery radar.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Best Day', value: 'Tuesday', sub: '4.1h average' },
                  { label: 'Weakest Day', value: 'Sunday', sub: '1.0h average' },
                  { label: 'Consistency', value: '87%', sub: 'weekly hit rate' },
                  { label: 'Next Milestone', value: '15 Days', sub: 'streak target' }
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stat.label.toUpperCase()}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12px', marginTop: '2px' }}>{stat.value}</div>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
