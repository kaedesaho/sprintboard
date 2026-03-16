import "./GanttChart.css"

type SprintSwitcherProps = {
  activeSprint: number | "all";
  onChange: (sprint: number | "all") => void;
};

export const SprintSwitcher: React.FC<SprintSwitcherProps> = ({
  activeSprint,
  onChange,
}) => {
  return (
    <div className="view-switcher">
        <select 
        className="filter-dropdown"
        value={activeSprint}
        onChange={(e) =>
        onChange(
            e.target.value === "all"
            ? "all"
            : Number(e.target.value)
            )
            }
        >
        <option value="all">All</option>
        {[1, 2, 3].map((sprint) => (
        <option key={sprint} value={sprint}>
            Sprint {sprint}
        </option>
        ))}
        </select>
    </div>
  );
};
