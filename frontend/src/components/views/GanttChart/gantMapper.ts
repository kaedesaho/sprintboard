import { Task as AppTask } from "../../../types/task"
import { Task as GanttTask } from "gantt-task-react";

const statusToProgress: Record<string, number> = {
  backlog: 0,
  todo: 10,
  in_progress: 50,
  testing: 75,
  review: 90,
  blocked: 0,
  done: 100,
};

export function mapTasksToGanttTasks(
  tasks: AppTask[],
  sprint?: number
): GanttTask[] {
  return tasks
    .filter(task => sprint === undefined || task.sprint === sprint)
    .filter(task => task.start_date && task.end_date)
    .map((task): GanttTask => {
        const start = task.start_date ? new Date(task.start_date) : new Date();
        const end = task.end_date ? new Date(task.end_date) : new Date(start.getTime() + 3600 * 1000); // +1h fallback

        return {
            id: task.id.toString(),
            name: task.title,
            type: "task",
            start,
            end,
            progress: statusToProgress[task.status] ?? 0,
            dependencies: task.dependency_ids?.map(String) ?? [],
            displayOrder: task.id,
            
            styles: {
                backgroundColor: priorityColor(task.priority),
                progressColor: "#4f46e5",
          },
        };
    });
}

function priorityColor(priority?: "low" | "medium" | "high") {
  switch (priority) {
    case "high":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // amber
    case "low":
      return "#10b981"; // green
    default:
      return "#6366f1"; // indigo
  }
}
