import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProjectMembers.css";

interface Member {
    user_id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    photo_url: string | null;
}

const ProjectMembers = () => {
    const { projectID } = useParams();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectID) return;

        fetch(`http://127.0.0.1:5000/api/projects/${projectID}/members`)
            .then(res => res.json())
            .then(setMembers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [projectID]);

    if (loading) return <p>Loading members...</p>;

    return (
        <div className="members-page">
            <p className="members-count">{members.length} member{members.length !== 1 ? 's' : ''}</p>

            <div className="members-list">
                {members.map(m => {
                    const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ');
                    const initial = m.username ? m.username[0].toUpperCase() : '?';
                    return (
                        <div key={m.user_id} className="member-card">
                            <div className="member-card-left">
                                {m.photo_url ? (
                                    <img src={m.photo_url} className="member-avatar" alt={m.username} />
                                ) : (
                                    <div className="member-avatar-initials">{initial}</div>
                                )}
                                <div className="member-info">
                                    {fullName && <span className="member-name">{fullName}</span>}
                                    <span className="member-username">@{m.username}</span>
                                    <span className="member-email">{m.email}</span>
                                </div>
                            </div>
                            <span className={`member-role ${m.role.toLowerCase()}`}>
                                {m.role}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectMembers;
