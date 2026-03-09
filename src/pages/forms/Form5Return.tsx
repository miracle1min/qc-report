import React, { useState, useEffect } from 'react';
import { PackageX, Copy, Save, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps } from '../../types';
import { genId, nowISO, reportFooter, copyText, fmtDate } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

export const Form5Return: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [cabang, setCabang] = useState('');
  const [supplier, setSupplier] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [tglProduksi, setTglProduksi] = useState('');
  const [tglPengiriman, setTglPengiriman] = useState('');
  const [jumlahQty, setJumlahQty] = useState('');
  const [satuanQty, setSatuanQty] = useState<'pcs' | 'pack'>('pcs');
  const [detailLines, setDetailLines] = useState<string[]>(['']);
  const [generated, setGenerated] = useState('');

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        try {
          const d = JSON.parse(r.data);
          setCabang(d.cabang || ''); setSupplier(d.supplier || '');
          setNamaBarang(d.namaBarang || ''); setTglProduksi(d.tglProduksi || '');
          setTglPengiriman(d.tglPengiriman || ''); setJumlahQty(d.jumlahQty || '');
          setSatuanQty(d.satuanQty || 'pcs'); setDetailLines(d.detailLines || ['']);
          setGenerated(r.generated_text);
        } catch {}
      }
    }
  }, [editId]);

  const addLine = () => setDetailLines([...detailLines, '']);
  const removeLine = (i: number) => {
    const n = [...detailLines]; n.splice(i, 1);
    setDetailLines(n.length ? n : ['']);
  };
  const updateLine = (i: number, v: string) => {
    const n = [...detailLines]; n[i] = v; setDetailLines(n);
  };

  const generate = () => {
    const tglProdFormatted = tglProduksi ? fmtDate(new Date(tglProduksi).toISOString()) : '-';
    const tglKirimFormatted = tglPengiriman ? fmtDate(new Date(tglPengiriman).toISOString()) : '-';
    const detailText = detailLines.filter(l => l.trim()).map(l => `  • ${l}`).join('\n') || '  • -';
    const text = `*_FORM RETURN_*\n\n🏪 Cabang Resto : ${cabang || '-'}\n🚚 Supplier : ${supplier || '-'}\n📦 Nama Barang : ${namaBarang || '-'}\n📅 Tgl Produksi : ${tglProdFormatted}\n🚛 Tgl Pengiriman : ${tglKirimFormatted}\n🔢 Jumlah Qty : ${jumlahQty || '-'} ${satuanQty}\n📝 Detail/Komplain :\n${detailText}\n${reportFooter()}`;
    setGenerated(text);
  };

  const doCopy = async () => {
    if (!generated) return;
    const ok = await copyText(generated);
    showToast(ok ? 'Copied! Paste to WhatsApp 📋' : 'Copy failed', ok ? 'success' : 'error');
  };

  const doSave = () => {
    if (!generated) { showToast('Generate report dulu!', 'error'); return; }
    const id = editId || genId();
    const data = JSON.stringify({ cabang, supplier, namaBarang, tglProduksi, tglPengiriman, jumlahQty, satuanQty, detailLines });
    saveReport({ id, type: 'return_barang', shift: '-', data, generated_text: generated, created_at: editId ? '' : nowISO() });
    showToast(editId ? 'Updated! ✏️' : 'Saved! 💾');
  };

  return (
    <div style={{ padding: '0 16px 24px' }}>
      <PageHeader title="Form Return Barang" subtitle="Return ke Supplier" onBack={onBack} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
        <div><label className="input-label">🏪 Cabang Resto</label>
          <input className="cyber-input" value={cabang} onChange={e => setCabang(e.target.value)} placeholder="Nama cabang..." /></div>
        <div><label className="input-label">🚚 Supplier</label>
          <input className="cyber-input" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nama supplier..." /></div>
        <div><label className="input-label">📦 Nama Barang</label>
          <input className="cyber-input" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} placeholder="Nama barang..." /></div>
        <div><label className="input-label">📅 Tgl Produksi</label>
          <input className="cyber-input" type="date" value={tglProduksi} onChange={e => setTglProduksi(e.target.value)} /></div>
        <div><label className="input-label">🚛 Tgl Pengiriman</label>
          <input className="cyber-input" type="date" value={tglPengiriman} onChange={e => setTglPengiriman(e.target.value)} /></div>
        <div><label className="input-label">🔢 Jumlah Qty</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="cyber-input" type="number" inputMode="numeric" value={jumlahQty} onChange={e => setJumlahQty(e.target.value)} placeholder="0" style={{ flex: 1 }} />
            <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,247,255,0.15)' }}>
              {(['pcs', 'pack'] as const).map(s => (
                <button key={s} onClick={() => setSatuanQty(s)} style={{
                  padding: '8px 14px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: satuanQty === s ? 'rgba(0,247,255,0.15)' : 'rgba(255,255,255,0.03)',
                  color: satuanQty === s ? '#00f7ff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
                }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div><label className="input-label">📝 Detail / Komplain</label>
          {detailLines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <input className="cyber-input" value={line} onChange={e => updateLine(i, e.target.value)} placeholder={`Detail ${i + 1}...`} style={{ flex: 1 }} />
              {detailLines.length > 1 && (
                <button onClick={() => removeLine(i)} style={{
                  background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)',
                  borderRadius: 8, padding: 6, cursor: 'pointer', color: '#ff5555', flexShrink: 0, display: 'flex', alignItems: 'center',
                }}><Trash2 size={16} /></button>
              )}
            </div>
          ))}
          <button onClick={addLine} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600,
            borderRadius: 8, border: '1px dashed rgba(0,247,255,0.2)', background: 'rgba(0,247,255,0.04)',
            color: '#00f7ff', cursor: 'pointer', width: '100%', justifyContent: 'center',
          }}><Plus size={14} /> Tambah Detail</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <button className="cyber-btn" onClick={generate}><PackageX size={16} /> Generate Report</button>
        {generated && (
          <>
            <div style={{
              background: 'rgba(0,247,255,0.04)', border: '1px solid rgba(0,247,255,0.12)',
              borderRadius: 12, padding: 14, fontSize: 12, whiteSpace: 'pre-wrap',
              color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace', lineHeight: 1.6, maxHeight: 240, overflowY: 'auto',
            }}>{generated}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="cyber-btn" onClick={doCopy} style={{ background: 'rgba(0,247,255,0.12)' }}><Copy size={16} /> Copy WA</button>
              <button className="cyber-btn" onClick={doSave} style={{ background: 'rgba(255,43,214,0.12)' }}><Save size={16} /> Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
