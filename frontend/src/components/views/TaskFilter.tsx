import { type Task } from "../../types/task";

export type SprintFilter =
  | "current"
  | "previous"
  | "all"
  | number;

export function filterBySprint(
  tasks: Task[],
  sprintFilter: SprintFilter,
  currentSprint: number
): Task[] {
  switch (sprintFilter) {
    case "all":
      return tasks;

    case "current":
      return tasks.filter(
        t => t.sprint === currentSprint
      );

    case "previous":
      return tasks.filter(
        t => t.sprint != null && t.sprint < currentSprint
      );

    default:
      return tasks.filter(
        t => t.sprint === sprintFilter
      );
  }
}
