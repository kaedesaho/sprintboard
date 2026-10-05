import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type Task as GantTask, ViewMode as GantView, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "./view-switcher";
import { mapTasksToGanttTasks, ganttDatesToTaskDates } from "./gantMapper"
import { SprintSwitcher } from "./SprintSwitcher";
import { makeTaskTooltip } from "./TaskTooltip";
import { type Task as AppTask } from "../../../types/task"
import { type ViewMode as AppView} from "../../../types/view"
import "gantt-task-react/dist/index.css";

const DAY_MS = 24 * 60 * 60 * 1000;
// How far (px) the mouse can move during a click before it counts as a drag
const DRAG_THRESHOLD = 4;

type GanChartProps = {
  projectID: string
  tasks: AppTask[]
  view: AppView
  curSprint: number
  setTasks: React.Dispatch<React.SetStateAction<AppTask[]>>
}
  
function GanttChart ({ tasks, projectID, view, curSprint, setTasks }: GanChartProps) {
  const [gantView, setView] = useState<GantView>(GantView.Day);
  const [showTaskList, setShowTaskList] = useState(false);
  const [activeSprint, setActiveSprint] = useState<number | "all">(curSprint);
  const [error, setError] = useState("");
  const mouseDownAt = useRef<{ x: number; y: number } | null>(null);
  const wasDragged = useRef(false);
  const navigate = useNavigate();

  let columnWidth = 65;
  if (gantView === GantView.Year) {
    columnWidth = 350;
  } else if (gantView === GantView.Month) {
    columnWidth = 300;
  } else if (gantView === GantView.Week) {
    columnWidth = 250;
  }

  // Dragging or resizing a bar saves the new dates. Returning false tells the
  // chart to snap the bar back.
  const handleDateChange = async (ganttTask: GantTask) => {
    const id = Number(ganttTask.id);
    const previous = tasks.find(t => t.id === id);
    if (!previous) return false;

    const dates = ganttDatesToTaskDates(ganttTask.start, ganttTask.end);
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...dates } : t)));

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dates),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setError("");
      return true;
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.map(t => (t.id === id ? previous : t)));
      setError(`Couldn't save new dates for "${previous.title}". Please try again.`);
      return false;
    }
  };

  // The browser fires a click when a drag ends on the same bar, so remember
  // whether the mouse moved between press and release.
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownAt.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const start = mouseDownAt.current;
    wasDragged.current = !!start &&
      Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD;
  };

  const handleClick = (task: GantTask) => {
    if (wasDragged.current) return;
    navigate(`/projects/${projectID}/tasks/${task.id}?view=${view}`);
  };

  const ganttTasks = useMemo(() => {
    return mapTasksToGanttTasks(
      tasks,
      activeSprint === "all" ? undefined : activeSprint
    );
  }, [tasks, activeSprint]);

  const TooltipContent = useMemo(
    () => makeTaskTooltip(new Map(tasks.map(t => [String(t.id), t]))),
    [tasks]
  );


  return (
    <div className="gantt-chart">
      <div className="gantt-filter">
        <ViewSwitcher
          onViewModeChange={viewMode => setView(viewMode)}
          onViewListChange={setShowTaskList}
          isChecked={showTaskList}
        />
        <SprintSwitcher
          activeSprint={activeSprint}
          onChange={setActiveSprint}
        />
      </div>

      {error && <p className="error">{error}</p>}

      {ganttTasks.length > 0 ? (
      <div onMouseDownCapture={handleMouseDown} onMouseUpCapture={handleMouseUp}>
      <Gantt
        tasks={ganttTasks}
        viewMode={gantView}
        onClick={handleClick}
        onDateChange={handleDateChange}
        TooltipContent={TooltipContent}
        timeStep={DAY_MS}
        listCellWidth={showTaskList ? "155px" : ""}
        columnWidth={columnWidth}
        barCornerRadius={6}
        rowHeight={44}
        barFill={72}
        todayColor="rgba(99, 102, 241, 0.12)"
        arrowColor="#6366f1"
        arrowIndent={20}
      />
      </div>
      ) : (
        <p>No tasks to display</p>
      )}
    </div>
  );
};

export default GanttChart;