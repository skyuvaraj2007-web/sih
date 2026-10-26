import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo  = toast.type === 'info';

  const borderColor = isError ? '#ef4444' : (isInfo ? '#315CFF' : '#10b981');
  const bgColor     = isError ? 'rgba(239,68,68,0.08)' : (isInfo ? 'rgba(49,92,255,0.08)' : 'rgba(16,185,129,0.08)');
  const iconColor   = isError ? '#ef4444' : (isInfo ? '#315CFF' : '#10b981');

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 200,
      background: '#ffffff',
      border: `1px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '14px 18px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '420px',
      animation: 'slideUp 0.2s ease-out'
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0
      }}>
        {isError ? <AlertCircle size={16} color={iconColor} /> : (isInfo ? <Info size={16} color={iconColor} /> : <CheckCircle2 size={16} color={iconColor} />)}
      </div>

      <div style={{ flex: 1 }}>
        {toast.title && (
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#17202A' }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#5F6B76', marginTop: '2px' }}>
          {toast.message}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#8A949E', cursor: 'pointer', padding: '4px' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
