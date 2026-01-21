import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { Project } from "../types/project";
import "./Dashboard.css";

const dummyProjects: Project[] = [
    {
        id: '1',
        title: 'Project A',
        description: 'Description for Project A',
        role: 'Admin',
        lastUpdated: 'Today',
    },
    {
        id: '2',
        title: 'Project B',
        description: 'Description for Project B',
        role: 'Member',
        lastUpdated: '4 days ago',
    },
    {
        id: '3',
        title: 'Project C',
        role: 'Member',
        lastUpdated: '5 months ago',
    },
];

const Dashboard = () => {
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>My Projects</h1>
                <Link to="/create-project" className="create-project-btn">Create New Project</Link>
            </div>

            <hr className="dashboard-separator" />

            {dummyProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
};

export default Dashboard;