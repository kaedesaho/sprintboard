import type { Task, TaskPriority, TaskStatus } from "../../../types/task"
import type { BoardData, ColumnData } from "./types"
import { columnsTemplate, columnOrder, statusToColumnMap } from "./types"

// Higher priority first; tasks without a priority go last
const priorityRank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
const rank = (task: Task) => (task.priority ? priorityRank[task.priority] : 3)

function buildBoardData(tasks: Task[]): BoardData {
  const columns: Record<TaskStatus, ColumnData> = JSON.parse(JSON.stringify(columnsTemplate))
  const tasksById: Record<string, Task> = {}

  // Stable sort: same-priority tasks keep their creation order
  const sorted = [...tasks].sort((a, b) => rank(a) - rank(b))

  sorted.forEach((task) => {
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
