import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  ShieldCheck,
  ArrowLeft,
  Eye,
  Clock,
  Sparkles
} from 'lucide-react';
import '../common/CompactDataList.css';

export default function CompanyMessages({ user, initialStudent = null, onShowToast }) {
  const [conversations, setConversations] = useState([
    {
      id: 'c-1',
      studentId: 'STU-VCET-001',
      name: 'Arun Kumar',
      college: 'VCET',
      department: 'CSE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      unread: false,
      lastMessage: 'Thank you. I would be interested in discussing the opportunity.',
      timestamp: '10:45 AM',
      messages: [
        {
          id: 'm-1',
          sender: 'recruiter',
          text: 'Hi Arun, your profile strongly matches our Frontend Developer Internship.',
          timestamp: '10:42 AM'
        },
        {
          id: 'm-2',
          sender: 'candidate',
          text: 'Thank you. I would be interested in discussing the opportunity.',
          timestamp: '10:45 AM'
        }
      ]
    },
    {
      id: 'c-2',
      studentId: 'STU-VCET-002',
      name: 'Priya Dhanushri',
      college: 'VCET',
      department: 'IT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      unread: true,
      lastMessage: 'I have attached my latest microservices project repository proof.',
      timestamp: 'Yesterday',
      messages: [
        {
          id: 'm-21',
          sender: 'recruiter',
          text: 'Hello Priya, your cloud architecture project proof was validated on the ledger.',
          timestamp: 'Yesterday 3:15 PM'
        },
        {
          id: 'm-22',
          sender: 'candidate',
          text: 'I have attached my latest microservices project repository proof.',
          timestamp: 'Yesterday 4:02 PM'
        }
      ]
    },
    {
      id: 'c-3',
      studentId: 'STU-VCET-003',
      name: 'Karthik Raja',
      college: 'VCET',
      department: 'AI & DS',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      unread: false,
      lastMessage: 'Looking forward to the technical assessment round.',
      timestamp: 'Sep 3',
      messages: [
        {
          id: 'm-31',
          sender: 'candidate',
          text: 'Looking forward to the technical assessment round.',
          timestamp: 'Sep 3'
        }
      ]
    },
    {
      id: 'c-4',
      studentId: 'STU-VCET-004',
      name: 'Deepika S',
      college: 'VCET',
      department: 'CSE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      unread: false,
      lastMessage: 'Thank you for the opportunity invite!',
      timestamp: 'Sep 2',
      messages: [
        {
          id: 'm-41',
          sender: 'candidate',
          text: 'Thank you for the opportunity invite!',
          timestamp: 'Sep 2'
        }
      ]
    }
  ]);

  const [activeConvId, setActiveConvId] = useState('c-1');
  const [viewMode, setViewMode] = useState(initialStudent ? 'chat' : 'list');
  const [inputText, setInputText] = useState('');
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const fileInputRef = React.useRef(null);

  const filteredConversations = conversations.filter(c => {
    if (!searchConvQuery.trim()) return true;
    const q = searchConvQuery.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.department || '').toLowerCase().includes(q) || (c.college || '').toLowerCase().includes(q);
  });

  const handleAttachment = (e) => {
    const file = e.target.files?.[0];
    if (file && onShowToast) {
      onShowToast({
        title: 'Proof Document Attached',
        message: `Attached "${file.name}" to candidate outreach channel.`,
        type: 'success'
      });
      const newMsg = {
        id: `m-${Date.now()}`,
        sender: 'recruiter',
        text: `📎 [Document Attached: ${file.name}]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            timestamp: newMsg.timestamp,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      }));
    }
  };

  // Handle initial candidate passed from profile
  React.useEffect(() => {
    if (initialStudent) {
      const existing = conversations.find(c => c.studentId === initialStudent.studentId || c.name === initialStudent.name);
      if (existing) {
        setActiveConvId(existing.id);
        setViewMode('chat');
      } else {
        const newConv = {
          id: `c-${Date.now()}`,
          studentId: initialStudent.studentId,
          name: initialStudent.name,
          college: initialStudent.collegeName?.includes('Velalar') ? 'VCET' : 'College',
          department: initialStudent.department || 'CSE',
          avatar: initialStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          unread: false,
          lastMessage: 'Conversation started',
          timestamp: 'Just now',
          messages: [
            {
              id: `m-${Date.now()}`,
              sender: 'recruiter',
              text: `Hello ${initialStudent.name}, we reviewed your sovereign skills profile and are interested in connecting!`,
              timestamp: 'Just now'
            }
          ]
        };
        setConversations([newConv, ...conversations]);
        setActiveConvId(newConv.id);
        setViewMode('chat');
      }
    }
  }, [initialStudent]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const openConversationDetail = (id) => {
    setActiveConvId(id);
    setViewMode('chat');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'recruiter',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          lastMessage: newMsg.text,
          timestamp: newMsg.timestamp,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setInputText('');

    if (onShowToast) {
      onShowToast({
        title: 'Message Dispatched',
        message: `Message transmitted securely to ${activeConv.name}.`,
        type: 'success'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--cyber-cyan)" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Direct Recruiter Messages</h1>
            <span className="cyber-badge badge-cyan" style={{ fontSize: '10px' }}>SECURE CHANNEL</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Verified candidate outreach, communication audit trail, and interview coordination across partner colleges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'chat' ? (
            <button
              onClick={() => setViewMode('list')}
              className="btn-cyber-outline"
              style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Conversations List</span>
            </button>
          ) : (
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchConvQuery}
                onChange={(e) => setSearchConvQuery(e.target.value)}
                className="company-input w-full text-xs"
                style={{ paddingLeft: '32px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW 1: COMPACT LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="compact-table-container" style={{ marginBottom: '28px' }}>
          <div className="compact-table-scroll">
            <table className="compact-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Candidate</th>
                  <th style={{ width: '18%' }}>Institution & Dept</th>
                  <th style={{ width: '30%' }}>Latest Message</th>
                  <th style={{ width: '12%' }}>Timestamp</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No messages found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredConversations.map((conv) => (
                    <tr
                      key={conv.id}
                      onClick={() => openConversationDetail(conv.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                            <img
                              src={conv.avatar}
                              alt={conv.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0, 212, 255, 0.3)' }}
                            />
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--cyber-emerald)', border: '2px solid #091122' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="compact-cell-title">{conv.name}</span>
                              <ShieldCheck size={13} color="var(--cyber-cyan)" />
                              {conv.unread && (
                                <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 5px' }}>NEW</span>
                              )}
                            </div>
                            <div className="compact-cell-sub">{conv.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{conv.college}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dept: {conv.department}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: conv.unread ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: conv.unread ? 600 : 400, maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.lastMessage}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          <Clock size={11} /> {conv.timestamp}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConversationDetail(conv.id);
                          }}
                          className="btn-compact-details"
                        >
                          <Eye size={12} />
                          <span>Open Chat →</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VIEW 2: DEDICATED DETAILED CHAT VIEW ── */}
      {viewMode === 'chat' && (
        <div className="company-card p-0 grid grid-cols-1 md:grid-cols-12 h-[620px] overflow-hidden">
          {/* Left: Quick Switch Conversation Column (4 cols) */}
          <div className="md:col-span-4 border-r border-white/5 flex flex-col h-full bg-[#091122]">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Conversations ({conversations.length})
              </span>
              <button
                onClick={() => setViewMode('list')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Compact List
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {conversations.map(conv => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-3 ${
                      isActive ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="relative" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0, 212, 255, 0.3)' }}
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#091122]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white text-xs truncate">{conv.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{conv.timestamp}</span>
                      </div>
                      <span className="text-[10px] text-cyan-300 block mb-0.5">{conv.department} • {conv.college}</span>
                      <p className="text-[11px] text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Chat Window (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-[#0D172B]">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#0A1428]">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0, 212, 255, 0.3)' }}
                />
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>{activeConv.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {activeConv.department} • {activeConv.college} (Velalar College of Eng. & Tech)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Online
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="btn-cyber-outline"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Close Chat
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConv.messages.map(msg => {
                const isMe = msg.sender === 'recruiter';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-none shadow-[0_2px_10px_rgba(40,215,255,0.2)]'
                          : 'bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Bottom Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 flex items-center gap-2 bg-[#0A1428]">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAttachment}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-cyber-outline"
                style={{ padding: '8px', borderRadius: '8px' }}
                title="Attach Document or Verification Proof"
              >
                <Paperclip size={14} />
              </button>

              <input
                type="text"
                placeholder="Type your message to candidate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="company-input flex-1"
                style={{ padding: '8px 12px', fontSize: '12px' }}
              />

              <button
                type="submit"
                className="btn-cyber-primary"
                style={{ padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Send Message"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
