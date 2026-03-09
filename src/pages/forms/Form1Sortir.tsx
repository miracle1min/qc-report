import React, { useState, useEffect } from 'react';
import { FileText, Copy, Save } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps, SHIFT_OPTIONS } from '../../types';
import { genId, nowISO, reportFooter, copyText, formatDateInput, fmtDate } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

export const Form1Sortir: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [shift, setShift] = useState('');
  const [kodeProduksi, setKodeProduksi] = useState('');
  const [kodeExpired, setKodeExpired] = useState('');
  const [kodeLot, setKodeLot] = useState('');
  const [qtyPack, setQtyPack] = useState('');
  const [temuan, setTemuan] = useState('');
  const [output, setOutput] = useState('');
  const [recordId, setRecordId] = useState('');

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        const d = JSON.parse(r.data);
        setShift(d.shift || '');
        setKodeProduksi(d.kodeProduksi || '');
        setKodeExpired(d.kodeExpired || '');
        setKodeLot(d.kodeLot || '');
        setQtyPack(d.qtyPack || '');
        setTemuan(d.temuan || '');
        setOutput(r.generated_text || '');
        setRecordId(r.id);
      }
    }
  }, [editId]);

  const generate = () => {
    if (!shift) { showToast('Pilih Shift dulu', 'error'); return; }
    const kodeProdFormatted = kodeProduksi ? fmtDate(new Date(kodeProduksi).toISOString()) : '-';
    const text = `*_REPORT SORTIR BAWANG GORENG_*\n\n🕐 Shift : ${shift}\n📅 Kode Produksi : ${kodeProdFormatted}\n⏳ Kode Expired : ${formatDateInput(kodeExpired)}\n🏷️ Kode LOT : ${formatDateInput(kodeLot)}\n📦 Qty Pack : ${qtyPack || '-'}\n🔍 Temuan QC :\n  ${temuan || '-'}\n${reportFooter()}`;
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
    const data = JSON.stringify({ shift, kodeProduksi, kodeExpired, kodeLot, qtyPack, temuan });
    saveReport({ id, type: 'sortir_bawang', shift, data, generated_text: output, created_at: recordId ? '' : nowISO() });
    if (!recordId) setRecordId(id);
    showToast('Record saved ✓', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Sortir Bawang Goreng" onBack={onBack} subtitle="Report Form" />
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Shift</label>
          <select className="cyber-input" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="">— Pilih Shift —</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="form-label">Kode Produksi</label>
          <input className="cyber-input" type="date" value={kodeProduksi} onChange={e => setKodeProduksi(e.target.value)} />
        </div>
        <div><label className="form-label">Kode Expired</label>
          <input className="cyber-input" type="date" value={kodeExpired} onChange={e => setKodeExpired(e.target.value)} />
        </div>
        <div><label className="form-label">Kode LOT</label>
          <input className="cyber-input" type="date" value={kodeLot} onChange={e => setKodeLot(e.target.value)} />
        </div>
        <div><label className="form-label">Qty Pack</label>
          <input className="cyber-input" type="number" value={qtyPack} onChange={e => setQtyPack(e.target.value)} placeholder="0" />
        </div>
        <div><label className="form-label">Temuan QC</label>
          <textarea className="cyber-input" value={temuan} onChange={e => setTemuan(e.target.value)} placeholder="Temuan..." rows={3} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button className="btn-solid-neon" onClick={generate}><FileText size={18} /> Generate Report</button>
          <button className="btn-neon" onClick={handleCopy}><Copy size={18} /> Copy to WhatsApp</button>
          <button className="btn-accent" onClick={handleSave}><Save size={18} /> Save Record</button>
        </div>
        {output && (
          <div style={{ marginTop: 8 }}><label className="form-label">Generated Output</label>
            <div className="report-output">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
};
