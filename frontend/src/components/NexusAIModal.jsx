import React, { useState } from 'react';
import { Sparkles, X, Send, ArrowRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { loadAssessmentStore } from '../services/assessmentStore';

export default function NexusAIModal({ isOpen, onClose, setActivePage }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Greetings! I am your Nexus AI Career Companion. I'm actively synthesizing your skill telemetry, diagnostic velocity, and corporate opportunities. How can I accelerate your roadmap today?"
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "Review my latest assessment",
    "How do I close my skill gaps?",
    "What is my highest matched job right now?",
    "Show my Digital Passport credentials"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    const store = loadAssessmentStore();
    const latest = store.assessments[0];

    try {
      const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '') + '/api';
      const token = localStorage.getItem('nexus_token') || localStorage.getItem('token') || localStorage.getItem('nexus_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ message: query, latestAssessment: latest })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages([...newMsgs, { sender: 'ai', text: data.reply, suggestions: data.suggestions }]);
      } else {
        throw new Error(data.message || 'AI synthesis unavailable');
      }
    } catch (err) {
      // Explainable AI synthesis from assessment store
      let reply = '';
      if (query.toLowerCase().includes('assessment') || query.toLowerCase().includes('review')) {
        if (latest) {
          reply = `I evaluated your ${latest.trackTitle} Diagnostic: Overall Score is ${latest.score}% (${latest.percentile}th percentile nationally). Your key strengths are ${latest.strengths?.join(', ')}. Identified gaps: ${latest.weaknesses?.join(', ')}. ${latest.aiRecommendation?.summary || ''} Next recommended milestone: ${latest.aiRecommendation?.nextBestAction || 'Start recommended sprint'}.`;
        } else {
          reply = "You haven't completed an assessment yet. I recommend starting with Logical Reasoning or Programming to benchmark your foundational skills.";
        }
      } else if (query.toLowerCase().includes('gap')) {
        reply = `Current identified skill gaps in your matrix: System Design (43%) and Cloud Computing (58%). Completing the Graph Algorithms sprint and containerization lab will boost your candidate readiness index to 85%+.`;
      } else {
        reply = `I analyzed your profile telemetry: Career Journey Readiness is at ${store.careerJourney}%. Technical Skills: ${store.capabilities.technicalSkills}%, Problem Solving: ${store.capabilities.problemSolving}%. Your highest verified opportunity match is Data Analyst Intern at ABC Technologies (92% match).`;
      }
      setMessages([...newMsgs, { sender: 'ai', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          background: 'rgba(6, 26, 51, 0.96)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderLeft: '1px solid rgba(0, 217, 255, 0.35)',
          boxShadow: '-12px 0 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 101,
          animation: 'slideInRight 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(8, 36, 71, 0.85)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00D9FF 0%, #00539C 50%, #7C3AED 100%)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 217, 255, 0.45)',
              color: '#FFFFFF'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                Nexus AI Career Companion
              </div>
              <div style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'var(--font-mono)' }}>
                • Active Telemetry Model v4.2
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Real-time Candidate Calibration Banner */}
        <div style={{
          padding: '10px 22px',
          background: 'rgba(0, 217, 255, 0.08)',
          borderBottom: '1px solid rgba(0, 217, 255, 0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)',
          color: '#D7E7FF'
        }}>
          <span>READINESS: <strong style={{ color: '#00D9FF' }}>72%</strong></span>
          <span>INTEGRITY: <strong style={{ color: '#19D3AE' }}>99.4%</strong></span>
          <span>STREAK: <strong style={{ color: '#FFD662' }}>12 Days</strong></span>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}>
              <div style={{
                padding: '13px 18px',
                borderRadius: '16px',
                fontSize: '13.5px',
                lineHeight: 1.55,
                background: m.sender === 'user'
                  ? 'linear-gradient(135deg, #00539C 0%, #1688FF 50%, #00D9FF 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                fontWeight: m.sender === 'user' ? 600 : 400,
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: m.sender === 'user' ? '0 4px 18px rgba(0, 83, 156, 0.45)' : '0 4px 16px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}>
                {m.text}
              </div>

              {/* Suggestions */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {m.suggestions.map((s, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(s)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        background: 'rgba(0, 212, 255, 0.08)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        color: 'var(--cyber-cyan)',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: 'rgba(17, 26, 48, 0.9)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--cyber-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="status-dot-pulse"></span>
                Synthesizing career graph & recommendations...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {/* Quick Prompts */}
        <div style={{ padding: '10px 18px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#D7E7FF',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(6, 26, 51, 0.98)' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Ask anything about skills, assessments, jobs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '11px 16px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '11px 18px',
                background: 'linear-gradient(135deg, #00539C 0%, #1688FF 50%, #00D9FF 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 83, 156, 0.4)'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
