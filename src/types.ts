export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
}

export interface Column {
  id: string;
  title: string;
  color: string; // CSS color variable name or hex
}

export interface BoardState {
  columns: Column[];
  tasks: Task[];
}
