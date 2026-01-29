import TaskCard from "./TaskCard"
import { ColumnData as ColumnType } from "./types"
import { Task } from "../../types/task"
import "./Kanban.css"

type ColumnProps = {
  column: ColumnType
  tasks: Task[]
  projectID: string
  view: "list" | "kanban"
}

export default function Column({ column, tasks, projectID, view }: ColumnProps) {
  return (
    <div className="column">
        <h3 className="column-title">{column.title}</h3>

        <div className="task-list">
        {tasks.map((task) => (
            <TaskCard 
            key={task.id} 
            task={task} 
            projectID={projectID}
            view={view}
            />
        ))}
        </div>
    </div>
  )
}
