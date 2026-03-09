// Pure JSON localStorage storage — no database, no SQL, no external deps

const KEYS = {
  reports: 'qc_reports',
  notes: 'qc_notes',
  settings: 'qc_settings',
};

// ── Reports ──────────────────────────────────────────────────
export interface ReportRecord {
  id: string;
  type: string;
  shift: string;
  data: string;
  generated_text: string;
  created_at: string;
}

function loadReports(): ReportRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.reports) || '[]');
  } catch { return []; }
}

function saveReportsArr(arr: ReportRecord[]) {
  localStorage.setItem(KEYS.reports, JSON.stringify(arr));
}

export function getAllReports(): ReportRecord[] {
  return loadReports().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getReportById(id: string): ReportRecord | undefined {
  return loadReports().find(r => r.id === id);
}

export function saveReport(report: ReportRecord) {
  const arr = loadReports();
  const idx = arr.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    // Update — preserve original created_at
    arr[idx] = { ...report, created_at: arr[idx].created_at };
  } else {
    arr.push(report);
  }
  saveReportsArr(arr);
}

export function deleteReport(id: string) {
  saveReportsArr(loadReports().filter(r => r.id !== id));
}

export function queryReports(opts: { type?: string; shift?: string; search?: string }): ReportRecord[] {
  let arr = loadReports();
  if (opts.type && opts.type !== 'all') arr = arr.filter(r => r.type === opts.type);
  if (opts.shift && opts.shift !== 'all') arr = arr.filter(r => r.shift === opts.shift);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    arr = arr.filter(r => r.generated_text.toLowerCase().includes(q));
  }
  return arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ── Notes ────────────────────────────────────────────────────
export interface NoteRecord {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function loadNotes(): NoteRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.notes) || '[]');
  } catch { return []; }
}

function saveNotesArr(arr: NoteRecord[]) {
  localStorage.setItem(KEYS.notes, JSON.stringify(arr));
}

export function getAllNotes(): NoteRecord[] {
  return loadNotes().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function saveNote(note: NoteRecord) {
  const arr = loadNotes();
  const idx = arr.findIndex(n => n.id === note.id);
  if (idx >= 0) arr[idx] = note;
  else arr.push(note);
  saveNotesArr(arr);
}

export function deleteNote(id: string) {
  saveNotesArr(loadNotes().filter(n => n.id !== id));
}

// ── Settings ─────────────────────────────────────────────────
function loadSettings(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.settings) || '{}');
  } catch { return {}; }
}

export function getSetting(key: string): string {
  return loadSettings()[key] || '';
}

export function setSetting(key: string, value: string) {
  const s = loadSettings();
  s[key] = value;
  localStorage.setItem(KEYS.settings, JSON.stringify(s));
}

export const saveSetting = setSetting;

// ── Init (no-op, kept for API compat) ────────────────────────
export function initDB(): void {
  // Ensure keys exist
  if (!localStorage.getItem(KEYS.reports)) localStorage.setItem(KEYS.reports, '[]');
  if (!localStorage.getItem(KEYS.notes)) localStorage.setItem(KEYS.notes, '[]');
  if (!localStorage.getItem(KEYS.settings)) localStorage.setItem(KEYS.settings, '{}');
}

// ── Export / Import ──────────────────────────────────────────
export function exportAllData(): object {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    reports: loadReports(),
    notes: loadNotes(),
    settings: loadSettings(),
  };
}

export function importAllData(data: any) {
  if (data.reports && Array.isArray(data.reports)) {
    const existing = loadReports();
    for (const r of data.reports) {
      const idx = existing.findIndex(e => e.id === r.id);
      if (idx >= 0) existing[idx] = r;
      else existing.push(r);
    }
    saveReportsArr(existing);
  }
  if (data.notes && Array.isArray(data.notes)) {
    const existing = loadNotes();
    for (const n of data.notes) {
      const idx = existing.findIndex(e => e.id === n.id);
      if (idx >= 0) existing[idx] = n;
      else existing.push(n);
    }
    saveNotesArr(existing);
  }
  if (data.settings) {
    const s = loadSettings();
    if (Array.isArray(data.settings)) {
      // Handle old SQL format [{key, value}]
      for (const item of data.settings) s[item.key] = item.value;
    } else {
      Object.assign(s, data.settings);
    }
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
  }
}

export function clearAllData() {
  localStorage.setItem(KEYS.reports, '[]');
  localStorage.setItem(KEYS.notes, '[]');
  // Keep settings
}
