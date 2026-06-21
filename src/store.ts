import type { BoardState, Column, Task } from './types';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'var(--column-todo)' },
  { id: 'progress', title: 'In Progress', color: 'var(--column-progress)' },
  { id: 'review', title: 'Under Review', color: 'var(--column-review)' },
  { id: 'done', title: 'Completed', color: 'var(--column-done)' }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Initialize Kanban Board',
    description: 'Set up Vite, TypeScript, and clean CSS variables.',
    columnId: 'done',
    createdAt: Date.now() - 3600000 * 24,
    priority: 'high'
  },
  {
    id: 'task-2',
    title: 'Implement Drag and Drop API',
    description: 'Bind native HTML5 drag-and-drop event handlers to columns and cards.',
    columnId: 'progress',
    createdAt: Date.now() - 3600000 * 4,
    priority: 'high'
  },
  {
    id: 'task-3',
    title: 'Add Search & Filter',
    description: 'Filter cards dynamically by title, description, or level of priority.',
    columnId: 'todo',
    createdAt: Date.now() - 3600000,
    priority: 'medium'
  },
  {
    id: 'task-4',
    title: 'Polished Glassmorphism Theme',
    description: 'Create smooth shadows, glass border styles, and clean micro-interactions.',
    columnId: 'todo',
    createdAt: Date.now(),
    priority: 'low'
  }
];

export class KanbanStore {
  private state: BoardState = { columns: [], tasks: [] };
  private searchTerm: string = '';

  constructor() {
    this.loadState();
  }

  public getState(): BoardState {
    return this.state;
  }

  public getSearchTerm(): string {
    return this.searchTerm;
  }

  public setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  public getFilteredTasks(): Task[] {
    const query = this.searchTerm.toLowerCase().trim();
    if (!query) {
      return this.state.tasks;
    }
    return this.state.tasks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }

  private loadState() {
    const saved = localStorage.getItem('kanban_board_state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Failed to load board state', e);
      }
    }
    this.state = {
      columns: [...DEFAULT_COLUMNS],
      tasks: [...DEFAULT_TASKS]
    };
    this.saveState();
  }

  private saveState() {
    localStorage.setItem('kanban_board_state', JSON.stringify(this.state));
  }

  public addTask(title: string, description: string, columnId: string, priority: 'low' | 'medium' | 'high') {
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      columnId,
      createdAt: Date.now(),
      priority
    };
    this.state.tasks.push(task);
    this.saveState();
    return task;
  }

  public updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'columnId' | 'createdAt'>>) {
    this.state.tasks = this.state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    this.saveState();
  }

  public deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
  }

  public addColumn(title: string, color: string) {
    const column: Column = {
      id: `column-${Date.now()}`,
      title,
      color
    };
    this.state.columns.push(column);
    this.saveState();
    return column;
  }

  public deleteColumn(id: string) {
    this.state.columns = this.state.columns.filter(c => c.id !== id);
    this.state.tasks = this.state.tasks.filter(t => t.columnId !== id);
    this.saveState();
  }

  public moveTask(taskId: string, targetColumnId: string, afterTaskId: string | null) {
    const tasks = [...this.state.tasks];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const [task] = tasks.splice(taskIndex, 1);
    task.columnId = targetColumnId;

    if (afterTaskId === null) {
      // Put at the end of the target column's tasks
      tasks.push(task);
    } else {
      const targetIndex = tasks.findIndex(t => t.id === afterTaskId);
      if (targetIndex !== -1) {
        tasks.splice(targetIndex, 0, task);
      } else {
        tasks.push(task);
      }
    }

    this.state.tasks = tasks;
    this.saveState();
  }
}
