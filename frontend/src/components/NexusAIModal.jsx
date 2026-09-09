import React, { useState } from 'react';
import { Sparkles, X, Send, ArrowRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { loadAssessmentStore } from '../services/assessmentStore';

export default function NexusAIModal({ isOpen, onClose, setActivePage }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Greetings Arun! I am your Nexus AI Career Companion. I'm actively synthesizing your skill telemetry, diagnostic velocity, and corporate opportunities. How can I accelerate your roadmap today?"
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
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, latestAssessment: latest })
      });
      const data = await res.json();
      setMessages([...newMsgs, { sender: 'ai', text: data.reply, suggestions: data.suggestions }]);
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
          background: '#090D1A',
          borderLeft: '1px solid var(--border-glow)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 101,
          animation: 'slideInRight 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 17, 32, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#000'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Nexus AI Career Companion
              </div>
              <div style={{ fontSize: '11px', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>
                • Active Telemetry Model v4.2
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Real-time Candidate Calibration Banner */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(139, 92, 246, 0.08)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)'
        }}>
          <span>READINESS: <strong style={{ color: 'var(--cyber-cyan)' }}>72%</strong></span>
          <span>INTEGRITY: <strong style={{ color: 'var(--cyber-emerald)' }}>99.4%</strong></span>
          <span>STREAK: <strong style={{ color: 'var(--cyber-purple)' }}>12 Days</strong></span>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                lineHeight: 1.5,
                background: m.sender === 'user' 
                  ? 'linear-gradient(135deg, #00D4FF 0%, #2563EB 100%)' 
                  : 'rgba(17, 26, 48, 0.9)',
                color: m.sender === 'user' ? '#060B14' : 'var(--text-primary)',
                fontWeight: m.sender === 'user' ? 600 : 400,
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                boxShadow: m.sender === 'user' ? 'var(--cyber-cyan-glow)' : 'none'
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
        <div style={{ padding: '8px 16px', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid var(--border-subtle)' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              style={{
                whiteSpace: 'nowrap',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(10, 15, 28, 0.95)' }}>
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
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 16px',
                background: 'var(--cyber-cyan)',
                border: 'none',
                borderRadius: '8px',
                color: '#060B14',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
