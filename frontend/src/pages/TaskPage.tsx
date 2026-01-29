import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import TaskForm, { TaskFormData } from "../components/TaskForm";
import { Task } from "../types/task"

type TaskProps = {
    mode: 'create' | 'edit';
}

const TaskPage = ( { mode }: TaskProps) => {
    const params = useParams<{ projectID: string; taskID?: string }>();

    const projectID = params.projectID;
    const taskID = params.taskID;

    const [searchParams] = useSearchParams();
const view = (searchParams.get("view") as "list" | "kanban") || "list";

    const isEditMode = mode === "edit";
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
    const [loading, setLoading] = useState(isEditMode);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);

            try {
                let task = null;
                if (isEditMode && taskID) {
                    const taskRes = await fetch(`http://127.0.0.1:5000/api/tasks/${taskID}`);
                    if (!taskRes.ok) throw new Error(`Task fetch failed: ${taskRes.status}`);
                    const task = await taskRes.json();
                    setCurrentTask(task);
                }
                
                const [tasksRes, categoriesRes, usersRes] = await Promise.all([
                    // fetch all tasks in the project for dependency 
                    fetch(`http://127.0.0.1:5000/api/tasks?project_id=${projectID}`),
                    // fetch existing categories in the project
                    fetch(`http://127.0.0.1:5000/api/tasks/categories?project_id=${projectID}`),
                    // fetch members in the project for assignee
                    fetch(`http://127.0.0.1:5000/api/tasks/users?project_id=${projectID}`)
                ]);
                if (!tasksRes.ok) throw new Error(`Tasks fetch failed: ${tasksRes.status}`);
                if (!categoriesRes.ok) throw new Error(`Categories fetch failed: ${categoriesRes.status}`);
                if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);

                const tasks = await tasksRes.json();
                const categories = await categoriesRes.json();
                const users = await usersRes.json();

                setAllTasks(tasks);
                setCategories(categories);
                setUsers(users);

            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [projectID, isEditMode, taskID]);
     

    const handleSubmit = async(formData: TaskFormData) => {
        if (!projectID) return;
        // create task
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/tasks`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                project_id: projectID
            })
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to create task");
        }

        const createdTask = await res.json();
            console.log("Task created:", createdTask);
            navigate(`/projects/${projectID}?view=${view}`);
            
        } catch (err: any) {
            console.error("Task creation failed:", err);
            setError(err.message); 
        }
        };

//   const handleDelete = () => {
//     fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
//   };

    const handleDelete = async () => {
    }

    if (loading) return <div>Loading...</div>;

    return (
        <>
        {error && <div>{error}</div>}
        <TaskForm
        mode={isEditMode ? "edit" : "create"}
        initialValues={isEditMode ? currentTask! : undefined}
        tasks={allTasks.map(t => ({ id: t.id, title: t.title }))}
        users={users}
        categories={categories}
        onCategoryCreated={(newCat) => setCategories(prev => [...prev, newCat])}
        onSubmit={handleSubmit}
        onDelete={isEditMode ? handleDelete : undefined}
        view={view}
        />
        </>
    );
};

export default TaskPage;