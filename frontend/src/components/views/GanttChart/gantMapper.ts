import { type Task as AppTask } from "../../../types/task"
import { type Task as GanttTask } from "gantt-task-react";

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
        const start = parseDay(task.start_date!);
        // End date is inclusive, so the bar runs to the end of that day
        const end = addDays(parseDay(task.end_date!), 1);

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
                backgroundSelectedColor: "#4f46e5",
                progressColor: "#3730a3",
                progressSelectedColor: "#312e81",
          },
        };
    });
}

function priorityColor(priority?: "low" | "medium" | "high") {
  switch (priority) {
    case "high":   return "#818cf8"; // indigo-400
    case "medium": return "#6366f1"; // indigo-500
    case "low":    return "#a5b4fc"; // indigo-300
    default:       return "#6366f1";
  }
}

// The API sends dates as midnight UTC; use that calendar day at local midnight
// so bars line up with the chart's day columns.
function parseDay(value: string): Date {
  const d = new Date(value);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Nearest local midnight; drags move in 24h steps, which can land an hour off
// midnight when crossing a daylight-saving change
function roundToDay(date: Date): Date {
  return addDays(date, date.getHours() >= 12 ? 1 : 0);
}

// Formats as YYYY-MM-DD for the API
function toDayString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Converts a dragged bar back to the task's start/end dates
export function ganttDatesToTaskDates(start: Date, end: Date) {
  return {
    start_date: toDayString(roundToDay(start)),
    end_date: toDayString(addDays(roundToDay(end), -1)),
  };
}
