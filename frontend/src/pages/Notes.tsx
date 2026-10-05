import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Masonry from "react-masonry-css";
import { type Note, type NoteType } from '../types/note';
import NoteCard from "../components/NoteCard";
import { useAuth } from "../context/AuthContext";
import "./Notes.css";

const NOTE_TYPES: NoteType[] = ['meeting', 'retrospective', 'personal', 'task-related', 'documentation'];

interface Member {
    id: number;
    username: string;
}

const emptyForm = {
    title: '',
    note_type: '' as NoteType | '',
    sprint_num: '',
    planned_time: '',
    place: '',
    leader_id: '',
    note_taker_id: '',
    content: '',
    is_shared: false,
};

type Tab = 'my' | 'team';

const Notes = () => {
    const { projectID } = useParams();
    const { userID } = useAuth();

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);

    const [tab, setTab] = useState<Tab>('my');
    const [filterType, setFilterType] = useState<NoteType | ''>('');
    const [filterTitle, setFilterTitle] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!projectID || !userID) return;

        const fetchData = async () => {
            try {
                const [notesRes, membersRes] = await Promise.all([
                    fetch(`http://127.0.0.1:5000/api/notes/${projectID}`),
                    fetch(`http://127.0.0.1:5000/api/tasks/users?project_id=${projectID}`)
                ]);
                setNotes(await notesRes.json());
                setMembers(await membersRes.json());
            } catch (err) {
                console.error("Failed to fetch notes data", err);
                setError("Failed to load notes.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectID, userID]);

    const visibleNotes = notes
        .filter(note => {
            if (tab === 'my') return note.creator_id === userID;
            return note.is_shared;
        })
        .filter(note => !filterType || note.note_type === filterType)
        .filter(note => !filterTitle || note.title.toLowerCase().includes(filterTitle.toLowerCase()));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setFormError("Title is required."); return; }
        if (!form.note_type) { setFormError("Note type is required."); return; }
        if (!form.content.trim()) { setFormError("Content is required."); return; }
        setFormError('');

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/notes/${projectID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: userID,
                    title: form.title,
                    note_type: form.note_type,
                    sprint_num: form.sprint_num ? Number(form.sprint_num) : null,
                    planned_time: form.planned_time || null,
                    place: form.place || null,
                    leader_id: form.leader_id ? Number(form.leader_id) : null,
                    note_taker_id: form.note_taker_id ? Number(form.note_taker_id) : null,
                    content: form.content,
                    is_shared: form.is_shared,
                })
            });

            if (!res.ok) throw new Error('Failed to create note');
            const newNote: Note = await res.json();
            setNotes(prev => [newNote, ...prev]);
            setShowForm(false);
            setForm(emptyForm);
        } catch (err) {
            console.error(err);
            setFormError('Failed to create note. Please try again.');
        }
    };

    const breakpointColumnsObj = { default: 2, 768: 1 };

    if (loading) return <p>Loading notes...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="notes-page">
            <div className="notes-header">
                <button className="create-note-btn" onClick={() => setShowForm(true)}>
                    + New Note
                </button>
            </div>

            <div className="notes-tabs">
                <button
                    className={`notes-tab ${tab === 'my' ? 'active' : ''}`}
                    onClick={() => setTab('my')}
                >
                    My Notes
                </button>
                <button
                    className={`notes-tab ${tab === 'team' ? 'active' : ''}`}
                    onClick={() => setTab('team')}
                >
                    Team Notes
                </button>
            </div>

            <div className="notes-filters">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={filterTitle}
                    onChange={e => setFilterTitle(e.target.value)}
                />
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as NoteType | '')}
                >
                    <option value="">All types</option>
                    {NOTE_TYPES.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="notes-grid">
                {visibleNotes.length === 0 ? (
                    <p className="notes-empty">No notes found.</p>
                ) : (
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="project-cards-masonry"
                        columnClassName="project-cards-column"
                    >
                        {visibleNotes.map(note => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </Masonry>
                )}
            </div>

            {showForm && (
                <div className="note-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="note-modal" onClick={e => e.stopPropagation()}>
                        <h2>New Note</h2>
                        <form className="note-form" onSubmit={handleSubmit}>
                            <div className="note-form-group">
                                <label>Title <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Note title"
                                />
                            </div>

                            <div className="note-form-row">
                                <div className="note-form-group">
                                    <label>Note Type <span className="required">*</span></label>
                                    <select
                                        value={form.note_type}
                                        onChange={e => setForm(f => ({ ...f, note_type: e.target.value as NoteType }))}
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
                                        value={form.sprint_num}
                                        onChange={e => setForm(f => ({ ...f, sprint_num: e.target.value }))}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="note-form-row">
                                <div className="note-form-group">
                                    <label>Planned Time</label>
                                    <input
                                        type="datetime-local"
                                        value={form.planned_time}
                                        onChange={e => setForm(f => ({ ...f, planned_time: e.target.value }))}
                                    />
                                </div>
                                <div className="note-form-group">
                                    <label>Place</label>
                                    <input
                                        type="text"
                                        value={form.place}
                                        onChange={e => setForm(f => ({ ...f, place: e.target.value }))}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="note-form-row">
                                <div className="note-form-group">
                                    <label>Leader</label>
                                    <select
                                        value={form.leader_id}
                                        onChange={e => setForm(f => ({ ...f, leader_id: e.target.value }))}
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
                                        value={form.note_taker_id}
                                        onChange={e => setForm(f => ({ ...f, note_taker_id: e.target.value }))}
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
                                    rows={6}
                                    value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                    placeholder="Write your note here..."
                                />
                            </div>

                            <label className="note-form-checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.is_shared}
                                    onChange={e => setForm(f => ({ ...f, is_shared: e.target.checked }))}
                                />
                                Share with team
                            </label>

                            {formError && <p className="note-form-error">{formError}</p>}

                            <div className="note-form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(''); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm">Create Note</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notes;
