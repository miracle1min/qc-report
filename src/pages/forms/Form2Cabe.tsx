import React, { useState, useEffect } from 'react';
import { FileText, Copy, Save } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps, SHIFT_OPTIONS } from '../../types';
import { genId, nowISO, reportFooter, copyText, formatDateTimeInput } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

export const Form2Cabe: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [shift, setShift] = useState('');
  const [kodeProduksi, setKodeProduksi] = useState('');
  const [beratKotor, setBeratKotor] = useState('');
  const [pakaiTutup, setPakaiTutup] = useState(true);
  const [temuan, setTemuan] = useState('');
  const [output, setOutput] = useState('');
  const [recordId, setRecordId] = useState('');

  const TARE_TUTUP = 185;
  const TARE_TANPA = 125;

  const tare = pakaiTutup ? TARE_TUTUP : TARE_TANPA;
  const beratBersih = beratKotor ? Math.max(0, Number(beratKotor) - tare) : 0;

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        const d = JSON.parse(r.data);
        setShift(d.shift || '');
        setKodeProduksi(d.kodeProduksi || '');
        setBeratKotor(d.beratKotor || d.qty || '');
        setPakaiTutup(d.pakaiTutup !== undefined ? d.pakaiTutup : true);
        setTemuan(d.temuan || '');
        setOutput(r.generated_text || '');
        setRecordId(r.id);
      }
    }
  }, [editId]);

  const generate = () => {
    if (!shift) { showToast('Pilih Shift dulu', 'error'); return; }
    const tutupLabel = pakaiTutup ? 'Pakai Tutup' : 'Tanpa Tutup';
    const text = `*_REPORT CABE GILING_*\n\n🕐 Shift : ${shift}\n📅 Kode Produksi : ${formatDateTimeInput(kodeProduksi)}\n⚖️ Berat Timbang : ${beratKotor || '-'} gram (${tutupLabel})\n📐 Potongan Wadah : ${tare} gram\n✅ Berat Bersih : ${beratKotor ? beratBersih : '-'} gram\n🔍 Temuan QC :\n  ${temuan || '-'}\n${reportFooter()}`;
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
    const data = JSON.stringify({ shift, kodeProduksi, beratKotor, pakaiTutup, temuan });
    saveReport({ id, type: 'cabe_giling', shift, data, generated_text: output, created_at: recordId ? '' : nowISO() });
    if (!recordId) setRecordId(id);
    showToast('Record saved ✓', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Cabe Giling" onBack={onBack} subtitle="Report Form" />
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Shift</label>
          <select className="cyber-input" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="">— Pilih Shift —</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <div><label className="form-label">Kode Produksi</label>
          <input className="cyber-input" type="datetime-local" value={kodeProduksi} onChange={e => setKodeProduksi(e.target.value)} /></div>

        {/* Toggle Pakai Tutup */}
        <div>
          <label className="form-label">Jenis Wadah</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPakaiTutup(true)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 8,
                border: pakaiTutup ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.15)',
                background: pakaiTutup ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: pakaiTutup ? '#00e5ff' : 'rgba(255,255,255,0.5)',
                fontWeight: pakaiTutup ? 700 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🫙 Pakai Tutup
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>-{TARE_TUTUP}g</div>
            </button>
            <button
              type="button"
              onClick={() => setPakaiTutup(false)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 8,
                border: !pakaiTutup ? '2px solid #ff9100' : '1px solid rgba(255,255,255,0.15)',
                background: !pakaiTutup ? 'rgba(255,145,0,0.15)' : 'rgba(255,255,255,0.04)',
                color: !pakaiTutup ? '#ff9100' : 'rgba(255,255,255,0.5)',
                fontWeight: !pakaiTutup ? 700 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🥣 Tanpa Tutup
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>-{TARE_TANPA}g</div>
            </button>
          </div>
        </div>

        {/* Berat Timbang */}
        <div><label className="form-label">Berat Timbang (gram)</label>
          <input className="cyber-input" type="number" value={beratKotor} onChange={e => setBeratKotor(e.target.value)} placeholder="Masukkan berat timbangan" /></div>

        {/* Live preview berat bersih */}
        {beratKotor && (
          <div style={{
            background: 'rgba(0,229,255,0.08)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>Berat Bersih</div>
              <div style={{ fontSize: 11, opacity: 0.4 }}>{beratKotor}g − {tare}g ({pakaiTutup ? 'tutup' : 'tanpa tutup'})</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#00e5ff' }}>{beratBersih}g</div>
          </div>
        )}

        <div><label className="form-label">Temuan QC</label>
          <textarea className="cyber-input" value={temuan} onChange={e => setTemuan(e.target.value)} placeholder="Temuan..." rows={3} /></div>
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
