import React, { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Link, Info } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ToastMsg } from '../types';
import { getSetting, setSetting, exportAllData, importAllData, clearAllData } from '../utils/db';

interface Props {
  showToast: (msg: string, type?: ToastMsg['type']) => void;
  canInstall?: boolean;
  installApp?: () => Promise<void>;
}

export const SettingsPage: React.FC<Props> = ({ showToast, canInstall, installApp }) => {
  const [scheduleUrl, setScheduleUrl] = useState('');
  const [urlSaved, setUrlSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setScheduleUrl(getSetting('scheduleUrl'));
  }, []);

  const saveUrl = () => {
    setSetting('scheduleUrl', scheduleUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
    showToast('Schedule URL saved ✓', 'success');
  };

  const handleExport = () => {
    try {
      const backup = exportAllData();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `qc-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup exported ✓', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed', 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        importAllData(data);
        showToast(`Imported ${data.reports?.length || 0} reports, ${data.notes?.length || 0} notes ✓`, 'success');
      } catch (err) {
        console.error('Import failed:', err);
        showToast('Import failed — invalid file', 'error');
      }
    };
    input.click();
  };

  const handleClear = () => {
    clearAllData();
    setShowClearConfirm(false);
    showToast('All data cleared', 'info');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Settings" subtitle="App Configuration" />

      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Link size={18} className="neon-text" />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Schedule Spreadsheet URL</span>
          </div>
          <input
            className="cyber-input"
            value={scheduleUrl}
            onChange={e => setScheduleUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <button className="btn-neon btn-sm" style={{ marginTop: 10 }} onClick={saveUrl}>
            {urlSaved ? '✓ Saved' : 'Save URL'}
          </button>
          <p className="muted-text" style={{ fontSize: 11, marginTop: 8 }}>
            Paste Google Sheets URL — data diambil otomatis via CSV
          </p>
        </div>

        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Download size={18} className="neon-text" />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Data Management</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn-neon" onClick={handleExport}>
              <Download size={18} /> Export Backup (JSON)
            </button>
            <button className="btn-accent" onClick={handleImport}>
              <Upload size={18} /> Import Backup (JSON)
            </button>
            <hr className="cyber-divider" />
            {showClearConfirm ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-danger" style={{ flex: 1 }} onClick={handleClear}>
                  Yes, Clear All
                </button>
                <button className="btn-neon" style={{ flex: 1 }} onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn-danger" onClick={() => setShowClearConfirm(true)}>
                <Trash2 size={18} /> Clear All Data
              </button>
            )}
          </div>
        </div>

        {canInstall && (
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Download size={18} color="#00f7ff" />
              <span style={{ fontSize: 15, fontWeight: 600 }}>Install App</span>
            </div>
            <p className="muted-text" style={{ fontSize: 12, marginBottom: 12 }}>
              Install QC Report di home screen untuk akses cepat & offline mode
            </p>
            <button className="btn-neon" onClick={installApp}>
              <Download size={18} /> Install ke Home Screen
            </button>
          </div>
        )}

        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Info size={18} className="neon-text" />
            <span style={{ fontSize: 15, fontWeight: 600 }}>About</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="muted-text">App Version</span>
              <span className="neon-text" style={{ fontWeight: 600 }}>v1.2.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="muted-text">Platform</span>
              <span>QC Report PWA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="muted-text">Storage</span>
              <span>JSON LocalStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
