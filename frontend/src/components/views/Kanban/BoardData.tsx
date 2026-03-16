import { Task, TaskStatus } from "../../types/task"
import { BoardData, ColumnData, columnsTemplate, columnOrder, statusToColumnMap } from "./types"

function buildBoardData(tasks: Task[]): BoardData {
  const columns: Record<TaskStatus, ColumnData> = JSON.parse(JSON.stringify(columnsTemplate))
  const tasksById: Record<string, Task> = {}

  tasks.forEach((task) => {
    const columnId = statusToColumnMap[task.status];
    if (!columnId) return;

    tasksById[task.id.toString()] = task
    columns[columnId].taskIds.push(task.id.toString())
  })

  return {
    tasks: tasksById,
    columns,
    columnOrder,
  }
}

export default buildBoardData;
