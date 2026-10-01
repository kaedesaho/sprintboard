import { useState, useEffect } from "react"
import type { BoardData } from "./types"
import Column from "./Column"
import buildBoardData from "./BoardData"
import type { ViewMode } from "../../../types/view"
import type { Task, TaskStatus } from "../../../types/task"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import "./Kanban.css"

type KanbanBoardProps = {
  projectID: string
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  view: ViewMode
}

function KanbanBoard({ projectID, tasks: tasksProp, view, setTasks}: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardData>(() => buildBoardData(tasksProp))
  
  useEffect(() => {
    setBoard(buildBoardData(tasksProp))
  }, [tasksProp])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    // Columns are sorted by priority, so dropping within the same column changes nothing
    if (!destination || destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId as TaskStatus
    const moveTask = (task: Task): Task =>
      task.id.toString() === draggableId ? { ...task, status: newStatus } : task

    // Rebuild immediately so the card lands in its priority spot without flickering
    setBoard(buildBoardData(tasksProp.map(moveTask)))
    setTasks((prev) => prev.map(moveTask))

    fetch(`http://127.0.0.1:5000/api/tasks/${draggableId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .catch((err) => console.error("Failed to update task:", err))
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
    </DragDropContext>
  )
}

export default KanbanBoard;