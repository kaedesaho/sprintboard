import { Link, useParams, useSearchParams, useOutletContext } from 'react-router-dom';
import { ViewMode, allowedViews } from '../types/view';
import { parseEnum } from '../utils/parseEnum';
import { Project } from '../types/project';
import "./Project.css";
import ProjectTasks from '../components/ProjectTasks';

const ProjectHome = () => {
    const { projectID } = useParams();
    const project = useOutletContext<Project>();
    const [searchParams] = useSearchParams();
    const view: ViewMode = parseEnum(searchParams.get("view"), allowedViews, "list");

    return (
        <div className="project">
            <div className="project-toolbar">
                <Link to={`/projects/${projectID}/tasks/create?view=${view}`} className="create-task-btn">
                    Create Task
                </Link>
            </div>

            <ProjectTasks projectID={project.id} curSprint={project.cur_sprint} />
        </div>
    );
};

export default ProjectHome;
