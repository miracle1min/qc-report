import React from 'react';
import { ToastMsg } from '../types';

interface Props {
  toasts: ToastMsg[];
}

export const ToastContainer: React.FC<Props> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
