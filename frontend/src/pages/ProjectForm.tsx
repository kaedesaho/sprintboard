import { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import DeleteProjectModal from "../components/DeleteProject";
import { useAuth } from "../context/AuthContext"; 
import { AiOutlineClose } from "react-icons/ai";
import "./ProjectForm.css";

type Mode = 'create' | 'edit';

interface User {
    id: number;
    username: string;
}

interface SelectedUser extends User {
    role: "Admin" | "Member";
}

const ProjectForm = ( { mode }: { mode:Mode } ) => {
    const { id } = useParams();
    const { userID, username } = useAuth();
    if (!userID || !username) return null;
    const currentUser: SelectedUser = { id: userID, username, role: "Admin" };
    const isEditMode = mode === 'edit';
    const [project, setProject] =useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([currentUser]);
    const [error, setError] = useState("");
    const navigate = useNavigate()
    const searchRef = useRef<HTMLDivElement>(null);

    // Edit
    useEffect(() => {
        if (!isEditMode || !id || !userID) return;

        fetch(`http://127.0.0.1:5000/api/projects/${id}?user_id=${userID}`)
            .then(res => res.json())
            .then(setProject)
            .catch(console.error);

        fetch(`http://127.0.0.1:5000/api/projects/${id}/members`)
            .then(res => res.json())
            .then(data => {

                let updatedMembers: SelectedUser[] = data.map((m: any) => ({
                    id: m.user_id,
                    username: m.username,
                    role: m.role
                }));
        const otherMembers = updatedMembers.filter(u => u.id !== currentUser.id);
        setSelectedUsers([currentUser, ...otherMembers]);
    })
        .catch(console.error);

    }, [isEditMode, id, userID]);

    useEffect(() => {
    if (isEditMode && project) {
        setTitle(project.title || "");
        setDescription(project.description || "");
    }
}, [isEditMode, project]);
       

    // Search users
     useEffect(() => {
        if (searchTerm === "") {
            setSearchResults([]);
            return;
        }
        const fetchUsers = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/users/search?query=${searchTerm}`);
                if (!res.ok) throw new Error("Failed to search users");

                const data: User[] = await res.json();

                const filtered = data.filter(
                    (u) => !selectedUsers.find((s) => s.id === u.id)
                );
        setSearchResults(filtered);

        } catch (err) {
                console.error("Search failed:", err);
            }
        };

        fetchUsers();
    }, [searchTerm, selectedUsers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
        }, []);

    const addUser = (user: User) => {
        setSelectedUsers([...selectedUsers, { ...user, role: "Member" }]);
        setSearchTerm("");
    };

    const removeUser = (id: number) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
    };

    const toggleRole = (id: number) => {
        setSelectedUsers(
            selectedUsers.map((u) =>
                u.id === id ? { ...u, role: u.role === "Admin" ? "Member" : "Admin" } : u
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditMode 
        ? `http://127.0.0.1:5000/api/projects/${project.id}` 
        : "http://127.0.0.1:5000/api/projects";
        const method = isEditMode ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    members: selectedUsers.map((u) => ({ user_id: u.id, role: u.role }))
                })
            });

            if (!res.ok) throw new Error("Failed to create project");

            const data = await res.json();
            console.log("Project created:", data);
            if (!data.success) throw new Error(data.error || "Project creation failed");
            navigate(`/project/${data.project_id}`);

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="create-project">
            {!isEditMode || project ? (
            <div className="project-form-container">
                <h1>{isEditMode ? 'Edit Project' : 'Create Project'}</h1>
                {error && <p className="error">{error}</p>}

                <form className="project-form" onSubmit={handleSubmit}>
                    <label htmlFor="title">Title</label>
                    <input 
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    />

                    <label htmlFor="description">Description</label>
                    <textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    />

                    <label htmlFor="members">Members</label>
                    <div className="member-search-container" ref={searchRef}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                        />
                        {searchResults.length > 0 && (
                            <ul className="search-results">
                                {searchResults.map((user) => (
                                    <li key={user.id} onClick={() => addUser(user)}>
                                        {user.username}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="selected-users">
                        {selectedUsers.map((user) => (
                            <div key={user.id} className="selected-user">
                                {user.id !== currentUser.id && (
                                    <AiOutlineClose
                                        className="remove-btn"
                                        onClick={() => removeUser(user.id)}
                                    />
                                )}
                                <span>{user.username}</span>
                                <button type="button" 
                                disabled={user.id === currentUser.id}
                                onClick={() => toggleRole(user.id)}>
                                    {user.role}
                                </button>
            
                            </div>
                        ))}
                    </div>  

                    <div className="form-buttons">
                        {isEditMode ? (
                        <Link to={`/project/${project.id}`} state={{project}} className="cancel">Cancel</Link>
                        ) : (
                        <Link to="/dashboard" className="cancel">Cancel</Link>
                        )}

                        <button type="submit" className="confirm">{isEditMode ? 'Save' : 'Create'}</button>
                    </div>
                    
                    {isEditMode && (
                        <button type="button" onClick={() => setShowDeleteModal(true)}>
                            Delete Project
                        </button>
                    )}

                    {isEditMode && project?.id &&(
                    <DeleteProjectModal
                        open={showDeleteModal} 
                        projectId={project?.id} 
                        onClose={() => setShowDeleteModal(false)}
                    />
                    )}
                </form>
            </div>
            ) : (
                <div>loading project...</div>
            )}
        </div>

    );
};

export default ProjectForm;