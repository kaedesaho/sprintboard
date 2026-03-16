import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import BackLog from "./views/Backlog"
import KanbanBoard from "./views/Kanban/KanbanBoard"
import TaskList from "./views/TaskList"
import GanttChart from "./views/GanttChart/GanttChart"
import { Task } from "../types/task"
import { ViewMode, allowedViews } from "../types/view"
import { parseEnum } from "../utils/parseEnum";
import "./ProjectTasks.css"


type Props = {
  projectID: string
  curSprint: number
}


function ProjectTasks({ projectID, curSprint }: Props) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [searchParams, setSearchParams] = useSearchParams();
    const view: ViewMode = parseEnum(searchParams.get("view"), allowedViews, "gantt");
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

    const switchView = (newView: ViewMode) => {
        setSearchParams({ view: newView })
    }


    return (
        <div className="project-tasks">
            <div className="view-btn">
                <button
                onClick={() => switchView("gantt")}
                disabled={view === "gantt"}
                >
                Gantt Chart
                </button>

                <button
                onClick={() => switchView("kanban")}
                disabled={view === "kanban"}
                >
                Kanban Board
                </button>

                <button
                onClick={() => switchView("list")}
                disabled={view === "list"}
                >
                List
                </button>

                <button
                onClick={() => switchView("backlog")}
                disabled={view === "backlog"}
                >
                Backlog
                </button>
            </div>

            {view === "gantt" && (
                <GanttChart
                tasks={tasks}
                projectID={projectID} 
                view={view}
                curSprint={curSprint}
                />
            )}

            {view === "kanban" && ( 
                <KanbanBoard 
                projectID={projectID} 
                tasks={tasks.filter((t => t.sprint == curSprint))} 
                view={view} 
                setTasks={setTasks} 
                />
            )}

            {view === "list" && (
                <TaskList 
                projectID={projectID} 
                tasks={tasks} 
                view={view} 
                curSprint={curSprint}
                />
            )}

            {view === "backlog" && (
                <BackLog 
                projectID={projectID} 
                tasks={tasks.filter(t => t.status == "backlog")} 
                view={view} 
                />
            )}

        </div>
  );
};

export default ProjectTasks;