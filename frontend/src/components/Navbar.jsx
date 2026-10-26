import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Flame,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Bot
} from 'lucide-react';
import { getUnreadCount } from '../services/notificationStore';
import { getTheme, toggleTheme } from '../services/themeStore';

export default function Navbar({ onOpenAIModal, activePage, setActivePage, user, onLogout }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const currentRole = (user?.role === 'industry' || user?.role === 'company')
    ? 'company'
    : (user?.role === 'institution'
      ? 'institution'
      : (user?.role === 'faculty' || user?.role === 'academician' ? 'academician' : 'student'));

  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount(currentRole));
  const [currentTheme, setCurrentTheme] = useState(() => getTheme());
  const profileRef = useRef(null);

  useEffect(() => {
    const handleUpdate = () => {
      setUnreadCount(getUnreadCount(currentRole));
    };
    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail.theme);
    };
    window.addEventListener('nexus_notifications_updated', handleUpdate);
    window.addEventListener('nexus_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('nexus_notifications_updated', handleUpdate);
      window.removeEventListener('nexus_theme_changed', handleThemeChange);
    };
  }, [currentRole]);

  useEffect(() => {
    if (!showProfileDropdown) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const currentUser = user || {
    name: 'Authenticated User',
    headline: 'User',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  return (
    <header
      className="topbar"
      style={{
        height: '64px',
        padding: '0 28px',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      {/* Left: Global Search Bar */}
      <div className="topbar-left" style={{ flex: 1, maxWidth: '520px' }}>
        <div
          className="search-input-box"
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: searchFocused ? '1px solid var(--cyber-blue)' : '1px solid var(--border-subtle)',
            boxShadow: searchFocused ? '0 0 16px var(--cyber-blue-dim)' : 'none',
            borderRadius: '12px',
            padding: '7px 14px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={
              currentRole === 'academician'
                ? "Search students, courses, assessments, skill gaps, mentees..."
                : currentRole === 'company'
                ? "Search candidate pools, skills, colleges, opportunities..."
                : currentRole === 'institution'
                ? "Search student roster, courses, companies, skill telemetry..."
                : "Search skills, courses, opportunities, technologies..."
            }
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                const queryText = e.target.value.trim();
                window.__nexusSearchQuery = queryText;
                window.dispatchEvent(new CustomEvent('nexus_search_query', { detail: { query: queryText } }));
                setActivePage('search');
                e.target.blur();
              }
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            padding: '2px 7px', borderRadius: '6px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '10px', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0
          }}>
            âŒ˜K
          </div>
        </div>
      </div>

      {/* Right: AI Status + Streak/Telemetry + Notifications + Theme Toggle + User Avatar */}
      <div className="topbar-right" style={{ gap: '16px' }}>
        {/* AI Engine Status Badge */}
        <button
          className="topbar-ai-btn"
          onClick={onOpenAIModal}
          style={{
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s ease'
          }}
          title="Open Nexus AI Companion"
        >
          <Bot size={14} color="#315CFF" />
          <span>AI Assistant</span>
        </button>

        {/* Telemetry/Streak Pill */}
        {currentRole === 'company' ? (
          <div className="topbar-telemetry-pill" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '4px',
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            color: '#15803D', fontSize: '11px', fontWeight: 600
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#218739' }} />
            <span>AI MATCHING ACTIVE</span>
          </div>
        ) : currentRole === 'institution' ? (
          <div className="topbar-telemetry-pill" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '4px',
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            color: '#1D4ED8', fontSize: '11px', fontWeight: 600
          }}>
            <Zap size={12} color="#315CFF" />
            <span>COHORT TELEMETRY LIVE</span>
          </div>
        ) : (
          <div className="topbar-telemetry-pill" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '4px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#B45309'
          }}>
            <Flame size={14} color="#A66A00" />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>12</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#5F6B76' }}>Day Streak</span>
          </div>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => setActivePage('notifications')}
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '1px solid #E2E5E9',
            color: activePage === 'notifications' ? '#315CFF' : '#5F6B76',
            cursor: 'pointer',
            padding: '7px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute', top: '-3px', right: '-3px',
              minWidth: '16px', height: '16px', borderRadius: '8px',
              padding: '0 4px',
              background: '#C73737', border: '2px solid #FFFFFF',
              color: '#FFFFFF', fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* User Profile Badge & Dropdown */}
        <div
          ref={profileRef}
          className="user-profile-badge"
          style={{ cursor: 'pointer', position: 'relative', gap: '8px', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="avatar-img"
            style={{ width: '32px', height: '32px' }}
          />
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              {currentRole === 'academician'
                ? `Faculty â€¢ ${currentUser.department || 'Academician'}`
                : currentRole === 'company'
                ? `Recruiter â€¢ ${currentUser.companyName || currentUser.institutionName || 'Enterprise Partner'}`
                : currentRole === 'institution'
                ? (currentUser.headline || 'Institution Admin')
                : (currentUser.role === 'student' ? 'Student' : currentUser.headline || 'Student')}
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              width: '200px', background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)', borderRadius: '12px',
              boxShadow: 'var(--shadow-dropdown)', zIndex: 100,
              padding: '6px', animation: 'fadeIn 0.15s ease-out'
            }}>
              {(currentRole === 'academician' ? [
                { label: 'Faculty Dashboard', page: 'academician-dashboard' },
                { label: 'Student Directory', page: 'academician-students' },
                { label: 'My Courses', page: 'academician-courses' },
                { label: 'Skill Gap Radar', page: 'academician-skill-gaps' },
                { label: 'Mentorship Hub', page: 'academician-mentorship' },
                { label: 'Notifications', page: 'academician-notifications' },
                { label: 'Logout', page: 'logout', isLogout: true }
              ] : currentRole === 'student' ? [
                { label: 'My Profile', page: 'profile' },
                { label: 'Settings', page: 'settings' },
                { label: 'Notifications', page: 'notifications' },
                { label: 'Digital Passport', page: 'passport' },
                { label: 'Logout', page: 'logout', isLogout: true }
              ] : currentRole === 'institution' ? [
                { label: 'My Profile', page: 'profile' },
                { label: 'Institutional Settings', page: 'settings' },
                { label: 'Notifications', page: 'notifications' },
                { label: 'Cohort Telemetry', page: 'institution-console' },
                { label: 'Logout', page: 'logout', isLogout: true }
              ] : [
                { label: 'My Profile', page: 'profile' },
                { label: 'Company Settings', page: 'settings' },
                { label: 'Notifications', page: 'notifications' },
                { label: 'Company Workspace', page: 'industry-portal' },
                { label: 'Logout', page: 'logout', isLogout: true }
              ]).map((item, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(false);
                    if (item.isLogout) {
                      if (onLogout) onLogout();
                      else setActivePage('role-select');
                    } else {
                      setActivePage(item.page);
                    }
                  }}
                  style={{
                    width: '100%', padding: '9px 12px', background: 'none',
                    border: 'none', borderRadius: '8px', textAlign: 'left',
                    color: item.label === 'Logout' ? 'var(--cyber-rose)' : 'var(--text-primary)',
                    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
