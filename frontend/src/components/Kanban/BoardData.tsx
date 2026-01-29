import { Task } from "../../types/task"
import { BoardData, ColumnData } from "./types"

function buildBoardData(tasks: Task[]): BoardData {
  const statuses = ["backlog", "todo", "in_progress", "done"] 
  const columns: Record<string, ColumnData> = {}
  const tasksById: Record<string, Task> = {}

  statuses.forEach((status) => {
    columns[status] = { id: status, title: status.replace("_", " ").toUpperCase(), taskIds: [] }
  })

  tasks.forEach((task) => {
    tasksById[task.id] = task
    const columnId = task.status || "backlog" 
    if (!columns[columnId]) {
      columns[columnId] = { id: columnId, title: columnId.toUpperCase(), taskIds: [] }
    }
    columns[columnId].taskIds.push(task.id.toString())
  })

  return {
    tasks: tasksById,
    columns,
    columnOrder: statuses,
  }
}

export default buildBoardData;
