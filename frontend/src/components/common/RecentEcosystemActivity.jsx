import React, { useState, useEffect } from 'react';
import { Activity, Briefcase, BookOpen, Award, Star, Clock, RefreshCw } from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeAgo';

export default function RecentEcosystemActivity({ compact = false }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '') + '/api';
      const res = await fetch(`${apiBase}/nexus/ecosystem-activity`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setActivities(data.data);
      }
    } catch (e) {
      console.debug('[RecentEcosystemActivity] fetch note:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'industry':
        return { label: 'INDUSTRY', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', icon: Briefcase };
      case 'institution':
        return { label: 'INSTITUTION', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', icon: BookOpen };
      case 'academician':
        return { label: 'FACULTY', bg: '#FAF5FF', border: '#E9D5FF', text: '#7E22CE', icon: Award };
      case 'student':
        return { label: 'STUDENT', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', icon: Star };
      default:
        return { label: 'NETWORK', bg: '#F1F3F5', border: '#E2E5E9', text: '#5F6B76', icon: Activity };
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E5E9',
      borderRadius: '8px',
      padding: compact ? '16px' : '20px',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={15} color="#315CFF" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#17202A' }}>
              Live Connected Ecosystem Activity
            </h4>
            <span style={{ fontSize: '12px', color: '#5F6B76' }}>
              Real cross-role database events in PostgreSQL
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          title="Refresh live activity"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E5E9',
            borderRadius: '6px',
            padding: '5px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#5F6B76',
            fontSize: '12px',
            fontWeight: 500
          }}
        >
          <RefreshCw size={12} className={refreshing ? 'spin-anim' : ''} />
          <span>Sync</span>
        </button>
      </div>

      {/* Activity List */}
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#5F6B76', fontSize: '13px' }}>
          <Activity size={18} className="spin-anim" style={{ margin: '0 auto 8px', color: '#315CFF' }} />
          Streaming connected events from Supabase...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#8A949E', fontSize: '13px' }}>
          No recent ecosystem events recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activities.slice(0, compact ? 4 : 6).map((act) => {
            const badge = getRoleBadge(act.role);
            const Icon = badge.icon;
            const timeAgoStr = formatTimeAgo(act.timestamp);

            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#F7F8FA',
                  border: '1px solid #E2E5E9',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '4px',
                    background: badge.bg, border: `1px solid ${badge.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={13} color={badge.text} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#17202A', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: badge.text, fontWeight: 600 }}>{act.actor}</span>
                      {' '}<span style={{ color: '#5F6B76' }}>{act.action}</span>{' '}
                      <span style={{ color: '#17202A', fontWeight: 600 }}>"{act.target}"</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#8A949E',
                  fontSize: '11.5px',
                  flexShrink: 0
                }}>
                  <Clock size={12} />
                  <span>{timeAgoStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
