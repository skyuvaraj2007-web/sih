import React from 'react';
import { School, UserCheck, GraduationCap, Building2, CheckCircle2, ChevronRight, ShieldCheck, Network } from 'lucide-react';

export default function ConnectedEcosystemCard({ activeRole = 'student', onSelectRole }) {
  const roles = [
    {
      id: 'institution',
      title: 'ABC Engineering College',
      subtitle: 'Autonomous Institution • NAAC A++',
      category: 'Institution',
      meta: '45 Students in CSE III-A • 1 Active Skill Program',
      icon: School,
      color: '#218739',
      active: activeRole === 'institution'
    },
    {
      id: 'academician',
      title: 'Dr. Ramesh Sundaram',
      subtitle: 'Professor & Head • Dept. of CSE',
      category: 'Academician',
      meta: 'Class Mentor • React.js Mini Project Assigned',
      icon: UserCheck,
      color: '#6366F1',
      active: activeRole === 'academician'
    },
    {
      id: 'student',
      title: 'Arun Kumar (23CSE042)',
      subtitle: 'III CSE A • CGPA: 8.85 • Full Stack AI',
      category: 'Primary Student',
      meta: '8 Verified Skills • Enrolled in React.js Program',
      icon: GraduationCap,
      color: '#315CFF',
      active: activeRole === 'student'
    },
    {
      id: 'industry',
      title: 'SBT TECH Innovations',
      subtitle: 'Enterprise AI & Cloud Systems Partner',
      category: 'Industry Partner',
      meta: 'Associate Full Stack AI Developer • Dynamic Matching',
      icon: Building2,
      color: '#A66A00',
      active: activeRole === 'industry' || activeRole === 'company'
    }
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E5E9',
      borderRadius: '8px',
      padding: '16px 20px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={16} color="#315CFF" />
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#17202A', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            Connected SIH Demo Ecosystem
          </h4>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
            fontWeight: 600
          }}>
            DATABASE LINKED
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#5F6B76' }}>
          4 Roles • PostgreSQL Single Source of Truth
        </div>
      </div>

      {/* Modern Connected Tree Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '12px',
        position: 'relative'
      }}>
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              onClick={() => onSelectRole && onSelectRole(r.id)}
              style={{
                background: r.active ? '#F8FAFC' : '#FFFFFF',
                border: r.active ? `2px solid ${r.color}` : '1px solid #E2E5E9',
                borderRadius: '6px',
                padding: '12px 14px',
                cursor: onSelectRole ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: r.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em'
                }}>
                  {r.category}
                </span>
                {r.active && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: r.color,
                    background: '#F1F3F5',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    <CheckCircle2 size={11} /> Active View
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '4px',
                  background: '#F1F3F5', border: '1px solid #E2E5E9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={14} color={r.color} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#17202A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.title}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#5F6B76', marginBottom: '8px', lineHeight: 1.4 }}>
                {r.subtitle}
              </div>

              <div style={{
                fontSize: '11.5px',
                color: '#5F6B76',
                background: '#F7F8FA',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #E2E5E9',
                lineHeight: 1.35
              }}>
                {r.meta}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
