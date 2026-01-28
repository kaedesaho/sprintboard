import { AiOutlineInfoCircle, AiOutlineEdit, AiOutlineClockCircle, AiOutlineTeam } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { Project } from '../types/project';
import './ProjectCard.css';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <Link to={`/project/${project.id}`} state={{ project }} className="project-card">
            <div className='card-left'>
                <h2>{project.title}</h2>
            <div className="info-tooltip">
                <AiOutlineInfoCircle className='info'/>
                <span className="tooltip-text">{project.description}</span>
            </div>
            </div>
            <div className='card-right'>    
                <p className='project-role'>
                    <AiOutlineTeam className="icon" />
                    {project.role}
                </p>
                <p className='project-last-updated'>
                    <AiOutlineClockCircle className="icon" />
                    {new Date(project.last_updated).toLocaleDateString()}
                </p>
            </div>
        </Link>
    )
};

export default ProjectCard;