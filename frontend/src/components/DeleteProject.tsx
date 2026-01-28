import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ui/ConfirmModal";

interface DeleteProjectModalProps {
    open: boolean;
    projectId: string;
    onClose: () => void;
}

const DeleteProjectModal = ({ open, onClose, projectId }: DeleteProjectModalProps) => {
    if (!open) return null;
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
             const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            if (!res.ok) {
                // Handle error (e.g., show a toast or alert)
                alert(data.error || "Failed to delete project");
                return;
            }

            // Successfully deleted
            onClose();
            navigate("/dashboard");
        } catch (err) {
            console.error("Delete error:", err);
            alert("An error occurred while deleting the project");
        }
    };


    return (
        <ConfirmModal
            title="Delete Project"
            message="Are you sure you want to delete your account?"
            confirmText="Delete"
            onConfirm={handleDelete}
            onCancel={onClose}
        />
    );
}

export default DeleteProjectModal;