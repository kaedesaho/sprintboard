import { type Task as GanttTask } from "gantt-task-react";
import { type Task as AppTask } from "../../../types/task";
import { formatString } from "../../../utils/format";
import "../TaskList.css";
import "./GanttChart.css";

type TooltipProps = {
  task: GanttTask;
  fontSize: string;
  fontFamily: string;
};

// The chart only passes its own task shape to the tooltip, so look up the
// app task by id to show status and priority.
export function makeTaskTooltip(taskById: Map<string, AppTask>) {
  return function TaskTooltip({ task }: TooltipProps) {
    const appTask = taskById.get(task.id);

    return (
      <div className="gantt-tooltip">
        <div className="gantt-tooltip-title">{task.name}</div>
        {appTask && (
          <div className="gantt-tooltip-badges">
            <span className={`task-status ${appTask.status}`}>
              {formatString(appTask.status)}
            </span>
            {appTask.priority && (
              <span className={`task-priority ${appTask.priority}`}>
                {formatString(appTask.priority)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };
}
