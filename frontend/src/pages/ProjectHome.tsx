import { AiOutlineInfoCircle, AiOutlineEdit, AiOutlineClockCircle, AiOutlineTeam } from 'react-icons/ai';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Project } from "../types/project"; 
import "./Project.css";
import ProjectTasks from '../components/ProjectTasks';


const ProjectHome = () => {
    const { projectID } = useParams();
    const { userID } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [searchParams, setSearchParams] = useSearchParams()
    const view = (searchParams.get("view") as "list" | "kanban") || "list"

    useEffect(() => {
    if (!projectID || !userID) return;

    fetch(`http://127.0.0.1:5000/api/projects/${projectID}?user_id=${userID}`)
      .then(res => res.json())
      .then(setProject)
      .catch(console.error);
  }, [projectID, userID]);

  if (!project) return <p>Loading...</p>;

    return (
        <div className="project">
            <div className="project-header">
                <div className='project-header-left'>
                    <h1>{project.title}</h1>
                    <div className="info-tooltip">
                        <AiOutlineInfoCircle className='info-icon'/>
                        <span className="tooltip-text">{project.description}</span>
                    </div>
            
                    <Link to="/members" className="info-btn">
                        <AiOutlineTeam className="icon" />
                        {project.role}
                    </Link>

                    <p className='project-info'>
                        <AiOutlineClockCircle className="icon" />
                        {new Date(project.last_updated).toLocaleDateString()}
                    </p>

                    {project.role === 'Admin' && (
                    <Link to={`/projects/${project.id}/edit`} className="info-btn">
                        <AiOutlineEdit className="icon" />
                    </Link>
                    )}
                </div>
                <div className='project-header-right'>
                    <Link to={`/projects/${project.id}/tasks/create?view=${view}`} className="create-task-btn">Create Task</Link>
                </div>
            </div>

            <hr className="project-separator" />

        <ProjectTasks projectID={project.id}/>
            
        </div>
    );
};

export default ProjectHome;