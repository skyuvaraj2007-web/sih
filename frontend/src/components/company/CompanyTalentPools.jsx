import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Users,
  MessageSquare,
  Send,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  UserPlus,
  X
} from 'lucide-react';

export default function CompanyTalentPools({ onSelectPool, onTabSelect, onShowToast }) {
  const [pools, setPools] = useState([
    { id: 'tp-1', name: 'Frontend Developers', count: 142, tags: ['React', 'Next.js', 'TypeScript', 'UI/UX'], color: '#28D7FF' },
    { id: 'tp-2', name: 'Backend Developers', count: 98, tags: ['Python', 'Node.js', 'FastAPI', 'SQL'], color: '#3478FF' },
    { id: 'tp-3', name: 'AI/ML Candidates', count: 76, tags: ['PyTorch', 'LangChain', 'RAG', 'Vector DBs'], color: '#8B5CF6' },
    { id: 'tp-4', name: 'Cloud Candidates', count: 60, tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], color: '#2FE0A1' },
    { id: 'tp-5', name: 'Top CSE Students', count: 180, tags: ['CGPA > 8.5', 'Proctor Verified', 'Top 10%'], color: '#FF9D4D' },
    { id: 'tp-6', name: 'Internship Ready', count: 210, tags: ['3rd Year', 'Available Immediately', 'Assessed'], color: '#EC4899' }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolTags, setNewPoolTags] = useState('');

  const handleCreatePool = (e) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;

    const newP = {
      id: `tp-${Date.now()}`,
      name: newPoolName,
      count: 0,
      tags: newPoolTags.split(',').map(s => s.trim()).filter(Boolean),
      color: '#28D7FF'
    };

    setPools([...pools, newP]);
    setNewPoolName('');
    setNewPoolTags('');
    setIsCreateModalOpen(false);
    if (onShowToast) {
      onShowToast({
        title: 'Talent Pool Created',
        message: `Talent Pool "${newP.name}" is now ready for candidate segmentation.`,
        type: 'success'
      });
    }
  };

  const handleAction = (action, pool) => {
    if (action === 'Message') {
      onTabSelect('messages');
    } else if (action === 'Invite') {
      if (onShowToast) {
        onShowToast({
          title: 'Bulk Invites Dispatched',
          message: `Dispatched campaign invitations to ${pool.count} candidates in "${pool.name}".`,
          type: 'success'
        });
      }
    } else if (action === 'Export') {
      if (onShowToast) {
        onShowToast({
          title: 'Export Generated',
          message: `CSV candidate dataset for "${pool.name}" exported successfully.`,
          type: 'success'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 13. Screen 7 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Talent Pools</h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated high-potential candidate pipelines segmented by specialization and readiness.
          </p>
        </div>

        <button
          type="button"
          className="company-btn-gradient"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Create Talent Pool</span>
        </button>
      </div>

      {/* Grid of Pool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pools.map(pool => (
          <div key={pool.id} className="company-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pool.color}20`, color: pool.color }}>
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {pool.count} Students
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{pool.name}</h3>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {pool.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-1 text-xs">
              <button
                type="button"
                onClick={() => onTabSelect('students')}
                className="btn-cyber-outline"
                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Add Students to Pool"
              >
                <UserPlus size={12} />
                <span>Add</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('Message', pool)}
                className="btn-cyber-outline"
                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Broadcast Message to Pool"
              >
                <MessageSquare size={12} />
                <span>Message</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('Invite', pool)}
                className="btn-cyber-primary"
                style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Invite Candidates to Opportunity"
              >
                <Send size={12} />
                <span>Invite</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('Export', pool)}
                className="btn-cyber-outline"
                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Export CSV"
              >
                <Download size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TALENT POOL MODAL */}
      {isCreateModalOpen && (
        <div className="company-modal-overlay">
          <div className="company-modal-content max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Create New Talent Pool</h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pool Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cybersecurity Engineers"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="company-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Cryptography, PenTesting, Python, Linux"
                  value={newPoolTags}
                  onChange={(e) => setNewPoolTags(e.target.value)}
                  className="company-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="company-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="company-btn-gradient text-xs"
                >
                  Create Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
