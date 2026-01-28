
export type TaskStatus =
    | 'backlog'
    | 'todo'
    | 'in_progress'
    | 'testing'
    | 'review'
    | 'blocked'
    | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: TaskPriority;
    sprint?: number;
    start_date?: string;
    end_date?: string;
    time_estimation?: number;
    created_at: string;
    updated_at: string;
    dependency_ids?: number[];
    category_ids?: number[];
    assignees?: number[];
}
