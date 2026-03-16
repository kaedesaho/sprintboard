import { Task, TaskStatus } from "../../../types/task"


type ColumnId = "todo" | "in_progress" | "done";

export const statusToColumnMap: Record<TaskStatus, ColumnId | null> = {
  backlog: null, 
  todo: "todo",
  in_progress: "in_progress",
  testing: "in_progress",
  review: "in_progress",
  blocked: "in_progress",
  done: "done",
};

export type ColumnData = {
  id: ColumnId
  title: string
  taskIds: string[]
}

export const columnsTemplate: Record<ColumnId, ColumnData> = {
  todo: { id: "todo", title: "To Do", taskIds: [] },
  in_progress: { id: "in_progress", title: "In Progress", taskIds: [] },
  done: { id: "done", title: "Done", taskIds: [] }
}

export const columnOrder: TaskStatus[] = ["todo", "in_progress", "done"];

export type BoardData = {
  tasks: Record<string, Task>
  columns: Record<string, ColumnData>
  columnOrder: string[]
}