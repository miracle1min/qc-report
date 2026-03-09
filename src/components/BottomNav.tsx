import React from 'react';
import { Calendar, FileText, LayoutGrid, Clock, Settings } from 'lucide-react';
import { Page } from '../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const BottomNav: React.FC<Props> = ({ currentPage, onNavigate }) => {
  const items: { page: Page; icon: React.ReactNode; label: string }[] = [
    { page: 'schedule', icon: <Calendar size={20} />, label: 'Schedule' },
    { page: 'notes', icon: <FileText size={20} />, label: 'Notes' },
    { page: 'menu', icon: <LayoutGrid size={20} />, label: 'Menu' },
    { page: 'history', icon: <Clock size={20} />, label: 'History' },
    { page: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="bottom-nav">
      {items.map((item) =>
        item.page === 'menu' ? (
          <div
            key={item.page}
            className="nav-center"
            onClick={() => onNavigate('menu')}
          >
            <div className="nav-center-btn">
              <LayoutGrid size={22} color="#000" strokeWidth={2.5} />
            </div>
            <span className="nav-center-label">Menu</span>
          </div>
        ) : (
          <div
            key={item.page}
            className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        )
      )}
    </div>
  );
};
