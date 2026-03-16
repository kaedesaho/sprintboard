import { createContext, useContext, useState } from "react";
import { Project } from "../types/project";

interface ProjectContextValue {
    project: Project | null;
    setProject: (p: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextValue>({
    project: null,
    setProject: () => {}
});

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [project, setProject] = useState<Project | null>(null);
    return (
        <ProjectContext.Provider value={{ project, setProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
