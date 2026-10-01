import "./GanttChart.css";
import { ViewMode } from "gantt-task-react";

type ViewSwitcherProps = {
  isChecked: boolean;
  onViewListChange: (isChecked: boolean) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
};

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  onViewModeChange,
  onViewListChange,
  isChecked,
}) => {
  return (
    <>
      <div className="Switch">
        <label className="Switch_Toggle">
          <input
            type="checkbox"
            checked={isChecked}
            onClick={() => onViewListChange(!isChecked)}
          />
          <span className="Slider" />
        </label>
        Show Task info
      </div>
      <select
        className="filter-dropdown"
        onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
      >
        <option value={ViewMode.Day}>Day</option>
        <option value={ViewMode.Week}>Week</option>
      </select>
    </>
  );
};