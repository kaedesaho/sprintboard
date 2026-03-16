import { AiOutlineInfoCircle, AiOutlineEdit, AiOutlineClockCircle, AiOutlineTeam } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { Project } from '../types/project';
import './ProjectCard.css';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <Link to={`/projects/${project.id}`} 
        state={{ project }} 
        className="project-card"
        >

            <div className='card-header'>
                <h2>{project.title}</h2>

                {project.cur_sprint && (
                <h3>Sprint {project.cur_sprint}</h3>
                )}
               </div>

                <p>{project.description}</p>

                <div className='card-dates'>
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
            
        </Link>
    )
};

export default ProjectCard;