import React from 'react';
import { Zap } from 'lucide-react';

export const AppHeader: React.FC = () => (
  <div style={{
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'linear-gradient(180deg, rgba(10,10,15,0.97) 0%, rgba(10,10,15,0.92) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,247,255,0.08)',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}>
    {/* Left — Logo + Title */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(0,247,255,0.15), rgba(255,43,214,0.1))',
        border: '1px solid rgba(0,247,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Zap size={18} color="#00f7ff" strokeWidth={2.2} />
      </div>
      <div>
        <h1 style={{
          fontSize: 16,
          fontWeight: 800,
          margin: 0,
          letterSpacing: '0.05em',
          background: 'linear-gradient(135deg, #00f7ff 0%, #ff2bd6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.2,
        }}>
          QC REPORT
        </h1>
        <p style={{
          fontSize: 9,
          margin: 0,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Generator & Logger
        </p>
      </div>
    </div>

    {/* Right — Tagline badge */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 20,
      background: 'rgba(255,43,214,0.06)',
      border: '1px solid rgba(255,43,214,0.12)',
    }}>
      <span style={{
        fontSize: 9,
        color: 'rgba(255,43,214,0.6)',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        App by Marko
      </span>
    </div>
  </div>
);
