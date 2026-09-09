import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  X,
  Building2,
  MapPin,
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  TN_COLLEGES,
  getDirectoryStats,
  getAllDistricts,
  getAllInstitutionTypes,
  filterDirectory
} from '../services/collegeDirectory';

/**
 * DirectoryInspectorModal
 * Internal / Admin / Evaluation Inspector for the Tamil Nadu Higher Education Master Directory.
 * Displays total institution counts, active/inactive metrics, tier distribution, and multi-filter registry exploration.
 */
export default function DirectoryInspectorModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [tier, setTier] = useState('ALL');
  const [ownership, setOwnership] = useState('ALL');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const stats = useMemo(() => getDirectoryStats(), []);
  const allDistricts = useMemo(() => getAllDistricts(), []);
  const allTypes = useMemo(() => getAllInstitutionTypes(), []);

  const filteredColleges = useMemo(() => {
    return filterDirectory({
      district,
      institutionType: type,
      tier,
      ownershipType: ownership,
      search
    });
  }, [district, type, tier, ownership, search]);

  const paginated = useMemo(() => {
    return filteredColleges.slice(0, page * PAGE_SIZE);
  }, [filteredColleges, page]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        height: '92vh',
        background: 'linear-gradient(180deg, #0B1120 0%, #060913 100%)',
        border: '1px solid rgba(0, 242, 254, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 242, 254, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="cyber-badge badge-cyan" style={{ fontSize: '10px' }}>
                <Database size={11} style={{ marginRight: '4px' }} />
                AUTHORITATIVE REGISTRY
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                DCE • UGC • AICTE • ANNA UNIVERSITY / TNEA
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tamil Nadu Higher Education Master Directory
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 6 Key Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px',
          padding: '16px 24px',
          background: 'rgba(10, 16, 30, 0.5)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TOTAL INSTITUTIONS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{stats.total}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--cyber-emerald)' }}>All 38 Districts</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>TIER 1 (EXCELLENCE)</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cyber-cyan)', marginTop: '2px' }}>{stats.tiers['SKILLNEXUS Tier 1']}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>NIRF / CFTI / NAAC A++</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div style={{ fontSize: '10px', color: 'var(--cyber-purple)', fontFamily: 'var(--font-mono)' }}>TIER 2 (ESTABLISHED)</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cyber-purple)', marginTop: '2px' }}>{stats.tiers['SKILLNEXUS Tier 2']}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>High Standing / Auto</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ fontSize: '10px', color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>TIER 3 (REGIONAL)</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#60A5FA', marginTop: '2px' }}>{stats.tiers['SKILLNEXUS Tier 3']}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Accredited Regional</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TIER 4 (DEVELOPING)</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '2px' }}>{stats.tiers['SKILLNEXUS Tier 4']}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Recognized footprint</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>UNCLASSIFIED</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '2px' }}>{stats.tiers['Unclassified']}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Missing reliable ranks</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{
          padding: '14px 24px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(10, 16, 30, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0 10px',
            gap: '8px'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by college name, code, or city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '8px 0',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
            />
          </div>

          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '8px 10px', color: 'var(--text-primary)', fontSize: '12px'
            }}
          >
            <option value="ALL">All 38 Districts</option>
            {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '8px 10px', color: 'var(--text-primary)', fontSize: '12px'
            }}
          >
            <option value="ALL">All Institution Types</option>
            {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={tier}
            onChange={(e) => { setTier(e.target.value); setPage(1); }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '8px 10px', color: 'var(--text-primary)', fontSize: '12px'
            }}
          >
            <option value="ALL">All Tiers</option>
            <option value="SKILLNEXUS Tier 1">SKILLNEXUS Tier 1</option>
            <option value="SKILLNEXUS Tier 2">SKILLNEXUS Tier 2</option>
            <option value="SKILLNEXUS Tier 3">SKILLNEXUS Tier 3</option>
            <option value="SKILLNEXUS Tier 4">SKILLNEXUS Tier 4</option>
            <option value="Unclassified">Unclassified</option>
          </select>

          <select
            value={ownership}
            onChange={(e) => { setOwnership(e.target.value); setPage(1); }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '8px 10px', color: 'var(--text-primary)', fontSize: '12px'
            }}
          >
            <option value="ALL">All Ownerships</option>
            <option value="Government">Government</option>
            <option value="Government-Aided">Government-Aided</option>
            <option value="Self-Financing">Self-Financing</option>
            <option value="Deemed University">Deemed University</option>
          </select>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                color: 'var(--text-muted)'
              }}>
                <th style={{ padding: '10px 12px' }}>COLLEGE CODE & NAME</th>
                <th style={{ padding: '10px 12px' }}>DISTRICT / CITY</th>
                <th style={{ padding: '10px 12px' }}>TYPE & OWNERSHIP</th>
                <th style={{ padding: '10px 12px' }}>UNIVERSITY</th>
                <th style={{ padding: '10px 12px' }}>SKILLNEXUS TIER</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((col) => (
                <tr
                  key={col.collegeId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 242, 254, 0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{col.collegeName}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {col.collegeId}
                    </div>
                  </td>

                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>{col.district}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{col.city}</div>
                  </td>

                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ color: 'var(--text-primary)' }}>{col.institutionType}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--cyber-purple)' }}>{col.ownershipType}</div>
                  </td>

                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                    {col.universityAffiliation}
                  </td>

                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      background: col.tier === 'SKILLNEXUS Tier 1' ? 'rgba(0, 242, 254, 0.15)'
                        : col.tier === 'SKILLNEXUS Tier 2' ? 'rgba(168, 85, 247, 0.15)'
                        : col.tier === 'SKILLNEXUS Tier 3' ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: col.tier === 'SKILLNEXUS Tier 1' ? 'var(--cyber-cyan)'
                        : col.tier === 'SKILLNEXUS Tier 2' ? 'var(--cyber-purple)'
                        : col.tier === 'SKILLNEXUS Tier 3' ? '#60A5FA'
                        : 'var(--text-muted)',
                      border: col.tier === 'SKILLNEXUS Tier 1' ? '1px solid rgba(0, 242, 254, 0.3)'
                        : '1px solid var(--border-subtle)'
                    }}>
                      {col.tier}
                    </span>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Score: {col.tierScore}/100
                    </div>
                  </td>

                  <td style={{ padding: '10px 12px' }}>
                    <span className="cyber-badge badge-emerald" style={{ fontSize: '9px' }}>
                      ● {col.activeStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          color: 'var(--text-muted)'
        }}>
          <div>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{paginated.length}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{filteredColleges.length}</strong> institutions matching filter criteria
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {paginated.length < filteredColleges.length && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="btn-cyber-outline"
                style={{ padding: '5px 12px', fontSize: '11px' }}
              >
                Load Next {PAGE_SIZE} Colleges
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-cyber-outline"
              style={{ padding: '5px 12px', fontSize: '11px' }}
            >
              Close Master Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
