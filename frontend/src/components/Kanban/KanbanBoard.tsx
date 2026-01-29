import { useState, useEffect } from "react"
import { BoardData, ColumnData } from "./types"
import Column from "./Column"
import buildBoardData from "./BoardData"
import { Task } from "../../types/task"
import "./Kanban.css"

type KanbanBoardProps = {
  projectID: string
  tasks: Task[]
  view: "list" | "kanban"
}

function KanbanBoard({ projectID, tasks, view}: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardData>(() => buildBoardData(tasks))

  useEffect(() => {
    setBoard(buildBoardData(tasks))
  }, [tasks])

  return (
    <div className="board">
      {board.columnOrder.map((columnId) => {
        const column = board.columns[columnId]
        const columnTasks = column.taskIds.map(
          (taskId) => board.tasks[taskId]
        )

        return (
          <Column
            key={column.id}
            column={column}
            tasks={columnTasks}
            projectID={projectID}
            view={view}
          />
        )
      })}
    </div>
  )
}

export default KanbanBoard;