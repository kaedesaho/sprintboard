import { Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';

const ProjectLayout = () => {
    const { projectID } = useParams();
    const { userID } = useAuth();
    const { project, setProject } = useProject();

    useEffect(() => {
        if (!projectID || !userID) return;

        fetch(`http://127.0.0.1:5000/api/projects/${projectID}?user_id=${userID}`)
            .then(res => res.json())
            .then(setProject)
            .catch(console.error);

        return () => setProject(null);
    }, [projectID, userID]);

    if (!project) return <p>Loading...</p>;

    return <Outlet context={project} />;
};

export default ProjectLayout;
