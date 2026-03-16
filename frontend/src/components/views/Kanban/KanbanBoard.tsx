import { useState, useEffect } from "react"
import { BoardData, ColumnData } from "./types"
import Column from "./Column"
import buildBoardData from "./BoardData"
import { ViewMode } from "../../../types/view"
import { Task, TaskStatus } from "../../../types/task"
import { DragDropContext, Droppable, DropResult, Draggable } from "@hello-pangea/dnd"
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
    if (!destination) return

    const startColumn = board.columns[source.droppableId]
    const finishColumn = board.columns[destination.droppableId]

    let updatedBoard: BoardData = { ...board };

    if (startColumn === finishColumn) {
      // Move within same column
      const newTaskIds = Array.from(startColumn.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = { ...startColumn, taskIds: newTaskIds }

      updatedBoard =({
        ...board,
        columns: {
          ...board.columns,
          [newColumn.id]: newColumn,
        },
      })
      setBoard(updatedBoard);
    } else {
      // Move to different column
      const startTaskIds = Array.from(startColumn.taskIds)
      startTaskIds.splice(source.index, 1)
      const newStart = { ...startColumn, taskIds: startTaskIds }

      const finishTaskIds = Array.from(finishColumn.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)
      const newFinish = { ...finishColumn, taskIds: finishTaskIds }

      updatedBoard = {
        ...board,
        columns: {
          ...board.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      };

      setBoard(updatedBoard);

      setTasks((prev: Task[]): Task[] =>
        prev.map((task: Task) =>
          task.id.toString() === draggableId
            ? { ...task, status: finishColumn.id as TaskStatus}
            : task
        )
      );

      fetch(`http://127.0.0.1:5000/api/tasks/${draggableId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: finishColumn.id }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Task moved:", data) 
      })
      .catch((err) => console.error("Failed to update task:", err))
    
    }
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