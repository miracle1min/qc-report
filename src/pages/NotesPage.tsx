import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Check, X, StickyNote } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Note, ToastMsg } from '../types';
import { genId, nowISO, fmtDateTime } from '../utils/helpers';
import { getAllNotes, saveNote as dbSaveNote, deleteNote as dbDeleteNote } from '../utils/db';

interface Props {
  showToast: (msg: string, type?: ToastMsg['type']) => void;
}

export const NotesPage: React.FC<Props> = ({ showToast }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadNotes = useCallback(() => {
    setNotes(getAllNotes() as Note[]);
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const addNote = () => {
    if (!newContent.trim()) { showToast('Write something first', 'error'); return; }
    const id = genId();
    const now = nowISO();
    const note = { id, content: newContent.trim(), created_at: now, updated_at: now };
    dbSaveNote(note);
    setNotes(prev => [note, ...prev]);
    setNewContent('');
    setShowAdd(false);
    showToast('Note added ✓', 'success');
  };

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return;
    const now = nowISO();
    const existing = notes.find(n => n.id === id);
    if (!existing) return;
    const updated = { ...existing, content: editContent.trim(), updated_at: now };
    dbSaveNote(updated);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
    setEditingId(null);
    showToast('Note updated ✓', 'success');
  };

  const handleDeleteNote = (id: string) => {
    dbDeleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    setDeletingId(null);
    showToast('Note deleted', 'info');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Notes"
        subtitle="Personal Notes"
        rightAction={
          <button className="btn-neon btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} /> New
          </button>
        }
      />

      <div style={{ padding: '8px 16px 24px' }}>
        {showAdd && (
          <div className="glass-card" style={{ padding: 16, marginBottom: 14 }}>
            <textarea
              className="cyber-input"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn-solid-neon btn-sm" onClick={addNote} style={{ flex: 1 }}>
                <Check size={16} /> Save
              </button>
              <button className="btn-neon btn-sm" onClick={() => { setShowAdd(false); setNewContent(''); }} style={{ flex: 1 }}>
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !showAdd && (
          <div className="empty-state">
            <StickyNote size={40} className="muted-text" />
            <p>No notes yet</p>
            <p style={{ fontSize: 12 }}>Tap + New to add one</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map((note) => (
            <div key={note.id} className="item-card">
              {editingId === note.id ? (
                <>
                  <textarea className="cyber-input" value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} autoFocus />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn-solid-neon btn-sm" onClick={() => saveEdit(note.id)} style={{ flex: 1 }}>
                      <Check size={14} /> Save
                    </button>
                    <button className="btn-neon btn-sm" onClick={() => setEditingId(null)} style={{ flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="muted-text" style={{ fontSize: 11 }}>
                      {fmtDateTime(note.updated_at)}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-neon btn-sm" style={{ padding: '5px 10px' }} onClick={() => { setEditingId(note.id); setEditContent(note.content); }}>
                        <Edit3 size={14} />
                      </button>
                      {deletingId === note.id ? (
                        <button className="btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => handleDeleteNote(note.id)}>
                          Confirm?
                        </button>
                      ) : (
                        <button className="btn-danger btn-sm" style={{ padding: '5px 10px', width: 'auto' }} onClick={() => setDeletingId(note.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
