type Mode = 'create' | 'edit';

interface ProjectFormProps {
  mode: Mode;
}

const ProjectForm = ({ mode }: ProjectFormProps) => {
    const isEditMode = mode === 'edit';
    return (
        <div>
            <h1>{isEditMode ? 'Edit Project' : 'Create Project'}</h1>
        </div>
    );
}

export default ProjectForm;