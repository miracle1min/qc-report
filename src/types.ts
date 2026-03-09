export type Page = 'schedule' | 'notes' | 'menu' | 'history' | 'settings' | 'photo_grid';

export type FormType = 'sortir_bawang' | 'cabe_giling' | 'suhu_equipment' | 'tester_bahan' | 'return_barang' | 'suhu_datalogger';

export const FORM_LABELS: Record<FormType, string> = {
  sortir_bawang: 'Report Sortir Bawang Goreng',
  cabe_giling: 'Report Cabe Giling',
  suhu_equipment: 'Suhu All Equipments (°C)',
  tester_bahan: 'Tester Bahan & Produk Sisa Semalam',
  return_barang: 'Form Return Barang',
  suhu_datalogger: 'Suhu Data Logger (°C)',
};

export const SHIFT_OPTIONS = ['Opening', 'Middle', 'Closing', 'Midnight'] as const;

export interface Report {
  id: string;
  type: FormType;
  shift: string;
  data: string;
  generated_text: string;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ToastMsg {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface FormProps {
  onBack: () => void;
  showToast: (msg: string, type?: ToastMsg['type']) => void;
  editId: string | null;
}
