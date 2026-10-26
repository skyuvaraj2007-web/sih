import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, X, MessageSquare, Brain } from 'lucide-react';

export default function SkillNexusFAB({ onOpenAI, onVoiceQuery }) {
  const [isListening, setIsListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const recognitionRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SR);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isListening && !menuOpen) {
        setPulseActive(true);
        setTimeout(() => setPulseActive(false), 1800);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isListening, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTooltip(true), 2000);
    const t2 = setTimeout(() => setShowTooltip(false), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalText = '';
    recognition.onstart = () => { setIsListening(true); setTranscript(''); setMenuOpen(false); };
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      }
      setTranscript(interim);
    };
    recognition.onend = () => {
      setIsListening(false);
      const query = finalText.trim();
      if (query) { if (onVoiceQuery) onVoiceQuery(query); else if (onOpenAI) onOpenAI(query); }
      else { if (onOpenAI) onOpenAI(); }
      setTranscript('');
    };
    recognition.onerror = () => { setIsListening(false); setTranscript(''); };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setTranscript('');
  };

  const handleMainClick = () => {
    if (isListening) { stopListening(); return; }
    setMenuOpen(prev => !prev);
    setShowTooltip(false);
  };

  const fabCss = [
    "@keyframes nexus-menu-in { from { opacity: 0; transform: scale(0.92) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }",
    "@keyframes nexus-voice-bar { 0%, 100% { height: 6px; } 50% { height: 18px; } }",
    ".nexus-fab-root { position: fixed; right: 24px; bottom: 28px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; pointer-events: none; }",
    ".nexus-fab-root * { pointer-events: auto; }",
    ".nexus-fab-menu { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; animation: nexus-menu-in 0.18s ease-out forwards; }",
    ".nexus-fab-menu-item { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }",
    ".nexus-fab-menu-label { background: #FFFFFF; border: 1px solid #E2E5E9; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 600; color: #17202A; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }",
    ".nexus-fab-menu-btn { width: 40px; height: 40px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s ease; flex-shrink: 0; }",
    ".nexus-fab-menu-btn:hover { transform: translateY(-1px); }",
    ".nexus-fab-btn { position: relative; width: 52px; height: 52px; border-radius: 26px; border: none; cursor: pointer; outline: none; background: #315CFF; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease, transform 0.15s ease; box-shadow: 0 4px 14px rgba(49,92,255,0.3); flex-shrink: 0; user-select: none; }",
    ".nexus-fab-btn:hover { background: #2347D5; transform: translateY(-1px); }",
    ".nexus-fab-btn.listening { background: #DC2626; box-shadow: 0 4px 14px rgba(220,38,38,0.35); }",
    ".nexus-fab-transcript { position: absolute; bottom: 64px; right: 0; background: #FFFFFF; border: 1px solid #E2E5E9; border-radius: 10px; padding: 12px 14px; max-width: 260px; font-size: 13px; color: #17202A; box-shadow: 0 4px 16px rgba(0,0,0,0.1); word-break: break-word; pointer-events: none; min-width: 180px; }",
    ".nexus-fab-waveform { display: flex; align-items: center; gap: 3px; height: 20px; }",
    ".nexus-fab-wave-bar { width: 3px; border-radius: 2px; background: #DC2626; animation: nexus-voice-bar 0.6s ease-in-out infinite; }",
    ".nexus-fab-wave-bar:nth-child(2) { animation-delay: 0.1s; }",
    ".nexus-fab-wave-bar:nth-child(3) { animation-delay: 0.2s; }",
    ".nexus-fab-wave-bar:nth-child(4) { animation-delay: 0.1s; }",
    ".nexus-fab-tooltip { position: absolute; bottom: 64px; right: 0; background: #FFFFFF; border: 1px solid #E2E5E9; border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #4B5563; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.08); pointer-events: none; animation: nexus-menu-in 0.18s ease forwards; }"
  ].join("\n");

  return (
    <>
      <style>{fabCss}</style>
      <div className="nexus-fab-root" ref={menuRef}>
        {menuOpen && !isListening && (
          <div className="nexus-fab-menu">
            <div className="nexus-fab-menu-item" onClick={() => { setMenuOpen(false); if (onOpenAI) onOpenAI(); }}>
              <span className="nexus-fab-menu-label">AI Assistant</span>
              <button className="nexus-fab-menu-btn" style={{ background: '#315CFF' }}>
                <MessageSquare size={18} color="#fff" />
              </button>
            </div>
            {isSpeechSupported && (
              <div className="nexus-fab-menu-item" onClick={() => { setMenuOpen(false); startListening(); }}>
                <span className="nexus-fab-menu-label">Voice Query</span>
                <button className="nexus-fab-menu-btn" style={{ background: '#0D9488' }}>
                  <Mic size={18} color="#fff" />
                </button>
              </div>
            )}
            <div className="nexus-fab-menu-item" onClick={() => { setMenuOpen(false); if (onVoiceQuery) onVoiceQuery('What are my top skill gaps?'); else if (onOpenAI) onOpenAI('What are my top skill gaps?'); }}>
              <span className="nexus-fab-menu-label">Quick Skill Insight</span>
              <button className="nexus-fab-menu-btn" style={{ background: '#4F46E5' }}>
                <Brain size={18} color="#fff" />
              </button>
            </div>
          </div>
        )}

        {isListening && (
          <div className="nexus-fab-transcript">
            {transcript ? (
              <span>{transcript}</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '11px', letterSpacing: '0.04em' }}>LISTENING...</span>
                <div className="nexus-fab-waveform">
                  {[1,2,3,4,5].map(i => <div key={i} className="nexus-fab-wave-bar" />)}
                </div>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Speak your query...</span>
              </div>
            )}
          </div>
        )}

        {showTooltip && !isListening && !menuOpen && (
          <div className="nexus-fab-tooltip">
            <strong style={{ color: '#17202A', display: 'block', marginBottom: '2px', fontWeight: 600 }}>SkillNexus Assistant</strong>
            Click to open assistant or voice search
          </div>
        )}

        <button
          id="skill-nexus-fab"
          className={"nexus-fab-btn" + (isListening ? " listening" : "")}
          onClick={handleMainClick}
          title={isListening ? "Stop listening" : "SkillNexus Assistant"}
          aria-label={isListening ? "Stop voice input" : "Open SkillNexus Assistant"}
        >
          {isListening ? (
            <MicOff size={22} color="#fff" strokeWidth={2} />
          ) : menuOpen ? (
            <X size={20} color="#fff" strokeWidth={2} />
          ) : (
            <Bot size={22} color="#fff" strokeWidth={2} />
          )}
        </button>
      </div>
    </>
  );
}
