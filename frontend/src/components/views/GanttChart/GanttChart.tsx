import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Task as GantTask, ViewMode as GantView, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "./view-switcher";
import { getStartEndDateForProject, initTasks } from "./helper";
import { mapTasksToGanttTasks } from "./gantMapper"
import { SprintSwitcher } from "./SprintSwitcher"; 
import { Task as AppTask } from "../../../types/task"
import { ViewMode as AppView} from "../../../types/view"
import "gantt-task-react/dist/index.css";

type GanChartProps = {
  projectID: string
  tasks: AppTask[]
  view: AppView
  curSprint: curSprint
}
  
function GanttChart ({ tasks, projectID, view, curSprint }: GanChartProps) {
  const [gantView, setView] = useState<GantView>(GantView.Day);
  const [viewMode, setViewMode] = useState<GantView>(GantView.Week);
  const [localTasks, setLocalTasks] = useState<AppTask[]>(tasks ?? []);
  const [showTaskList, setShowTaskList] = useState(false);
  const [activeSprint, setActiveSprint] = useState<number | "all">(curSprint);
  const navigate = useNavigate();

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  let columnWidth = 65;
  if (gantView === GantView.Year) {
    columnWidth = 350;
  } else if (gantView === GantView.Month) {
    columnWidth = 300;
  } else if (gantView === GantView.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: GantTask) => {
    console.log("On date change Id:" + task.id);
    let newTasks = localTasks.map(t => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex(t => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map(t =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setLocalTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setLocalTasks(localTasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setLocalTasks(localTasks.map(t => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: AppTask) => {
    navigate(`/projects/${projectID}/tasks/${task.id}?view=${view}`);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setLocalTasks(localTasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };
  
  const ganttTasks = useMemo(() => {
    return mapTasksToGanttTasks(
      localTasks ?? [],
      activeSprint === "all" ? undefined : activeSprint
    );
  }, [localTasks, activeSprint]);


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
    
      {ganttTasks.length > 0 ? (
      <Gantt
        tasks={ganttTasks}
        viewMode={gantView}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={showTaskList ? "155px" : ""}
        columnWidth={columnWidth}
        barCornerRadius={6}
        rowHeight={44}
        barFill={72}
        todayColor="rgba(99, 102, 241, 0.12)"
        arrowColor="#6366f1"
        arrowIndent={20}
      />
      ) : (
        <p>No tasks to display</p>
      )}
    </div>
  );
};

export default GanttChart;