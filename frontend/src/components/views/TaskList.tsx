import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Task } from "../../types/task"
import { ViewMode } from "../../types/view"
import { formatString } from "../../utils/format"
import { SprintFilter, filterBySprint } from "./TaskFilter"
import "./TaskList.css"

type TaskListProps = {
  tasks: Task[]
  projectID: string
  view: ViewMode
  curSprint: number;
}

const allSprints = [1, 2, 3, 4];

function TaskList({ tasks, projectID, view, curSprint }: TaskListProps) {
  const navigate = useNavigate();
  const [sprintFilter, setSprintFilter] = useState<SprintFilter>("current");
  const visibleTasks = filterBySprint(tasks, sprintFilter, curSprint);

  if (tasks.length === 0) return <p>No tasks found.</p>;

  const handleRowClick = (taskID: number) => {
    navigate(`/projects/${projectID}/tasks/${taskID}?view=${view}`);
  };

  return (
    <div className="task-table-container">
      <select
      className="list-filter"
      value={sprintFilter}
      onChange={(e) => {
        const value = e.target.value;
        setSprintFilter(
          value === "current" || value === "previous" || value === "all"
            ? (value as SprintFilter)
            : Number(value)
        );
      }}
      >
        <option value="current">Current Sprint</option>
        <option value="previous">Previous Sprints</option>
        <option value="all">All Sprints</option>

        <optgroup label="Specific Sprints">
          {allSprints.map((s) => (
            <option key={s} value={s}>
              Sprint {s}
            </option>
          ))}
        </optgroup>
      </select>
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
          {visibleTasks
          .map((task) => (
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

export default TaskList;