import TaskCard from "./TaskCard"
import { type ColumnData as ColumnType } from "./types"
import { type Task } from "../../../types/task"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import { type ViewMode } from "../../../types/view"
import "./Kanban.css"

type ColumnProps = {
  column: ColumnType
  tasks: Task[]
  projectID: string
  view: ViewMode
}

export default function Column({ column, tasks, projectID, view }: ColumnProps) {
  return (
    <div className="column">
        <h3 className="column-title">{column.title}</h3>

          <Droppable droppableId={column.id}>
            {(provided) => (
              <div
                className="task-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tasks.map((task, index) => (
                  <Draggable
                    key={task.id.toString()}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                      >
                        <TaskCard 
                        task={task} 
                        projectID={projectID}
                        view={view}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
      </div>
  )
}
