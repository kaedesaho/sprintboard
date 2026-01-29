import { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "../types/task"
import { useParams, Link, useNavigate } from "react-router-dom";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import "./TaskForm.css"

export type TaskFormData = {
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: TaskPriority;
    sprint?: number;
    start_date?: string;
    end_date?: string;
    time_estimation?: number;
    dependency_ids?: number[];
    category_ids?: number[];
    assignees?: number[];
};

interface TaskFormProps {
    mode: 'create' | 'edit';
    initialValues?: Task;
    tasks: { id: number; title: string }[];
    users: { id: number; username: string }[];
    categories: { id: number; name: string}[]; 
    onSubmit: (data: TaskFormData) => void;
    onDelete?: () => void;
    onCategoryCreated?: (newCat: { id: number; name: string }) => void;
    view: "list" | "kanban";
}

const TaskForm = ({ 
    mode, initialValues, tasks, categories, users, onSubmit, onDelete, onCategoryCreated, view
}:TaskFormProps) => {
    const navigate = useNavigate();
    const { projectID } = useParams(); 
    const [form, setForm] = useState<TaskFormData>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    status: initialValues?.status ?? "backlog",
    priority: initialValues?.priority,
    sprint: initialValues?.sprint,
    start_date: initialValues?.start_date,
    end_date: initialValues?.end_date,
    time_estimation: initialValues?.time_estimation,
    dependency_ids: initialValues?.dependency_ids ?? [],
    category_ids: initialValues?.category_ids ?? [],
    assignees: initialValues?.assignees ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form)
    };

    const handleCreate = async (inputValue: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/tasks/categories/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: inputValue, project_id: projectID })
        });

        if (!res.ok) throw new Error("Failed to create category");

        const newCategory = await res.json();
        console.log("Category created:", newCategory);

        setForm(prev => ({
        ...prev,
        category_ids: [...(prev.category_ids || []), newCategory.id]
        }));

        onCategoryCreated?.(newCategory);
        
    } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="task-form-container"
        onClick={() => navigate(`/projects/${projectID}?view=${view}`)}>
            <form className="task-form" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
                <div className="task-form-left">
                    <label htmlFor="title">Title</label>
                    <input 
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    />

                    <label htmlFor="description">Description</label>
                    <textarea 
                    id="description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    />

                    <label htmlFor="members">Members</label>
                    <Select
                    id="members"
                    isMulti
                    options={users.map(u => ({ value: u.id, label: u.username }))}
                    value={form.assignees?.map(id => ({ value: id, label: users.find(u => u.id === id)?.username }))}
                    onChange={selected => setForm({
                        ...form,
                        assignees: selected.map((s: any) => s.value)
                    })}
                    />
                </div>
                <div className="task-form-right">
                    <div className="form-column">
                        <div className="form-column-left">
                            <label htmlFor="status">Status</label>
                            <select
                            id="status"
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}
                            >
                                <option value="backlog">Backlog</option>
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="testing">Testing</option>
                                <option value="review">Review</option>
                                <option value="blocked">Blocked</option>
                                <option value="done">Done</option>
                            </select>

                            <label htmlFor="priority">Priority</label>
                            <select
                            id="priority"
                            value={form.priority ?? ""}
                            onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                            >
                                <option value="">Select</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>

                        </div>
                        <div className="form-column-right">
                            <label htmlFor="time_estimation">Time Estimate</label>
                            <input
                            id="time_estimation"
                            type="number"
                            value={form.time_estimation ?? ""}
                            onChange={e => setForm({ ...form, time_estimation: Number(e.target.value) })}
                            />
                            
                            <label htmlFor="sprint">Sprint</label>
                            <input
                            id="sprint"
                            type="number"
                            value={form.sprint ?? ""}
                            onChange={e => setForm({ ...form, sprint: Number(e.target.value) })}
                            />

                        </div>
                    </div>

                    <label htmlFor="start_date">Start Date</label>
                    <input
                    id="start_date"
                    type="date"
                    value={form.start_date ?? ""}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    />

                    <label htmlFor="end_date">End Date</label>
                    <input
                    id="end_date"
                    type="date"
                    value={form.end_date ?? ""}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    />

                    <label htmlFor="dependency">Dependency</label>
                    <Select
                    id="dependency"
                    isMulti
                    options={tasks
                        .filter(t => t.id !== initialValues?.id)
                        .map(t => ({ value: t.id, label: t.title}))}
                    onChange={selected => setForm({
                        ...form,
                        dependency_ids: selected.map((s: any) => s.value)
                    })}
                    />

                    <label htmlFor="category">Category</label>
                    <CreatableSelect
                    isMulti
                    options={categories?.map(c => ({ value: c.id, label: c.name })) ?? []}
                    value={form.category_ids
                        ?.map(id => {
                            const cat = categories?.find(c => c.id === id);
                            return cat ? { value: cat.id, label: cat.name } : null;
                        })
                        .filter(Boolean) ?? []}
                    onChange={(selected) =>
                        setForm({
                            ...form,
                            category_ids: selected.map((s: any) => s.value),
                        })
                    }
                    onCreateOption={handleCreate}
                    />

                    <div className="form-buttons">
                        <Link to={`/projects/${projectID}?view=${view}`} className="cancel">Cancel</Link>
                        <button type="submit" className="">
                        {mode === "edit" ? "Update Task" : "Create Task"}
                        </button>

                        {mode === "edit" && onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className=""
                        >
                            Delete
                        </button>
                        )}
                    </div>
                </div>
            </form>
        </div>

    );
};

export default TaskForm;