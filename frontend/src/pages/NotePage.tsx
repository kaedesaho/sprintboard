import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Note, NoteType } from "../types/note";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ui/ConfirmModal";
import "./NotePage.css";

const NOTE_TYPES: NoteType[] = ['meeting', 'retrospective', 'personal', 'task-related', 'documentation'];

interface Member {
  id: number;
  username: string;
}

const NotePage = () => {
  const { projectID, noteId } = useParams();
  const { userID } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectRole, setProjectRole] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    note_type: '' as NoteType | '',
    sprint_num: '',
    planned_time: '',
    place: '',
    leader_id: '',
    note_taker_id: '',
    content: '',
    is_shared: false,
  });
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!noteId || !projectID || !userID) return;

    const fetchAll = async () => {
      try {
        const [noteRes, projectRes, membersRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/notes/${projectID}/${noteId}`),
          fetch(`http://127.0.0.1:5000/api/projects/${projectID}?user_id=${userID}`),
          fetch(`http://127.0.0.1:5000/api/tasks/users?project_id=${projectID}`)
        ]);

        const noteData: Note = await noteRes.json();
        const projectData = await projectRes.json();
        const membersData = await membersRes.json();

        setNote(noteData);
        setProjectRole(projectData.role ?? null);
        setMembers(membersData);
        setEditForm({
          title: noteData.title,
          note_type: noteData.note_type,
          sprint_num: noteData.sprint_num != null ? String(noteData.sprint_num) : '',
          planned_time: noteData.planned_time ? noteData.planned_time.slice(0, 16) : '',
          place: noteData.place ?? '',
          leader_id: noteData.leader_id != null ? String(noteData.leader_id) : '',
          note_taker_id: noteData.note_taker_id != null ? String(noteData.note_taker_id) : '',
          content: noteData.content,
          is_shared: noteData.is_shared,
        });
      } catch (err) {
        console.error("Failed to fetch note", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [noteId, projectID, userID]);

  const canEdit = note
    ? userID === note.creator_id || userID === note.leader_id || projectRole === 'Admin'
    : false;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/notes/${projectID}/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          note_type: editForm.note_type || null,
          sprint_num: editForm.sprint_num ? Number(editForm.sprint_num) : null,
          planned_time: editForm.planned_time || null,
          place: editForm.place || null,
          leader_id: editForm.leader_id ? Number(editForm.leader_id) : null,
          note_taker_id: editForm.note_taker_id ? Number(editForm.note_taker_id) : null,
          content: editForm.content,
          is_shared: editForm.is_shared,
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      const updated: Note = await res.json();
      setNote(updated);
      setEditing(false);
    } catch (err) {
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/notes/${projectID}/${noteId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      navigate(`/projects/${projectID}/notes`);
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading) return <p>Loading note...</p>;
  if (!note) return <p>Note not found</p>;

  return (
    <div className="note-page">
      <div className="note-page-header">
        <button className="note-back-btn" onClick={() => navigate(`/projects/${projectID}/notes`)}>
          ← Back
        </button>
        <div className="note-page-header-left">
          <h1>
            {note.title}
            <span className="note-type-badge">{note.note_type}</span>
            {note.sprint_num != null && (
              <span className="note-sprint-badge">Sprint {note.sprint_num}</span>
            )}
          </h1>
          <div className="note-meta">
            <span><strong>Date:</strong> {new Date(note.created_at).toLocaleDateString()}</span>
            {note.planned_time && (
              <span><strong>Scheduled:</strong> {new Date(note.planned_time).toLocaleString()}</span>
            )}
            {note.place && <span><strong>Place:</strong> {note.place}</span>}
            <span><strong>Leader:</strong> {note.leader_name ?? "—"}</span>
            <span><strong>Note Taker:</strong> {note.note_taker_name ?? "—"}</span>
            <span className={`note-shared-badge ${note.is_shared ? 'shared' : 'private'}`}>
              {note.is_shared ? "Shared" : "Private"}
            </span>
          </div>
        </div>

        {canEdit && !editing && (
          <div className="note-page-actions">
            <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn-delete" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        )}
      </div>

      <hr className="note-separator" />

      {editing ? (
        <form className="note-edit-form" onSubmit={handleSave}>
          <div className="note-form-group">
            <label>Title <span className="required">*</span></label>
            <input
              type="text"
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="note-form-row">
            <div className="note-form-group">
              <label>Note Type <span className="required">*</span></label>
              <select
                value={editForm.note_type}
                onChange={e => setEditForm(f => ({ ...f, note_type: e.target.value as NoteType }))}
              >
                <option value="">— select —</option>
                {NOTE_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="note-form-group">
              <label>Sprint #</label>
              <input
                type="number"
                min={1}
                value={editForm.sprint_num}
                onChange={e => setEditForm(f => ({ ...f, sprint_num: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="note-form-row">
            <div className="note-form-group">
              <label>Planned Time</label>
              <input
                type="datetime-local"
                value={editForm.planned_time}
                onChange={e => setEditForm(f => ({ ...f, planned_time: e.target.value }))}
              />
            </div>
            <div className="note-form-group">
              <label>Place</label>
              <input
                type="text"
                value={editForm.place}
                onChange={e => setEditForm(f => ({ ...f, place: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="note-form-row">
            <div className="note-form-group">
              <label>Leader</label>
              <select
                value={editForm.leader_id}
                onChange={e => setEditForm(f => ({ ...f, leader_id: e.target.value }))}
              >
                <option value="">— none —</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.username}</option>
                ))}
              </select>
            </div>
            <div className="note-form-group">
              <label>Note Taker</label>
              <select
                value={editForm.note_taker_id}
                onChange={e => setEditForm(f => ({ ...f, note_taker_id: e.target.value }))}
              >
                <option value="">— none —</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.username}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="note-form-group">
            <label>Content <span className="required">*</span></label>
            <textarea
              rows={8}
              value={editForm.content}
              onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>

          <label className="note-form-checkbox">
            <input
              type="checkbox"
              checked={editForm.is_shared}
              onChange={e => setEditForm(f => ({ ...f, is_shared: e.target.checked }))}
            />
            Share with team
          </label>

          {saveError && <p className="note-form-error">{saveError}</p>}

          <div className="note-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => { setEditing(false); setSaveError(''); }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-confirm">Save Changes</button>
          </div>
        </form>
      ) : (
        <div className="note-content">
          <p>{note.content}</p>
        </div>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Note"
          message="Are you sure you want to delete this note?"
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default NotePage;
