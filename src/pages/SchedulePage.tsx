import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, WifiOff, Calendar, Clock, User, ChevronDown, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ToastMsg } from '../types';
import { getSetting, saveSetting } from '../utils/db';

interface Props {
  showToast: (msg: string, type?: ToastMsg['type']) => void;
}

interface CrewSchedule {
  role: string;
  nama: string;
  shifts: Record<string, string>;
}

type CrewToday = CrewSchedule & { todayShift: string };

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const DEFAULT_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1AP4auWVSrecGaloDDlkZeur38StRVupBCw6_tqY9GpM/edit';

function generateSheetNames(): string[] {
  const now = new Date();
  const sheets: string[] = [];
  for (let offset = -12; offset <= 2; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const nextM = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const m1 = MONTHS[d.getMonth()];
    const m2 = MONTHS[nextM.getMonth()];
    const yr = nextM.getFullYear() % 100;
    sheets.push(`${m1} - ${m2} ${yr}`);
  }
  return sheets;
}

function getCurrentSheet(): string {
  const now = new Date();
  const day = now.getDate();
  let startMonth: Date;
  if (day >= 21) {
    startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
  const endMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 1);
  const m1 = MONTHS[startMonth.getMonth()];
  const m2 = MONTHS[endMonth.getMonth()];
  const yr = endMonth.getFullYear() % 100;
  return `${m1} - ${m2} ${yr}`;
}

// Map jam masuk (start hour) to display info
const SHIFT_COLORS: Record<string, { label: string; color: string; emoji: string }> = {
  '6':  { label: '06:00', color: '#00f7ff', emoji: '🌅' },
  '8':  { label: '08:00', color: '#4ade80', emoji: '🌤️' },
  '9':  { label: '09:00', color: '#4ade80', emoji: '🌤️' },
  '10': { label: '10:00', color: '#34d399', emoji: '☀️' },
  '11': { label: '11:00', color: '#facc15', emoji: '☀️' },
  '12': { label: '12:00', color: '#facc15', emoji: '🌞' },
  '13': { label: '13:00', color: '#fb923c', emoji: '🔥' },
  '14': { label: '14:00', color: '#fb923c', emoji: '🔥' },
  '15': { label: '15:00', color: '#f87171', emoji: '🌇' },
  '16': { label: '16:00', color: '#ff2bd6', emoji: '🌇' },
  '17': { label: '17:00', color: '#ff2bd6', emoji: '🌆' },
  '18': { label: '18:00', color: '#a855f7', emoji: '🌙' },
  '20': { label: '20:00', color: '#8b5cf6', emoji: '🌙' },
  '22': { label: '22:00', color: '#6366f1', emoji: '🌑' },
};

function getShiftInfo(val: string): { label: string; color: string; emoji: string } {
  const trimmed = val.trim();
  if (!trimmed || trimmed === '-') return { label: 'OFF', color: '#555', emoji: '😴' };
  if (trimmed.toUpperCase() === 'OFF') return { label: 'OFF', color: '#555', emoji: '😴' };
  // Handle numeric values
  const num = trimmed.replace(/[^0-9]/g, '');
  if (SHIFT_COLORS[num]) return SHIFT_COLORS[num];
  // Fallback: try to show as time
  if (/^\d{1,2}$/.test(num)) return { label: `${num.padStart(2,'0')}:00`, color: '#888', emoji: '⏰' };
  return { label: trimmed, color: '#888', emoji: '⏰' };
}

// Sort crew by shift time for today view
function sortByShift(a: CrewToday, b: CrewToday): number {
  const numA = parseInt(a.todayShift) || 99;
  const numB = parseInt(b.todayShift) || 99;
  return numA - numB;
}

export const SchedulePage: React.FC<Props> = ({ showToast }) => {
  const [crew, setCrew] = useState<CrewSchedule[]>([]);
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'full'>('today');
  const [sheetNames] = useState<string[]>(generateSheetNames);
  const [selectedSheet, setSelectedSheet] = useState<string>(getCurrentSheet);
  const [showSheetPicker, setShowSheetPicker] = useState(false);
  const [customSheetName, setCustomSheetName] = useState('');

  const today = useMemo(() => new Date().getDate().toString(), []);

  const extractSpreadsheetId = (rawUrl: string): string | null => {
    const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const buildFetchUrl = useCallback((rawUrl: string, sheet: string): string | null => {
    const id = extractSpreadsheetId(rawUrl);
    if (!id) return null;
    const encodedSheet = encodeURIComponent(sheet);
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
  }, []);

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  function processScheduleData(rows: string[][]) {
    if (rows.length < 2) { setError('Data tidak cukup di sheet ini'); return; }

    // Find header row - look for CKRBUL or JABATAN
    let headerIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowUpper = rows[i].map(c => c.toUpperCase());
      if (rowUpper.some(c => c.includes('CKRBUL') || c.includes('JABATAN'))) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx < 0) { setError('Header CKRBUL/JABATAN tidak ditemukan'); return; }

    const header = rows[headerIdx];

    // Find role column (CKRBUL or JABATAN)
    let roleColIdx = 0;
    let nameColIdx = 1;
    for (let c = 0; c < header.length; c++) {
      const val = header[c].toUpperCase();
      if (val.includes('CKRBUL') || val.includes('JABATAN')) roleColIdx = c;
      if (val.includes('NAMA')) nameColIdx = c;
    }

    // Find date columns (numeric headers: 1-31)
    const dateCols: { idx: number; date: string }[] = [];
    for (let c = 0; c < header.length; c++) {
      const val = header[c].trim().replace(/^"|"$/g, '');
      if (/^\d{1,2}$/.test(val) && parseInt(val) >= 1 && parseInt(val) <= 31) {
        dateCols.push({ idx: c, date: val });
      }
    }
    if (dateCols.length === 0) { setError('Kolom tanggal tidak ditemukan'); return; }
    setDateColumns(dateCols.map(d => d.date));

    // Parse crew data rows (start right after header)
    const crewList: CrewSchedule[] = [];
    let lastRole = '';
    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 3) continue;

      const roleVal = row[roleColIdx]?.trim() || '';
      const nama = row[nameColIdx]?.trim() || '';
      if (!nama) continue;

      // Skip if this looks like another header or day-name row
      if (nama.toUpperCase() === 'NAMA') continue;

      const role = roleVal || lastRole;
      if (roleVal) lastRole = roleVal;

      const shifts: Record<string, string> = {};
      dateCols.forEach(dc => {
        const val = row[dc.idx]?.trim().replace(/^"|"$/g, '') || '';
        shifts[dc.date] = val;
      });
      crewList.push({ role, nama, shifts });
    }
    setCrew(crewList);
    if (crewList.length === 0) setError('Tidak ada data crew ditemukan');
  }

  const fetchSchedule = useCallback(async (sheetOverride?: string) => {
    const sheetName = sheetOverride || selectedSheet;
    const activeUrl = url || DEFAULT_SPREADSHEET_URL;
    const fetchUrl = buildFetchUrl(activeUrl, sheetName);
    if (!fetchUrl) { setError('URL Spreadsheet tidak valid'); return; }

    setLoading(true);
    setError('');
    setCrew([]);
    try {
      const resp = await fetch(fetchUrl);
      const text = await resp.text();
      if (text && text.includes(',')) {
        const csvRows = text.split('\n')
          .filter((l: string) => l.trim())
          .map((l: string) => parseCSVLine(l));
        processScheduleData(csvRows);
      } else {
        setError(`Sheet "${sheetName}" tidak ditemukan atau kosong.`);
      }
    } catch {
      setError('Gagal mengambil data. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  }, [url, selectedSheet, buildFetchUrl]);

  useEffect(() => {
    const savedUrl = getSetting('scheduleUrl');
    if (savedUrl) setUrl(savedUrl);
    const savedSheet = getSetting('selectedSheet');
    if (savedSheet) setSelectedSheet(savedSheet);
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [url, selectedSheet]);

  const handleSheetSelect = (sheet: string) => {
    setSelectedSheet(sheet);
    setShowSheetPicker(false);
    saveSetting('selectedSheet', sheet);
  };

  const todaySchedule = useMemo((): CrewToday[] => {
    return crew
      .map(c => ({ ...c, todayShift: c.shifts[today] || '' }))
      .filter(c => c.todayShift !== '' && c.todayShift.toUpperCase() !== 'OFF')
      .sort(sortByShift);
  }, [crew, today]);

  const offToday = useMemo((): CrewSchedule[] => {
    return crew.filter(c => {
      const val = c.shifts[today] || '';
      return !val || val.toUpperCase() === 'OFF';
    });
  }, [crew, today]);

  const groupedToday = useMemo((): Record<string, CrewToday[]> => {
    const groups: Record<string, CrewToday[]> = {};
    todaySchedule.forEach(c => {
      const key = c.role || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [todaySchedule]);

  const todayDate = useMemo(() => {
    const d = new Date();
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    return `${days[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  return (
    <div style={{ paddingBottom: 20 }}>
      <PageHeader title="Schedule" subtitle="Jadwal Crew" icon={<Calendar size={20} />} />

      {/* Sheet Selector */}
      <div style={{ marginBottom: 16 }}>
        <div onClick={() => setShowSheetPicker(!showSheetPicker)} className="glass-card" style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0, 247, 255, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--cyber-neon)' }} />
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Sheet Aktif</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyber-neon)' }}>📋 {selectedSheet}</div>
            </div>
          </div>
          <ChevronDown size={18} style={{ color: '#888', transform: showSheetPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>

        {showSheetPicker && (
          <div className="glass-card" style={{ marginTop: 4, padding: 8, maxHeight: 300, overflowY: 'auto', border: '1px solid rgba(0, 247, 255, 0.2)' }}>
            <div style={{ padding: '8px', marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Custom Sheet Name:</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" placeholder="Masukkan nama sheet..." value={customSheetName} onChange={e => setCustomSheetName(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13 }} />
                <button onClick={() => { if (customSheetName.trim()) { handleSheetSelect(customSheetName.trim()); setCustomSheetName(''); } }} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--cyber-neon)', color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>GO</button>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            <div style={{ fontSize: 11, color: '#888', padding: '6px 8px 4px' }}>Periode Tersedia:</div>
            {sheetNames.map(name => {
              const isCurrent = name === getCurrentSheet();
              const isSelected = name === selectedSheet;
              return (
                <div key={name} onClick={() => handleSheetSelect(name)} style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: isSelected ? 'rgba(0, 247, 255, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}>
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 400, color: isSelected ? 'var(--cyber-neon)' : '#ccc' }}>{name}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isCurrent && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(0, 247, 255, 0.15)', color: 'var(--cyber-neon)', fontWeight: 600 }}>SEKARANG</span>}
                    {isSelected && <span style={{ color: 'var(--cyber-neon)', fontSize: 14 }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Mode Toggle + Refresh */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setViewMode('today')} className={`btn-neon ${viewMode === 'today' ? '' : 'btn-outline'}`} style={{ flex: 1, padding: '10px 0', fontSize: 13, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Clock size={14} /> Hari Ini
        </button>
        <button onClick={() => setViewMode('full')} className={`btn-neon ${viewMode === 'full' ? '' : 'btn-outline'}`} style={{ flex: 1, padding: '10px 0', fontSize: 13, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Calendar size={14} /> Full Table
        </button>
        <button onClick={() => fetchSchedule()} disabled={loading} className="btn-outline" style={{ padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card" style={{ padding: 30, textAlign: 'center' }}>
          <RefreshCw size={28} className="spin" style={{ color: 'var(--cyber-neon)', marginBottom: 8 }} />
          <p style={{ color: '#888', fontSize: 13 }}>Memuat jadwal...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-card" style={{ padding: 20, textAlign: 'center', borderColor: 'rgba(255,43,214,0.3)' }}>
          <WifiOff size={24} style={{ color: 'var(--cyber-accent)', marginBottom: 8 }} />
          <p style={{ color: 'var(--cyber-accent)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* ===== TODAY VIEW ===== */}
      {crew.length > 0 && viewMode === 'today' && (
        <div>
          {/* Date badge */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, fontSize: 13, background: 'rgba(0, 247, 255, 0.1)', color: 'var(--cyber-neon)', border: '1px solid rgba(0, 247, 255, 0.2)', fontWeight: 600 }}>
              <Clock size={14} /> {todayDate}
            </span>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div className="glass-card" style={{ flex: 1, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyber-neon)' }}>{todaySchedule.length}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>MASUK</div>
            </div>
            <div className="glass-card" style={{ flex: 1, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#555' }}>{offToday.length}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>OFF</div>
            </div>
            <div className="glass-card" style={{ flex: 1, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyber-accent)' }}>{crew.length}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>TOTAL</div>
            </div>
          </div>

          {/* No one scheduled */}
          {Object.keys(groupedToday).length === 0 && (
            <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              <p className="muted-text">Tidak ada crew yang dijadwalkan hari ini</p>
            </div>
          )}

          {/* Grouped by role */}
          {(Object.entries(groupedToday) as [string, CrewToday[]][]).map(([role, members]) => (
            <div key={role} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 4 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: role === 'QC' ? 'var(--cyber-neon)' : 'var(--cyber-accent)', textTransform: 'uppercase', margin: 0 }}>{role}</h3>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#888' }}>{members.length} orang</span>
              </div>
              {members.map((m, i) => {
                const info = getShiftInfo(m.todayShift);
                return (
                  <div key={i} className="glass-card" style={{ padding: '12px 16px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <User size={16} style={{ color: '#888' }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{m.nama}</span>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: info.color, background: `${info.color}20`, border: `1px solid ${info.color}40`, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {info.emoji} {info.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* OFF crew */}
          {offToday.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>😴 OFF HARI INI</h3>
              <div className="glass-card" style={{ padding: '10px 16px' }}>
                {offToday.map((m, i) => (
                  <div key={i} style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: i < offToday.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 9, color: '#555', fontWeight: 700, minWidth: 55 }}>{m.role}</span>
                    <span style={{ fontSize: 13, color: '#666' }}>{m.nama}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FULL TABLE VIEW ===== */}
      {crew.length > 0 && viewMode === 'full' && (
        <div style={{ overflowX: 'auto', borderRadius: 12, WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 700, fontSize: 10, borderBottom: '2px solid rgba(0, 247, 255, 0.3)', position: 'sticky', left: 0, zIndex: 2, background: '#0a0a0f', minWidth: 110 }}>CREW</th>
                {dateColumns.map(d => {
                  const isToday = d === today;
                  return (
                    <th key={d} style={{ padding: '8px 2px', textAlign: 'center', fontWeight: 700, fontSize: 11, borderBottom: '2px solid rgba(0, 247, 255, 0.3)', background: isToday ? 'rgba(0, 247, 255, 0.2)' : 'rgba(255,255,255,0.02)', color: isToday ? 'var(--cyber-neon)' : '#888', minWidth: 34 }}>
                      {isToday ? <span style={{ display: 'block', fontSize: 7, color: 'var(--cyber-neon)', marginBottom: 1 }}>TODAY</span> : null}
                      {d}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {crew.map((c, i) => {
                // Add role separator
                const prevRole = i > 0 ? crew[i - 1].role : '';
                const showRoleSep = c.role !== prevRole;
                return (
                  <React.Fragment key={i}>
                    {showRoleSep && (
                      <tr>
                        <td colSpan={dateColumns.length + 1} style={{ padding: '8px 4px 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: c.role === 'QC' ? 'var(--cyber-neon)' : 'var(--cyber-accent)', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}>
                          {c.role}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '7px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11, position: 'sticky', left: 0, zIndex: 1, background: '#0a0a0f', fontWeight: 500, borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                        {c.nama}
                      </td>
                      {dateColumns.map(d => {
                        const val = c.shifts[d] || '';
                        const info = getShiftInfo(val);
                        const isToday = d === today;
                        const isEmpty = !val || val.toUpperCase() === 'OFF';
                        return (
                          <td key={d} style={{
                            padding: '6px 2px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            fontSize: 11,
                            textAlign: 'center',
                            background: isToday ? 'rgba(0, 247, 255, 0.06)' : 'transparent',
                            color: isEmpty ? '#333' : info.color,
                            fontWeight: isEmpty ? 400 : 700,
                          }}>
                            {val || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Shift Legend */}
      {crew.length > 0 && (
        <div className="glass-card" style={{ marginTop: 16, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 8 }}>KETERANGAN JAM MASUK</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(SHIFT_COLORS).map(([key, info]) => (
              <span key={key} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 8, background: `${info.color}15`, color: info.color, border: `1px solid ${info.color}30`, fontWeight: 600 }}>
                {info.emoji} {key} = {info.label}
              </span>
            ))}
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 8, background: 'rgba(85,85,85,0.15)', color: '#555', border: '1px solid rgba(85,85,85,0.3)', fontWeight: 600 }}>
              😴 Kosong = OFF
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
