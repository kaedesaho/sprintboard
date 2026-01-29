import { Task, TaskStatus } from "../../types/task"
import { BoardData, ColumnData, columnsTemplate, columnOrder } from "./types"

function buildBoardData(tasks: Task[]): BoardData {
  const columns: Record<TaskStatus, ColumnData> = JSON.parse(JSON.stringify(columnsTemplate))
  const tasksById: Record<string, Task> = {}

  tasks.forEach((task) => {
    tasksById[task.id.toString()] = task
    const columnId: TaskStatus = task.status || "backlog"
    columns[columnId].taskIds.push(task.id.toString())
  })

  return {
    tasks: tasksById,
    columns,
    columnOrder,
  }
}

export default buildBoardData;
