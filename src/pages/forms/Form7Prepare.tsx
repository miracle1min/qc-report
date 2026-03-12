import React, { useState, useEffect } from 'react';
import { FileText, Copy, Save } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps } from '../../types';
import { genId, nowISO, reportFooter, copyText, fmtDate } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

interface PrepareItem {
  key: string;
  emoji: string;
  label: string;
  unit: string;
}

const GROUPS: PrepareItem[][] = [
  [
    { key: 'mie', emoji: '🍜', label: 'Mie', unit: 'Baki' },
    { key: 'cabai', emoji: '🌶️', label: 'Cabai', unit: 'Resep' },
    { key: 'bawangGoreng', emoji: '🧅', label: 'Bawang Goreng', unit: 'Toples' },
  ],
  [
    { key: 'udangRambutan', emoji: '🍤', label: 'Udang Rambutan', unit: 'Sealpack' },
    { key: 'udangKejuFrozen', emoji: '🧀', label: 'Udang Keju Frozen', unit: 'Keranjang' },
    { key: 'siomayAyam', emoji: '🥟', label: 'Siomay Ayam', unit: 'Dandang' },
  ],
  [
    { key: 'lemonTea', emoji: '🍋', label: 'Lemon Tea', unit: 'Resep' },
    { key: 'orange', emoji: '🍊', label: 'Orange', unit: 'Resep' },
    { key: 'greentea', emoji: '🍵', label: 'Greentea', unit: 'Resep' },
    { key: 'thaitea', emoji: '🧋', label: 'Thaitea', unit: 'Resep' },
  ],
  [
    { key: 'teh', emoji: '🍶', label: 'Teh', unit: 'Resep' },
    { key: 'gula', emoji: '🍯', label: 'Gula', unit: 'Resep' },
  ],
  [
    { key: 'potonganStrawberry', emoji: '🍓', label: 'Potongan Strawberry', unit: 'Toples Kecil' },
    { key: 'potonganCincau', emoji: '🖤', label: 'Potongan Cincau', unit: 'Toples' },
  ],
  [
    { key: 'biangGobak', emoji: '🥣', label: 'Biang Gobak', unit: 'Resep' },
  ],
];

function todayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function nowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const Form7Prepare: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [tanggal, setTanggal] = useState(todayStr());
  const [jam, setJam] = useState(nowTimeStr());
  const [values, setValues] = useState<Record<string, string>>({});
  const [pangsitToples, setPangsitToples] = useState('');
  const [pangsitKeranjang, setPangsitKeranjang] = useState('');
  const [kerupukMie, setKerupukMie] = useState('');
  const [output, setOutput] = useState('');
  const [recordId, setRecordId] = useState('');

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        const d = JSON.parse(r.data);
        setTanggal(d.tanggal || todayStr());
        setJam(d.jam || nowTimeStr());
        setValues(d.values || {});
        setPangsitToples(d.pangsitToples || '');
        setPangsitKeranjang(d.pangsitKeranjang || '');
        setKerupukMie(d.kerupukMie || '');
        setOutput(r.generated_text || '');
        setRecordId(r.id);
      }
    }
  }, [editId]);

  const v = (key: string) => values[key] || '-';
  const setVal = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }));

  const formatTanggal = (dateStr: string): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return fmtDate(d.toISOString());
  };

  const generate = () => {
    const lines: string[] = [];
    lines.push('📋 *Report Preparean*');
    lines.push(`🗓️ ${formatTanggal(tanggal)}`);
    lines.push(`🕗 ${jam || '-'}`);

    for (let gi = 0; gi < GROUPS.length; gi++) {
      lines.push('');
      for (const item of GROUPS[gi]) {
        const val = values[item.key] || '-';
        lines.push(`${item.emoji} ${item.label}: ${val} ${item.unit}  `);
      }
    }

    // Group 7: Pangsit Goreng + Kerupuk Mie
    lines.push('');
    lines.push(`🥟 Pangsit Goreng: ${pangsitToples || '-'} Toples ${pangsitKeranjang || '-'} Keranjang  `);
    lines.push(`🍘 Kerupuk Mie: ${kerupukMie || '-'} Toples`);

    const text = lines.join('\n');
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
    const data = JSON.stringify({ tanggal, jam, values, pangsitToples, pangsitKeranjang, kerupukMie });
    saveReport({ id, type: 'prepare', shift: '', data, generated_text: output, created_at: recordId ? '' : nowISO() });
    if (!recordId) setRecordId(id);
    showToast('Record saved ✓', 'success');
  };

  const groupDivider = (
    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '6px 0' }} />
  );

  return (
    <div className="page-enter">
      <PageHeader title="Report Preparean" onBack={onBack} subtitle="Prepare Form" />
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Date & Time */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">📅 Tanggal</label>
            <input className="cyber-input" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">🕗 Jam</label>
            <input className="cyber-input" type="time" value={jam} onChange={e => setJam(e.target.value)} />
          </div>
        </div>

        {/* Groups */}
        {GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && groupDivider}
            {group.map(item => (
              <div key={item.key}>
                <label className="form-label">{item.emoji} {item.label} <span style={{ opacity: 0.4, fontSize: 11 }}>({item.unit})</span></label>
                <input
                  className="cyber-input"
                  type="text"
                  value={values[item.key] || ''}
                  onChange={e => setVal(item.key, e.target.value)}
                  placeholder="-"
                />
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Group 7: Pangsit Goreng (dual input) + Kerupuk Mie */}
        {groupDivider}
        <div>
          <label className="form-label">🥟 Pangsit Goreng <span style={{ opacity: 0.4, fontSize: 11 }}>(Toples & Keranjang)</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <input
                className="cyber-input"
                type="text"
                value={pangsitToples}
                onChange={e => setPangsitToples(e.target.value)}
                placeholder="-"
              />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, textAlign: 'center' }}>Toples</div>
            </div>
            <div style={{ flex: 1 }}>
              <input
                className="cyber-input"
                type="text"
                value={pangsitKeranjang}
                onChange={e => setPangsitKeranjang(e.target.value)}
                placeholder="-"
              />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, textAlign: 'center' }}>Keranjang</div>
            </div>
          </div>
        </div>
        <div>
          <label className="form-label">🍘 Kerupuk Mie <span style={{ opacity: 0.4, fontSize: 11 }}>(Toples)</span></label>
          <input
            className="cyber-input"
            type="text"
            value={kerupukMie}
            onChange={e => setKerupukMie(e.target.value)}
            placeholder="-"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button className="btn-solid-neon" onClick={generate}><FileText size={18} /> Generate Report</button>
          <button className="btn-neon" onClick={handleCopy}><Copy size={18} /> Copy to WhatsApp</button>
          <button className="btn-accent" onClick={handleSave}><Save size={18} /> Save Record</button>
        </div>

        {/* Output */}
        {output && (
          <div style={{ marginTop: 8 }}>
            <label className="form-label">Generated Output</label>
            <div className="report-output">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
};
