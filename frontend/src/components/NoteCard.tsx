import { Link } from 'react-router-dom';
import { type Note } from '../types/note';
import './NoteCard.css';

interface NoteCardProps {
    note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
    if (!note) return null;
    return (
        <Link
            to={`/projects/${note.project_id}/notes/${note.id}`}
            state={{ note }}
            className="note-card"
        >
            <div className='card-header'>
                <h2>{note.title}</h2>
                <span className="note-type-badge">{note.note_type}</span>
            </div>

            {note.sprint_num != null && <p>Sprint {note.sprint_num}</p>}
            {note.leader_name && <p>{note.leader_name}</p>}

            <div className='card-dates'>
                {note.planned_time && (
                    <span>Planned {new Date(note.planned_time).toLocaleDateString()}</span>
                )}
                {note.place && <span>{note.place}</span>}
                <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
        </Link>
    );
};

export default NoteCard;
