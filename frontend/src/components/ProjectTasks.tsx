import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import TaskList from "./TaskList"
import KanbanBoard from "./Kanban/KanbanBoard"
import { Task } from "../types/task"

type ViewMode = "list" | "kanban"

type Props = {
  projectID: string
}


function ProjectTasks({ projectID }: Props) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const view = searchParams.get("view") || "list"
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTasks() {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/tasks/${projectID}/tasks`);
            const data = await res.json();
            setTasks(data);

        } catch (err) {
            console.error("Failed to fetch tasks:", err);

        } finally {
            setLoading(false);
        }
        }

        fetchTasks();
    }, [projectID]);

    const switchView = (newView: "list" | "kanban") => {
        setSearchParams({ view: newView })
    }


    return (
        <div>
            <button
                onClick={() => switchView("list")}
                disabled={view === "list"}
                >
                List View
                </button>
                <button
                onClick={() => switchView("kanban")}
                disabled={view === "kanban"}
                >
                Kanban View
            </button>

            {view === "list" ? (
                <TaskList projectID={projectID} tasks={tasks} view={view} />
            ) : (
                <KanbanBoard projectID={projectID} tasks={tasks} view={view} />
            )}
        </div>
  );
};

export default ProjectTasks;