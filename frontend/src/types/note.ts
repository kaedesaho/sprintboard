export type NoteType = 'meeting' | 'retrospective' | 'personal' | 'task-related' | 'documentation';

export interface Note {
  id: number;
  project_id: number;
  title: string;
  note_type: NoteType;
  sprint_num?: number | null;
  creator_id: number;
  leader_id?: number | null;
  leader_name?: string | null;
  note_taker_id?: number | null;
  note_taker_name?: string | null;
  planned_time?: string | null;
  place?: string | null;
  content: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}
