import { Task, TaskStatus } from "../../types/task"

export type ColumnData = {
  id: TaskStatus
  title: string
  taskIds: string[]
}

export type BoardData = {
  tasks: Record<string, Task>
  columns: Record<string, ColumnData>
  columnOrder: string[]
}

export const columnsTemplate: Record<TaskStatus, ColumnData> = {
  backlog: { id: "backlog", title: "Backlog", taskIds: [] },
  todo: { id: "todo", title: "To Do", taskIds: [] },
  in_progress: { id: "in_progress", title: "In Progress", taskIds: [] },
  done: { id: "done", title: "Done", taskIds: [] },
}

export const columnOrder: TaskStatus[] = ["backlog", "todo", "in_progress", "done"];
