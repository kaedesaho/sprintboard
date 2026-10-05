import { useNavigate } from "react-router-dom";
import { type Task } from "../../../types/task"
import { formatString } from "../../../utils/format";
import { type ViewMode } from "../../../types/view";
import "./Kanban.css"

type CardProps = {
  task: Task
  projectID: string
  view: ViewMode
}

export default function TaskCard({ task, projectID, view }: CardProps) {
  const navigate = useNavigate();

  const handleClick = (taskID: number) => {
    navigate(`/projects/${projectID}/tasks/${taskID}?view=${view}`);
  };

  return (
    <div className="task-card" onClick={() => handleClick(task.id)}>
      <div className="card-header">
        <h3>{task.title}</h3>

        <div className={`priority-badge ${task.priority}`}>
          {formatString(task.priority)}
        </div>
      </div>
      
      <p>{task.description}</p>
      <span className="task-assignee">
                {task.assignees && task.assignees.length > 0
                  ? task.assignees.map((assignee) => (
                      <span key={assignee} className="assignee-badge">
                        {assignee}
                      </span>
                    ))
                  : ""}
              </span>


       {["testing", "review", "blocked"].includes(task.status) && (
        <span className={`status-badge ${task.status}`}>
          {formatString(task.status)}
          </span>
      )}
    </div>
  )
}
