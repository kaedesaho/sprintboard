import { useOutletContext } from 'react-router-dom';
import { type Project } from '../types/project';
import "./Project.css";
import ProjectTasks from '../components/ProjectTasks';

const Tasks = () => {
    const project = useOutletContext<Project>();

    return (
        <div className="project">
            <ProjectTasks projectID={project.id} curSprint={project.cur_sprint} />
        </div>
    );
};

export default Tasks;
