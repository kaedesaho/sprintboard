import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import ProjectHeader from '../components/ProjectHeader';

const ProjectLayout = () => {
    const { projectID } = useParams();
    const { userID } = useAuth();
    const { project, setProject } = useProject();
    const location = useLocation();

    const hideHeader = location.pathname.endsWith('/user-settings')
        || location.pathname.includes('/tasks/create')
        || /\/tasks\/[^/]+$/.test(location.pathname);

    useEffect(() => {
        if (!projectID || !userID) return;

        fetch(`http://127.0.0.1:5000/api/projects/${projectID}?user_id=${userID}`)
            .then(res => res.json())
            .then(setProject)
            .catch(console.error);

        return () => setProject(null);
    }, [projectID, userID]);

    if (!project) return <p>Loading...</p>;

    return (
        <>
            {!hideHeader && <ProjectHeader />}
            <Outlet context={project} />
        </>
    );
};

export default ProjectLayout;
