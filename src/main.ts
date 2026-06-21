import './style.css';
import { KanbanStore } from './store';
import { Header } from './components/Header';
import { Column } from './components/Column';
import { Dialogs } from './components/Dialogs';

class KanbanApp {
  private store: KanbanStore;
  private appContainer: HTMLDivElement;
  private boardContainer!: HTMLElement;
  private currentTheme: 'light' | 'dark' | 'system' = 'system';

  constructor() {
    this.store = new KanbanStore();
    this.appContainer = document.querySelector<HTMLDivElement>('#app')!;
    this.initTheme();
    this.init();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('kanban_theme') as 'light' | 'dark' | 'system' | null;
    this.currentTheme = savedTheme || 'system';
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark' | 'system') {
    this.currentTheme = theme;
    localStorage.setItem('kanban_theme', theme);

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (theme === 'light') {
      root.classList.add('theme-light');
    } else if (theme === 'dark') {
      root.classList.add('theme-dark');
    }
    // If theme is 'system', we don't add either, so CSS media query naturally takes over.
  }

  private init() {
    // Render Header once (preserves focus during search, renders theme toggles)
    const header = Header.render(this.store.getSearchTerm(), this.currentTheme);
    this.appContainer.appendChild(header);

    // Render Dialogs once
    Dialogs.render(this.store.getState().columns);

    // Render Board main container once
    this.boardContainer = document.createElement('main');
    this.boardContainer.className = 'board';
    this.appContainer.appendChild(this.boardContainer);

    // Initial board paint
    this.renderBoard();

    // Bind event listeners
    this.setupEventListeners();
  }

  private renderBoard() {
    this.boardContainer.innerHTML = '';
    const state = this.store.getState();
    const filteredTasks = this.store.getFilteredTasks();

    state.columns.forEach(column => {
      const colTasks = filteredTasks.filter(t => t.columnId === column.id);
      const colEl = Column.render(column, colTasks);
      this.boardContainer.appendChild(colEl);
    });
  }

  private setupEventListeners() {
    // Search handler
    this.appContainer.addEventListener('kanban-search', (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      this.store.setSearchTerm(customEvent.detail.query);
      this.renderBoard();
    });

    // Theme toggle handler
    this.appContainer.addEventListener('kanban-theme-change', (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: 'light' | 'dark' | 'system' }>;
      this.applyTheme(customEvent.detail.theme);
    });

    // Create Task handler
    this.appContainer.addEventListener('kanban-create-task', (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        description: string;
        columnId: string;
        priority: 'low' | 'medium' | 'high';
      }>;
      const { title, description, columnId, priority } = customEvent.detail;
      this.store.addTask(title, description, columnId, priority);
      this.renderBoard();
    });

    // Update Task handler
    this.appContainer.addEventListener('kanban-update-task', (e: Event) => {
      const customEvent = e as CustomEvent<{
        id: string;
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
      }>;
      const { id, title, description, priority } = customEvent.detail;
      this.store.updateTask(id, { title, description, priority });
      this.renderBoard();
    });

    // Delete Task handler
    this.appContainer.addEventListener('kanban-delete-task', (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      this.store.deleteTask(customEvent.detail.id);
      this.renderBoard();
    });

    // Create Column handler
    this.appContainer.addEventListener('kanban-create-column', (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; color: string }>;
      const { title, color } = customEvent.detail;
      this.store.addColumn(title, color);
      Dialogs.updateColumns(this.store.getState().columns);
      this.renderBoard();
    });

    // Delete Column handler
    this.appContainer.addEventListener('kanban-delete-column', (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; title: string }>;
      const { id, title } = customEvent.detail;
      if (confirm(`Are you sure you want to delete column "${title}" and all its tasks?`)) {
        this.store.deleteColumn(id);
        Dialogs.updateColumns(this.store.getState().columns);
        this.renderBoard();
      }
    });

    // Move Task handler (drag & drop)
    this.appContainer.addEventListener('kanban-move-task', (e: Event) => {
      const customEvent = e as CustomEvent<{
        taskId: string;
        targetColumnId: string;
        afterTaskId: string | null;
      }>;
      const { taskId, targetColumnId, afterTaskId } = customEvent.detail;
      this.store.moveTask(taskId, targetColumnId, afterTaskId);
      this.renderBoard();
    });

    // Drag End handler (resets temporary DOM manipulations on target lists)
    this.appContainer.addEventListener('kanban-dragend', () => {
      this.renderBoard();
    });

    // Modal Trigger triggers
    this.appContainer.addEventListener('kanban-open-add-task-modal', () => {
      Dialogs.showAddTask();
    });

    this.appContainer.addEventListener('kanban-open-add-column-modal', () => {
      Dialogs.showAddColumn();
    });

    this.appContainer.addEventListener('kanban-open-edit-modal', (e: Event) => {
      const customEvent = e as CustomEvent<{ task: any }>;
      Dialogs.showEditTask(customEvent.detail.task);
    });

    // Backdrop click cancels dialog
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'DIALOG') {
        (target as HTMLDialogElement).close();
      }
    });
  }
}

// Initialize App on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new KanbanApp();
});
