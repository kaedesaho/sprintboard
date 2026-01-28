import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TaskForm, { TaskFormData } from "../components/TaskForm";
import { Task } from "../types/task"


const TaskPage = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : undefined;
    //const isEdit = !!taskId;

    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        // fetch all tasks in the project for dependency 
        fetch(`http://127.0.0.1:5000/api/tasks?project_id=${projectId}`)
        .then(res => res.json())
        .then(setAllTasks);

        // fetch existing categories in the project
        fetch(`http://127.0.0.1:5000/api/tasks/categories?project_id=${projectId}`)
        .then(res => res.json())
        .then(setCategories);

        // fetch members in the project for assignee
        fetch(`http://127.0.0.1:5000/api/tasks/users?project_id=${projectId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(setUsers)
            .catch(err => console.error("Fetch failed:", err));
    

        
    //     if (isEdit && taskId) {
    //         fetch(`/api/tasks/${taskId}`)
    //         .then(res => res.json())
    //         .then(task => {
    //         setCurrentTask(task);
    //         setLoading(false);
    //         });
    //     } else {
         setLoading(false);
    //     }
    }, [projectId]);

    const handleSubmit = (data: TaskFormData) => {
        //if (isEdit && taskId) {
        // fetch(`/api/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) });
        
        //} else {
            // create task
            // fetch('/api/tasks', { 
            //     method: 'POST', 
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });
       // }
    };

//   const handleDelete = () => {
//     fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
//   };

    const handleDelete = async () => {
    }

    if (loading) return <div>Loading...</div>;

    return (
    <TaskForm
    mode={isEdit ? "edit" : "create"}
    initialValues={isEdit ? currentTask! : undefined}
    tasks={allTasks.map(t => ({ id: t.id, title: t.title }))}
    users={users}
    categories={categories}
    onSubmit={handleSubmit}
    onDelete={isEdit ? handleDelete : undefined}
    />
  );
};

export default TaskPage;