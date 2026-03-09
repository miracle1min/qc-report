import React, { useState, useEffect } from 'react';
import { FileText, Copy, Save, CheckCircle, Edit3 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps, SHIFT_OPTIONS } from '../../types';
import { genId, nowISO, reportFooter, copyText } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

export const Form4Tester: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [shift, setShift] = useState('');
  const [statusMode, setStatusMode] = useState<'auto' | 'manual'>('auto');
  const [manualText, setManualText] = useState('');
  const [output, setOutput] = useState('');
  const [recordId, setRecordId] = useState('');

  const AUTO_TEXT = '✅ All Produk Aman & Approved untuk di proses';

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        const d = JSON.parse(r.data);
        setShift(d.shift || ''); setStatusMode(d.statusMode || 'auto');
        setManualText(d.manualText || '');
        setOutput(r.generated_text || ''); setRecordId(r.id);
      }
    }
  }, [editId]);

  const generate = () => {
    if (!shift) { showToast('Pilih Shift dulu', 'error'); return; }
    const ketText = statusMode === 'auto' ? AUTO_TEXT : (manualText || '-');
    const text = `*_TESTER BAHAN & PRODUK SISA SEMALAM_*\n\n🕐 Shift : ${shift}\n📝 Keterangan :\n  ${ketText}\n${reportFooter()}`;
    setOutput(text);
    showToast('Report generated!', 'success');
  };

  const handleCopy = async () => {
    if (!output) { showToast('Generate report dulu', 'error'); return; }
    await copyText(output);
    showToast('Report copied successfully ✓', 'success');
  };

  const handleSave = () => {
    if (!output) { showToast('Generate report dulu', 'error'); return; }
    const id = recordId || genId();
    const data = JSON.stringify({ shift, statusMode, manualText });
    saveReport({ id, type: 'tester_bahan', shift, data, generated_text: output, created_at: recordId ? '' : nowISO() });
    if (!recordId) setRecordId(id);
    showToast('Record saved ✓', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Tester Bahan" onBack={onBack} subtitle="Produk Sisa Semalam" />
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Shift</label>
          <select className="cyber-input" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="">— Pilih Shift —</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <div>
          <label className="form-label">Status</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className={`status-option ${statusMode === 'auto' ? 'selected' : ''}`} onClick={() => setStatusMode('auto')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={20} className={statusMode === 'auto' ? 'neon-text' : 'muted-text'} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>All Produk Aman</div>
                  <div className="muted-text" style={{ fontSize: 12 }}>Approved untuk di proses</div>
                </div>
              </div>
            </div>
            <div className={`status-option ${statusMode === 'manual' ? 'selected' : ''}`} onClick={() => setStatusMode('manual')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Edit3 size={20} className={statusMode === 'manual' ? 'neon-text' : 'muted-text'} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Manual Input</div>
                  <div className="muted-text" style={{ fontSize: 12 }}>Tulis keterangan manual</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {statusMode === 'manual' && (
          <div><label className="form-label">Keterangan Manual</label>
            <textarea className="cyber-input" value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Tulis keterangan..." rows={4} /></div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button className="btn-solid-neon" onClick={generate}><FileText size={18} /> Generate Report</button>
          <button className="btn-neon" onClick={handleCopy}><Copy size={18} /> Copy to WhatsApp</button>
          <button className="btn-accent" onClick={handleSave}><Save size={18} /> Save Record</button>
        </div>
        {output && (<div style={{ marginTop: 8 }}><label className="form-label">Generated Output</label><div className="report-output">{output}</div></div>)}
      </div>
    </div>
  );
};
