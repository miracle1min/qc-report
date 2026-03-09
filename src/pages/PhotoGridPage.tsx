import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, Trash2, Download, X, GripVertical, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { ToastMsg } from '../types';

interface Props {
  onBack: () => void;
  showToast: (msg: string, type?: ToastMsg['type']) => void;
}

interface PhotoItem {
  id: string;
  file: File;
  url: string;
}

const GRID_COLS = 3;
const CELL_SIZE = 400; // px per cell on canvas
const GAP = 8; // gap between cells on canvas
const BG_COLOR = '#0a0a0f';
const BORDER_COLOR = 'rgba(0,247,255,0.15)';

export const PhotoGridPage: React.FC<Props> = ({ onBack, showToast }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<string | null>(null);

  const addPhotos = useCallback((files: FileList | File[]) => {
    const newPhotos: PhotoItem[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      newPhotos.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      });
    });
    if (newPhotos.length === 0) {
      showToast('Pilih file gambar (JPG/PNG)', 'error');
      return;
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    showToast(`${newPhotos.length} foto ditambahkan`, 'success');
  }, [showToast]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    showToast('Semua foto dihapus', 'info');
  }, [photos, showToast]);

  // Drag & drop reorder
  const handleDragStart = (id: string) => {
    dragItem.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragItem.current && dragItem.current !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!dragItem.current || dragItem.current === targetId) return;
    setPhotos((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((x) => x.id === dragItem.current);
      const toIdx = arr.findIndex((x) => x.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    dragItem.current = null;
  };

  // File drop zone
  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      addPhotos(e.dataTransfer.files);
    }
  };

  // Download grid as image
  const downloadGrid = useCallback(async () => {
    if (photos.length === 0) return;
    setDownloading(true);

    try {
      const rows = Math.ceil(photos.length / GRID_COLS);
      const padding = GAP * 2;
      const canvasW = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * GAP + padding * 2;
      const canvasH = rows * CELL_SIZE + (rows - 1) * GAP + padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Load all images
      const loadImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });

      const images = await Promise.all(photos.map((p) => loadImage(p.url)));

      // Draw each image in grid
      images.forEach((img, i) => {
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);
        const x = padding + col * (CELL_SIZE + GAP);
        const y = padding + row * (CELL_SIZE + GAP);

        // Cell background
        ctx.fillStyle = '#12121a';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Draw image (cover fit)
        const scale = Math.max(CELL_SIZE / img.width, CELL_SIZE / img.height);
        const sw = CELL_SIZE / scale;
        const sh = CELL_SIZE / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh, x, y, CELL_SIZE, CELL_SIZE);
        ctx.restore();

        // Border
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      });

      // Download
      const link = document.createElement('a');
      link.download = `photo-grid-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Grid berhasil di-download! 📸', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal generate grid', 'error');
    } finally {
      setDownloading(false);
    }
  }, [photos, showToast]);

  return (
    <div style={{ padding: '16px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
            📸 Photo Grid
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            Upload → Grid 3 Kolom → Download
          </p>
        </div>
        {photos.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              background: 'rgba(255,50,50,0.1)',
              border: '1px solid rgba(255,50,50,0.2)',
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'rgba(255,100,100,0.8)',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropZone}
        style={{
          border: '2px dashed rgba(0,247,255,0.25)',
          borderRadius: 16,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(0,247,255,0.03)',
          marginBottom: 20,
          transition: 'all 0.2s ease',
        }}
      >
        <Upload size={28} style={{ color: 'rgba(0,247,255,0.5)', marginBottom: 8 }} />
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          Tap untuk pilih foto
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          atau drag & drop ke sini • JPG, PNG
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) addPhotos(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Photo count */}
      {photos.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            {photos.length} foto • {Math.ceil(photos.length / GRID_COLS)} baris
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            hold & drag untuk reorder
          </span>
        </div>
      )}

      {/* Grid Preview */}
      {photos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            marginBottom: 20,
          }}
        >
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(photo.id)}
              onDragOver={(e) => handleDragOver(e, photo.id)}
              onDrop={(e) => handleDrop(e, photo.id)}
              onDragEnd={() => setDragOverId(null)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 10,
                overflow: 'hidden',
                border: dragOverId === photo.id
                  ? '2px solid rgba(0,247,255,0.6)'
                  : '1px solid rgba(255,255,255,0.08)',
                cursor: 'grab',
                transition: 'border 0.15s ease',
              }}
            >
              <img
                src={photo.url}
                alt={`Photo ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Index badge */}
              <div style={{
                position: 'absolute',
                top: 4,
                left: 4,
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 6,
                padding: '2px 6px',
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(0,247,255,0.8)',
                backdropFilter: 'blur(4px)',
              }}>
                {idx + 1}
              </div>
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(photo.id);
                }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(255,30,30,0.7)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'rgba(255,255,255,0.2)',
        }}>
          <ImageIcon size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
            Belum ada foto
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 11 }}>
            Upload foto untuk mulai bikin grid
          </p>
        </div>
      )}

      {/* Download Button */}
      {photos.length > 0 && (
        <button
          onClick={downloadGrid}
          disabled={downloading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: downloading
              ? 'rgba(0,247,255,0.15)'
              : 'linear-gradient(135deg, rgba(0,247,255,0.2) 0%, rgba(255,43,214,0.2) 100%)',
            color: downloading ? 'rgba(0,247,255,0.5)' : 'rgba(0,247,255,0.9)',
            fontSize: 14,
            fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: downloading ? 'none' : '0 0 20px rgba(0,247,255,0.1)',
            transition: 'all 0.2s ease',
          }}
        >
          {downloading ? (
            <>⏳ Generating...</>
          ) : (
            <>
              <Download size={18} />
              Download Grid ({photos.length} foto)
            </>
          )}
        </button>
      )}
    </div>
  );
};
