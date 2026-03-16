export interface Project {
    id: string;
    title: string;
    description?: string;
    role: string;
    cur_sprint: number;
    updated_at: string;
    created_at: string;
}