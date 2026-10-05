import { useNavigate } from "react-router-dom";
import { type Task } from "../../types/task"
import { type ViewMode } from "../../types/view";
import { formatString } from "../../utils/format";
import "./TaskList.css"


type BackLogProps = {
  tasks: Task[]
  projectID: string
  view: ViewMode
}

function BackLog({ tasks, projectID, view }: BackLogProps) {
  const navigate = useNavigate();

  if (tasks.length === 0) return <p>No tasks found.</p>;

  const handleRowClick = (taskID: number) => {
    navigate(`/projects/${projectID}/tasks/${taskID}?view=${view}`);
  };

  return (
    <div className="task-table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Estimate</th>
            <th>Assignees</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
            key={task.id}
            onClick={() => handleRowClick(task.id)}
          >
            <td>{task.sprint}</td>
            <td>{task.title}</td>
            <td>{task.description}</td>
            <td>
              <span className={`task-status ${task.status}`}>
              {formatString(task.status)}
              </span>
            </td>
            <td>
              <span className={`task-priority ${task.priority}`}>
              {formatString(task.priority)}
              </span>
            </td>
            <td>{task.time_estimation}</td>
            <td>
              <span className="task-assignee">
                {task.assignees && task.assignees.length > 0
                  ? task.assignees.map((assignee) => (
                      <span key={assignee} className="assignee-badge">
                        {assignee}
                      </span>
                    ))
                  : ""}
              </span>
            </td>
            <td>
              <span className="task-category">
                {task.category_ids && task.category_ids.length > 0
                  ? task.category_ids.map((category) => (
                      <span key={category} className="category-badge">
                        {category}
                      </span>
                    ))
                  : ""}
                </span>
            </td>
           </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BackLog;