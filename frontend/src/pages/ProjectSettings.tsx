import { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import DeleteProjectModal from "../components/DeleteProject";
import "./ProjectSettings.css";

interface User {
    id: number;
    username: string;
}

interface SelectedUser extends User {
    role: "Admin" | "Member";
}

const ProjectSettings = () => {
    const { project, setProject } = useProject();
    const { userID, username } = useAuth();
    const isAdmin = project?.role === 'Admin';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [curSprint, setCurSprint] = useState('');
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Members state
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    const currentUser: SelectedUser | null = userID && username
        ? { id: userID, username, role: 'Admin' }
        : null;

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description ?? '');
            setCurSprint(project.cur_sprint?.toString() ?? '');
        }
    }, [project]);

    // Load members on mount
    useEffect(() => {
        if (!project) return;
        fetch(`http://127.0.0.1:5000/api/projects/${project.id}/members`)
            .then(res => res.json())
            .then(data => {
                const members: SelectedUser[] = data.map((m: any) => ({
                    id: m.user_id,
                    username: m.username,
                    role: m.role,
                }));
                setSelectedUsers(members);
            })
            .catch(console.error);
    }, [project?.id]);

    // User search
    useEffect(() => {
        if (!searchTerm) { setSearchResults([]); return; }
        const fetchUsers = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/users/search?query=${searchTerm}`);
                const data: User[] = await res.json();
                setSearchResults(data.filter(u => !selectedUsers.find(s => s.id === u.id)));
            } catch (err) {
                console.error("Search failed:", err);
            }
        };
        fetchUsers();
    }, [searchTerm, selectedUsers]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addUser = (user: User) => {
        setSelectedUsers([...selectedUsers, { ...user, role: "Member" }]);
        setSearchTerm('');
    };

    const removeUser = (id: number) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== id));
    };

    const toggleRole = (id: number) => {
        setSelectedUsers(selectedUsers.map(u =>
            u.id === id ? { ...u, role: u.role === 'Admin' ? 'Member' : 'Admin' } : u
        ));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    cur_sprint: curSprint,
                    members: selectedUsers.map(u => ({ user_id: u.id, role: u.role })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setProject({ ...project, title, description, cur_sprint: Number(curSprint) });
                setMsg({ text: 'Project updated successfully.', type: 'success' });
            } else {
                setMsg({ text: data.error || 'Failed to update project.', type: 'error' });
            }
        } catch {
            setMsg({ text: 'Server error. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (!project) return <p>Loading...</p>;

    return (
        <div className="project-settings">
            {isAdmin ? (
                <>
                    <div className="project-settings-section">
                        <h2>Project Info</h2>
                        <form className="project-settings-form" onSubmit={handleSave}>
                            <div className="project-settings-field">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="project-settings-field">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="project-settings-field">
                                <label>Current Sprint</label>
                                <input
                                    type="number"
                                    value={curSprint}
                                    onChange={e => setCurSprint(e.target.value)}
                                />
                            </div>

                            <div className="project-settings-field">
                                <label>Members</label>
                                <div className="project-settings-member-search" ref={searchRef}>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search users to add..."
                                    />
                                    {searchResults.length > 0 && (
                                        <ul className="project-settings-search-results">
                                            {searchResults.map(user => (
                                                <li key={user.id} onClick={() => addUser(user)}>
                                                    {user.username}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="project-settings-members-list">
                                    {selectedUsers.map(user => (
                                        <div key={user.id} className="project-settings-member-row">
                                            {user.id !== currentUser?.id && (
                                                <AiOutlineClose
                                                    className="project-settings-member-remove"
                                                    onClick={() => removeUser(user.id)}
                                                />
                                            )}
                                            <span className="project-settings-member-name">{user.username}</span>
                                            <button
                                                type="button"
                                                className="project-settings-role-btn"
                                                disabled={user.id === currentUser?.id}
                                                onClick={() => toggleRole(user.id)}
                                            >
                                                {user.role}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {msg && (
                                <p className={`project-settings-feedback ${msg.type}`}>{msg.text}</p>
                            )}
                            <button type="submit" className="project-settings-save-btn" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="project-settings-section project-settings-danger">
                        <h2>Danger Zone</h2>
                        <p>Permanently delete this project and all its data.</p>
                        <button
                            className="project-settings-delete-btn"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete Project
                        </button>
                    </div>

                    <DeleteProjectModal
                        open={showDeleteModal}
                        projectId={project.id}
                        onClose={() => setShowDeleteModal(false)}
                    />
                </>
            ) : (
                <div className="project-settings-section">
                    <h2>Project Info</h2>
                    <div className="project-settings-readonly">
                        <div className="project-settings-field">
                            <label>Title</label>
                            <p>{project.title}</p>
                        </div>
                        {project.description && (
                            <div className="project-settings-field">
                                <label>Description</label>
                                <p>{project.description}</p>
                            </div>
                        )}
                        <div className="project-settings-field">
                            <label>Current Sprint</label>
                            <p>{project.cur_sprint}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSettings;
