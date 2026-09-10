import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Award,
  BookOpen,
  Cpu,
  FolderGit2,
  Briefcase,
  ShieldCheck,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogOut,
  Bot,
  ArrowRight,
  Building2,
  Building,
  Brain,
  BarChart2,
  GraduationCap,
  Users,
  Bell,
  Layers,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  FileText
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, user, onLogout, companyTab = 'dashboard' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentRole = (user?.role === 'industry' || user?.role === 'company')
    ? 'company'
    : (user?.role === 'institution' ? 'institution' : 'student');

  const isActive = (item) => {
    const id = typeof item === 'string' ? item : item?.id;
    const tab = typeof item === 'object' ? item?.tab : null;

    if (currentRole === 'company') {
      const activeCpmTab = companyTab || 'dashboard';
      if (id === 'industry-portal') {
        if (activePage !== 'industry-portal') return false;
        if (tab === 'dashboard') return activeCpmTab === 'dashboard' || activeCpmTab === 'overview';
        if (tab === 'students') return ['students', 'talent-search', 'student-profile', 'ai-matching', 'authorized-students', 'talent-pools'].includes(activeCpmTab);
        if (tab === 'colleges') return ['colleges', 'access-requests', 'requests'].includes(activeCpmTab);
        if (tab === 'opportunities') return ['opportunities', 'jobs', 'internships', 'apprenticeships', 'applications', 'shortlisted'].includes(activeCpmTab);
        if (tab === 'courses') return ['courses', 'certificates'].includes(activeCpmTab);
        if (tab === 'analytics') return activeCpmTab === 'analytics';
        if (tab === 'messages') return activeCpmTab === 'messages';
        if (tab === 'settings') return activeCpmTab === 'settings';
        return tab === activeCpmTab;
      }
    }

    if (id === 'home') return activePage === 'home';
    if (id === 'college') return activePage === 'college';
    if (id === 'skills') return activePage === 'skills';
    if (id === 'assessment') return activePage === 'assessment';
    if (id === 'learning') return activePage === 'learning' || activePage === 'learning-progress' || activePage === 'enroll';
    if (id === 'communication') return activePage === 'communication';
    if (id === 'advanced-tech') return activePage === 'advanced-tech' || activePage === 'advanced-tech-deepdive';
    if (id === 'projects') return activePage === 'projects';
    if (id === 'opportunities') return activePage === 'opportunities';
    if (id === 'passport') return activePage === 'passport';
    if (id === 'profile') return activePage === 'profile';
    if (id === 'settings') return activePage === 'settings';
    if (id === 'help') return activePage === 'help';
    if (id === 'notifications') return activePage === 'notifications';

    // Institution Top-Level Route Matching
    if (id === 'institution-console') return activePage === 'institution-console' || activePage === 'institution-academic-workspace';
    if (id === 'institution-students') return ['institution-readiness', 'institution-students', 'institution-assessments', 'institution-skill-analytics'].includes(activePage);
    if (id === 'institution-courses') return ['institution-courses', 'institution-skill-mapping'].includes(activePage);
    if (id === 'institution-certificates') return ['institution-certificates', 'institution-course-certificates', 'institution-proofs'].includes(activePage);
    if (id === 'institution-company-directory') return ['institution-company-directory', 'institution-companies', 'institution-company-intelligence', 'institution-company-opportunities', 'institution-industry-requests'].includes(activePage);
    if (id === 'institution-matching') return ['institution-matching', 'institution-skill-gap'].includes(activePage);
    if (id === 'institution-placement') return ['institution-placement', 'institution-recruitment-drives'].includes(activePage);
    if (id === 'institution-analytics') return ['institution-analytics', 'institution-industry-demand', 'institution-skill-trends'].includes(activePage);

    if (id === 'industry-portal') return activePage === 'industry-portal';
    return activePage === id;
  };

  const studentNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'college', label: 'My College', icon: GraduationCap },
    { id: 'skills', label: 'Skill Intelligence', icon: CheckSquare },
    { id: 'assessment', label: 'Skill Assessment', icon: Award },
    { id: 'learning', label: 'Learning Paths', icon: BookOpen },
    { id: 'communication', label: 'Communication', icon: MessageSquare, badge: 'Drills' },
    { id: 'advanced-tech', label: 'Emerging Tech', icon: Cpu, badge: 'AI 2.0' },
    { id: 'projects', label: 'Build Projects', icon: FolderGit2 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase, count: 12 },
    { id: 'passport', label: 'Digital Passport', icon: ShieldCheck }
  ];

  const institutionNavItems = [
    { id: 'institution-console', label: 'Cohort Telemetry', icon: Building2 },
    { id: 'institution-students', label: 'Students', icon: Users },
    { id: 'institution-courses', label: 'Learning', icon: BookOpen },
    { id: 'institution-projects', label: 'Project Verification', icon: FolderGit2 },
    { id: 'institution-certificates', label: 'Certificate Verification', icon: Award },
    { id: 'institution-company-directory', label: 'Companies', icon: Building },
    { id: 'institution-matching', label: 'Talent Matching', icon: Brain },
    { id: 'institution-placement', label: 'Placement Pipeline', icon: GraduationCap },
    { id: 'institution-analytics', label: 'Executive Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Console Settings', icon: Settings }
  ];

  const companyNavItems = [
    { id: 'industry-portal', tab: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'industry-portal', tab: 'students', label: 'Talent', icon: Users, count: 245 },
    { id: 'industry-portal', tab: 'colleges', label: 'Institutions', icon: Building },
    { id: 'industry-portal', tab: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'industry-portal', tab: 'courses', label: 'Learning', icon: BookOpen },
    { id: 'industry-portal', tab: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'industry-portal', tab: 'messages', label: 'Messages', icon: MessageSquare, count: 2 },
    { id: 'industry-portal', tab: 'settings', label: 'Settings', icon: Settings }
  ];

  const navItems = currentRole === 'institution'
    ? institutionNavItems
    : currentRole === 'company'
      ? companyNavItems
      : studentNavItems;

  const workspaceLabel = currentRole === 'institution'
    ? 'ACADEMIA COMMAND'
    : currentRole === 'company'
      ? 'TALENT INTELLIGENCE'
      : 'CAREER RAIL';

  const bottomLinks = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'logout', label: 'Sign Out', icon: LogOut, isLogout: true }
  ];

  const handleBottomClick = (link) => {
    if (link.isLogout) {
      if (onLogout) onLogout();
      else setActivePage('role-select');
    } else {
      setActivePage(link.id);
    }
  };

  const themeAccentColor = currentRole === 'institution'
    ? 'var(--cyber-purple)'
    : currentRole === 'company'
      ? 'var(--cyber-emerald)'
      : 'var(--brand-primary)';

  return (
    <aside
      className="sidebar"
      style={{
        width: isCollapsed ? '72px' : '260px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 40,
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: isCollapsed ? '16px 12px' : '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        height: '64px'
      }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'var(--grad-ai-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
            }}>
              <Sparkles size={16} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                SkillNexus <span style={{ color: themeAccentColor }}>2.0</span>
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                SPATIAL AI PLATFORM
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--grad-ai-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <Sparkles size={18} color="#FFFFFF" />
          </div>
        )}

        {/* Collapse Rail Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={isCollapsed ? "Expand Rail" : "Collapse Rail"}
        >
          {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* Workspace Role Badge */}
      {!isCollapsed && (
        <div style={{
          padding: '10px 18px 4px',
          fontSize: '9.5px',
          fontWeight: 800,
          color: themeAccentColor,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)'
        }}>
          {workspaceLabel}
        </div>
      )}

      {/* Main Navigation List */}
      <div className="sidebar-nav-container" style={{ padding: isCollapsed ? '10px 8px' : '10px 12px' }}>
        <ul className="nav-list" style={{ gap: '4px' }}>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <li key={`${item.id}-${item.tab || ''}-${idx}`}>
                <button
                  onClick={() => {
                    setActivePage(item.id, item.tab);
                  }}
                  className={`nav-link-item ${active ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    padding: isCollapsed ? '10px 0' : '9px 12px',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    borderRadius: '10px',
                    border: active ? '1px solid var(--border-active)' : '1px solid transparent',
                    background: active
                      ? 'var(--nav-active-bg)'
                      : 'transparent',
                    color: active
                      ? 'var(--nav-active-text)'
                      : 'var(--text-secondary)',
                    boxShadow: active ? 'var(--nav-active-glow)' : 'none',
                    fontWeight: active ? 700 : 500,
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                >
                  {/* Left Icon + Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon
                      size={18}
                      color={active ? 'var(--nav-active-text)' : 'var(--text-muted)'}
                    />
                    {!isCollapsed && (
                      <span style={{ fontSize: '13px', letterSpacing: '-0.01em' }}>{item.label}</span>
                    )}
                  </div>

                  {/* Right Badge / Count */}
                  {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.badge && (
                        <span className="cyber-badge badge-emerald" style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {item.badge}
                        </span>
                      )}
                      {item.count && (
                        <span className="cyber-badge badge-blue" style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* AI Assistant Quick Pill */}
      {!isCollapsed && (
        <div style={{ padding: '0 12px 10px', flexShrink: 0 }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--grad-hero-banner)',
            border: '1px solid var(--border-subtle)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: 'var(--grad-ai-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={13} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Nexus AI 2.0
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
              Spatial skill analytics & career matching engine active.
            </p>
            <button
              onClick={() => {
                if (currentRole === 'institution') setActivePage('institution-console');
                else if (currentRole === 'company') setActivePage('industry-portal', 'ai-matching');
                else setActivePage('home');
              }}
              className="btn-cyber-primary"
              style={{ width: '100%', padding: '6px', fontSize: '11.5px' }}
            >
              Launch AI Assistant <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Utility Navigation */}
      <div style={{ padding: '8px 12px 14px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {bottomLinks.map((link, idx) => {
          const Icon = link.icon;
          const active = !link.isLogout && isActive(link.id);
          return (
            <button
              key={`bottom-${idx}`}
              onClick={() => handleBottomClick(link)}
              title={isCollapsed ? link.label : undefined}
              style={{
                width: '100%',
                padding: isCollapsed ? '8px 0' : '7px 10px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                border: 'none',
                background: active ? 'var(--nav-active-bg)' : 'transparent',
                color: link.isLogout ? 'var(--cyber-rose)' : (active ? 'var(--cyber-blue)' : 'var(--text-muted)'),
                fontSize: '12.5px',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={link.isLogout ? 'var(--cyber-rose)' : (active ? 'var(--cyber-blue)' : 'var(--text-muted)')} />
              {!isCollapsed && <span>{link.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

