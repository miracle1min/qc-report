import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface Props {
  show: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<Props> = ({ show, onUpdate, onDismiss }) => {
  if (!show) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, rgba(0,247,255,0.15), rgba(255,43,214,0.1))',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,247,255,0.3)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      animation: 'slideDown 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(0,247,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <RefreshCw size={16} color="#00f7ff" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>
            🚀 Update Tersedia!
          </p>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            Versi baru siap diinstall
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onUpdate}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid rgba(0,247,255,0.4)',
            background: 'rgba(0,247,255,0.12)',
            color: '#00f7ff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Update Now
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
