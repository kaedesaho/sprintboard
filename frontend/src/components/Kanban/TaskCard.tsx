import { useNavigate } from "react-router-dom";
import { Task } from "../../types/task"

import "./Kanban.css"

type CardProps = {
  task: Task
  projectID: string
  view: "list" | "kanban"
}

export default function TaskCard({ task, projectID, view }: CardProps) {
  const navigate = useNavigate();

  const handleClick = (taskID: number) => {
    navigate(`/projects/${projectID}/tasks/${taskID}?view=${view}`);
  };

  return (
    <div className="task-card" onClick={() => handleClick(task.id)}>
      {task.title}
    </div>
  )
}
