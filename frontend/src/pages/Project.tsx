import { AiOutlineInfoCircle, AiOutlineEdit, AiOutlineClockCircle, AiOutlineTeam } from 'react-icons/ai';
import { useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import "./Project.css";

const Project = () => {
    const location = useLocation();
    const project = location.state?.project;

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
                        {project.lastUpdated}
                    </p>

                    {project.role === 'Admin' && (
                    <Link to={`/edit-project/${project.id}`} className="info-btn">
                        <AiOutlineEdit className="icon" />
                    </Link>
                    )}
                </div>
                <div className='project-header-right'>
                    <Link to="/create-task" className="create-task-btn">Create Task</Link>
                </div>
            </div>

            <hr className="project-separator" />
            <p>Project Details</p>
        </div>
    );
};

export default Project;