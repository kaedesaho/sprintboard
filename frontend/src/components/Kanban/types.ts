import { Task } from "../../types/task"

export type ColumnData = {
  id: string
  title: string
  taskIds: string[]
}

export type BoardData = {
  tasks: Record<string, Task>
  columns: Record<string, ColumnData>
  columnOrder: string[]
}
