import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { Project } from "../types/project";
import { useAuth } from "../context/AuthContext"; 
import "./Dashboard.css";


const Dashboard = () => {
    const { userID } = useAuth()
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true)

    useEffect (() => {
        if (!userID) return;

        const fetchProjects = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/projects/user/${userID}`)
                const data = await res.json()
                const mappedProjects = data.map((p: any) => ({
                    id: p.project_id.toString(),
                    title: p.title,
                    description: p.description || "",
                    role: p.role,
                    last_updated: p.last_updated,
            }));
            setProjects(mappedProjects);
            } catch (err) {
                console.error("Failed to fetch projects", err);
            } finally {
                setLoading(false)
            }
        };
        fetchProjects();
    }, [userID]);

    if (loading) return <p>Loading projects...</p>;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>My Projects</h1>
                <Link to="/create-project" className="create-project-btn">Create New Project</Link>
            </div>

            <hr className="dashboard-separator" />
            
            {projects.length == 0 ? (
                <p>No projects found</p>
            ) : (
                projects.map(project => (
                <ProjectCard key={project.id} project={project} />
                ))
            )}
        </div>
    );
};

export default Dashboard;