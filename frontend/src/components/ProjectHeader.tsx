import { useProject } from "../context/ProjectContext";
import "./ProjectHeader.css";

const ProjectHeader = () => {
    const { project } = useProject();
    if (!project) return null;

    return (
        <div className="project-header">
            <h1 className="project-header-title">{project.title}</h1>
            {project.cur_sprint != null && (
                <span className="project-header-sprint">Sprint {project.cur_sprint}</span>
            )}
        </div>
    );
};

export default ProjectHeader;
