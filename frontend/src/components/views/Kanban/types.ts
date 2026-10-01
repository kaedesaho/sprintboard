import { Task, TaskStatus } from "../../../types/task"


type ColumnId = "todo" | "in_progress" | "review" | "done";

export const statusToColumnMap: Record<TaskStatus, ColumnId | null> = {
  backlog: null,
  todo: "todo",
  in_progress: "in_progress",
  blocked: "in_progress",
  testing: "review",
  review: "review",
  done: "done",
};

export type ColumnData = {
  id: ColumnId
  title: string
  taskIds: string[]
}

export const columnsTemplate: Record<ColumnId, ColumnData> = {
  todo: { id: "todo", title: "Ready", taskIds: [] },
  in_progress: { id: "in_progress", title: "In Progress", taskIds: [] },
  review: { id: "review", title: "Review / Testing", taskIds: [] },
  done: { id: "done", title: "Done", taskIds: [] },
}

export const columnOrder: ColumnId[] = ["todo", "in_progress", "review", "done"];

export type BoardData = {
  tasks: Record<string, Task>
  columns: Record<string, ColumnData>
  columnOrder: string[]
}