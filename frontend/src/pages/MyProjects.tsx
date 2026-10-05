import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Masonry from "react-masonry-css";
import ProjectCard from "../components/ProjectCard";
import { type Project } from "../types/project";
import { useAuth } from "../context/AuthContext";
import "./MyProjects.css";


const MyProjects = () => {
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
                    cur_sprint: p.cur_sprint || "",
                    description: p.description || "",
                    role: p.role,
                    updated_at: p.updated_at,
                    created_at: p.created_at
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

    const breakpointColumnsObj = {
    default: 2,
  768: 1,
  };

    if (loading) return <p>Loading projects...</p>;

    return (
        <div className="my-projects">
            <div className="my-projects-header">
                <h1>My Projects</h1>
                <Link to="/create-project" className="create-project-btn">Create New Project</Link>
            </div>

            <hr className="my-projects-separator" />
            {projects.length == 0 ? (
                <p>No projects found</p>
            ) : (
                <Masonry
                breakpointCols={breakpointColumnsObj}
                className="project-cards-masonry"
                columnClassName="project-cards-column"
                >
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                </Masonry>
            )}
            </div>
    );
};

export default MyProjects;
