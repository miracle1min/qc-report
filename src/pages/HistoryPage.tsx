import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Copy, Edit3, Trash2, X, ClipboardList } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Report, ToastMsg, FormType, FORM_LABELS, SHIFT_OPTIONS } from '../types';
import { fmtDateTime, copyText } from '../utils/helpers';
import { queryReports, deleteReport } from '../utils/db';

interface Props {
  showToast: (msg: string, type?: ToastMsg['type']) => void;
  onEdit: (form: FormType, reportId: string) => void;
}

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sortir_bawang', label: 'Sortir' },
  { value: 'cabe_giling', label: 'Cabe' },
  { value: 'suhu_equipment', label: 'Suhu' },
  { value: 'tester_bahan', label: 'Tester' },
  { value: 'return_barang', label: 'Return' },
];

export const HistoryPage: React.FC<Props> = ({ showToast, onEdit }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReports = useCallback(() => {
    const rows = queryReports({ type: typeFilter, shift: shiftFilter, search: search.trim() });
    setReports(rows as unknown as Report[]);
  }, [typeFilter, shiftFilter, search]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleCopy = async (text: string) => {
    await copyText(text);
    showToast('Report copied successfully ✓', 'success');
  };

  const handleDelete = (id: string) => {
    deleteReport(id);
    setReports(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
    showToast('Report deleted', 'info');
  };

  return (
    <div className="page-enter">
      <PageHeader title="History" subtitle={`${reports.length} reports`} />

      <div style={{ padding: '4px 16px 24px' }}>
        <div className="cyber-search-wrap" style={{ marginBottom: 12 }}>
          <Search size={18} />
          <input
            className="cyber-search"
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row" style={{ marginBottom: 8 }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-pill ${typeFilter === f.value ? 'active' : ''}`}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="filter-row" style={{ marginBottom: 14 }}>
          <button
            className={`filter-pill ${shiftFilter === 'all' ? 'active' : ''}`}
            onClick={() => setShiftFilter('all')}
          >
            All Shifts
          </button>
          {SHIFT_OPTIONS.map(s => (
            <button
              key={s}
              className={`filter-pill ${shiftFilter === s ? 'active' : ''}`}
              onClick={() => setShiftFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="empty-state">
            <ClipboardList size={40} className="muted-text" />
            <p>No reports found</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((r) => (
            <div key={r.id} className="item-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="cyber-badge">{FORM_LABELS[r.type as FormType] || r.type}</span>
                <span className="cyber-badge-accent" style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(255,43,214,0.08)', color: 'var(--cyber-accent)', border: '1px solid rgba(255,43,214,0.25)' }}>{r.shift}</span>
              </div>
              <p className="muted-text" style={{ fontSize: 12, margin: '0 0 10px' }}>
                {fmtDateTime(r.created_at)}
              </p>

              {expandedId === r.id && (
                <div className="report-output" style={{ marginBottom: 10, fontSize: 12 }}>
                  {r.generated_text}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn-neon btn-sm" style={{ padding: '5px 12px' }} onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  {expandedId === r.id ? <X size={14} /> : <Eye size={14} />}
                  {expandedId === r.id ? 'Close' : 'View'}
                </button>
                <button className="btn-neon btn-sm" style={{ padding: '5px 12px' }} onClick={() => handleCopy(r.generated_text)}>
                  <Copy size={14} /> Copy
                </button>
                <button className="btn-accent btn-sm" style={{ padding: '5px 12px' }} onClick={() => onEdit(r.type as FormType, r.id)}>
                  <Edit3 size={14} /> Edit
                </button>
                {deletingId === r.id ? (
                  <button className="btn-danger btn-sm" style={{ padding: '5px 12px' }} onClick={() => handleDelete(r.id)}>
                    Confirm?
                  </button>
                ) : (
                  <button className="btn-danger btn-sm" style={{ padding: '5px 12px', width: 'auto' }} onClick={() => setDeletingId(r.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
