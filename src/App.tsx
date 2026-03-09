import React, { useState, useCallback } from 'react';

import { BottomNav } from './components/BottomNav';
import { AppHeader } from './components/AppHeader';
import { ToastContainer } from './components/Toast';
import { SchedulePage } from './pages/SchedulePage';
import { NotesPage } from './pages/NotesPage';
import { MainMenu } from './pages/MainMenu';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { Form1Sortir } from './pages/forms/Form1Sortir';
import { Form2Cabe } from './pages/forms/Form2Cabe';
import { Form3Suhu } from './pages/forms/Form3Suhu';
import { Form4Tester } from './pages/forms/Form4Tester';
import { Form5Return } from './pages/forms/Form5Return';
import { initDB } from './utils/db';
import { Page, FormType, ToastMsg } from './types';

// Init localStorage keys on load
initDB();

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('menu');
  const [activeForm, setActiveForm] = useState<FormType | null>(null);
  const [editReportId, setEditReportId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const showToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const openForm = useCallback((form: FormType, reportId?: string) => {
    setActiveForm(form);
    setEditReportId(reportId ?? null);
  }, []);

  const closeForm = useCallback(() => {
    setActiveForm(null);
    setEditReportId(null);
  }, []);

  const navigate = useCallback((p: Page) => {
    setPage(p);
    setActiveForm(null);
    setEditReportId(null);
  }, []);

  const renderContent = () => {
    if (activeForm) {
      const formProps = { onBack: closeForm, showToast, editId: editReportId };
      switch (activeForm) {
        case 'sortir_bawang': return <Form1Sortir {...formProps} />;
        case 'cabe_giling': return <Form2Cabe {...formProps} />;
        case 'suhu_equipment': return <Form3Suhu {...formProps} />;
        case 'tester_bahan': return <Form4Tester {...formProps} />;
        case 'return_barang': return <Form5Return {...formProps} />;
      }
    }
    switch (page) {
      case 'schedule': return <SchedulePage showToast={showToast} />;
      case 'notes': return <NotesPage showToast={showToast} />;
      case 'menu': return <MainMenu onOpenForm={openForm} />;
      case 'history': return <HistoryPage showToast={showToast} onEdit={openForm} />;
      case 'settings': return <SettingsPage showToast={showToast} />;
    }
  };

  return (
    <div className="cyber-app" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppHeader />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: activeForm ? 0 : 64 }}>
        <div className="page-enter" key={activeForm || page}>
          {renderContent()}
        </div>
      </div>
      {!activeForm && (
        <BottomNav currentPage={page} onNavigate={navigate} />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
};
