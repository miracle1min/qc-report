import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  onBack?: () => void;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, onBack, subtitle, rightAction }) => (
  <div className="flex items-center gap-3 px-4 pt-4 pb-2">
    {onBack && (
      <button
        onClick={onBack}
        className="p-1 -ml-1 neon-text"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <ChevronLeft size={26} />
      </button>
    )}
    <div className="flex-1 min-w-0">
      <h1 className="section-title" style={{ margin: 0 }}>{title}</h1>
      {subtitle && <p className="muted-text" style={{ fontSize: 12, margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
    {rightAction && <div>{rightAction}</div>}
  </div>
);
