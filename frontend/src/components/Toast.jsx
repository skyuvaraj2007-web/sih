import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  const borderColor = isError ? 'var(--cyber-rose)' : (isInfo ? 'var(--cyber-cyan)' : 'var(--cyber-emerald)');
  const bgColor = isError ? 'rgba(244, 63, 94, 0.15)' : (isInfo ? 'rgba(0, 212, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)');
  const iconColor = isError ? 'var(--cyber-rose)' : (isInfo ? 'var(--cyber-cyan)' : 'var(--cyber-emerald)');

  return (
    <div 
      role="status"
      aria-live="polite"
      className="toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        background: 'rgba(11, 22, 42, 0.94)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: '0 20px 45px rgba(0,0,0,0.65), 0 0 1px rgba(255,255,255,0.2) inset',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        animation: 'modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0
      }}>
        {isError ? <AlertCircle size={18} color={iconColor} /> : (isInfo ? <Info size={18} color={iconColor} /> : <CheckCircle2 size={18} color={iconColor} />)}
      </div>

      <div style={{ flex: 1 }}>
        {toast.title && (
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
          {toast.message}
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 80ms ease-out'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
