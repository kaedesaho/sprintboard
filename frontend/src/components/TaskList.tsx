import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Task } from "../types/task"
import "./TaskList.css"


type TaskListProps = {
  tasks: Task[]
  projectID: string
  view: "list" | "kanban" 
}

function TaskList({ tasks, projectID, view }: TaskListProps) {
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
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Sprint</th>
            <th>Time Est.</th>
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
            <td>{task.title}</td>
            <td>{task.status}</td>
            <td>{task.priority}</td>
            <td>{task.sprint}</td>
            <td>{task.time_estimation}</td>
            <td>{task.assignees?.length ? task.assignees.join(", ") : ""}</td>
            <td>{task.category_ids?.length ? task.category_ids.join(", ") : ""}</td>
           </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaskList;