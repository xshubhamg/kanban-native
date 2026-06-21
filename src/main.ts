import './style.css';

// --- Types ---
interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  color: string; // CSS color variable name or hex
}

interface BoardState {
  columns: Column[];
  tasks: Task[];
}

// --- Initial State ---
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

// --- State Management ---
class KanbanBoard {
  private state: BoardState = { columns: [], tasks: [] };
  private searchTerm: string = '';

  constructor() {
    this.loadState();
    this.render();
    this.setupGlobalEvents();
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

  // --- Actions ---
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
    this.render();
  }

  public updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'columnId' | 'createdAt'>>) {
    this.state.tasks = this.state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    this.saveState();
    this.render();
  }

  public deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
    this.render();
  }

  public addColumn(title: string, color: string) {
    const column: Column = {
      id: `column-${Date.now()}`,
      title,
      color
    };
    this.state.columns.push(column);
    this.saveState();
    this.render();
  }

  public deleteColumn(id: string) {
    // Also delete or orphan tasks? We'll delete them for cleanliness.
    this.state.columns = this.state.columns.filter(c => c.id !== id);
    this.state.tasks = this.state.tasks.filter(t => t.columnId !== id);
    this.saveState();
    this.render();
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
    this.render();
  }

  // --- Rendering UI ---
  private render() {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = '';

    // Header
    const header = this.createHeader();
    app.appendChild(header);

    // Board Container
    const board = document.createElement('main');
    board.className = 'board';

    const filteredTasks = this.state.tasks.filter(t => 
      t.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.state.columns.forEach(column => {
      const columnEl = this.createColumnElement(column, filteredTasks.filter(t => t.columnId === column.id));
      board.appendChild(columnEl);
    });

    app.appendChild(board);
    this.setupModals();
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.innerHTML = `
      <div class="title-area">
        <h1>Kanban Flow</h1>
        <p>A native, zero-dependency task board</p>
      </div>
      <div class="controls">
        <input type="text" class="search-input" id="search-bar" placeholder="Search tasks..." value="${this.searchTerm}">
        <button class="btn btn-secondary" id="btn-add-column">+ Add Column</button>
        <button class="btn btn-primary" id="btn-add-task">+ New Task</button>
      </div>
    `;

    // Search event
    const searchInput = header.querySelector<HTMLInputElement>('#search-bar')!;
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value;
      this.render();
      // Keep focus on input after re-render
      const newSearchInput = document.querySelector<HTMLInputElement>('#search-bar')!;
      newSearchInput.focus();
      newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
    });

    // Add column button
    header.querySelector('#btn-add-column')!.addEventListener('click', () => {
      const dialog = document.querySelector<HTMLDialogElement>('#dialog-add-column')!;
      dialog.showModal();
    });

    // Add task button
    header.querySelector('#btn-add-task')!.addEventListener('click', () => {
      const dialog = document.querySelector<HTMLDialogElement>('#dialog-add-task')!;
      dialog.showModal();
    });

    return header;
  }

  private createColumnElement(column: Column, columnTasks: Task[]): HTMLElement {
    const col = document.createElement('section');
    col.className = 'column';
    col.dataset.columnId = column.id;

    col.innerHTML = `
      <div class="column-header">
        <div class="column-title-wrapper">
          <span class="column-dot" style="background-color: ${column.color}"></span>
          <h2 class="column-title">${column.title}</h2>
          <span class="column-count">${columnTasks.length}</span>
        </div>
        <button class="column-actions" title="Delete column">×</button>
      </div>
      <div class="tasks-list" data-column-id="${column.id}">
        ${columnTasks.length === 0 ? '<div class="empty-state">No tasks here yet</div>' : ''}
      </div>
    `;

    // Delete column action
    col.querySelector('.column-actions')!.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete column "${column.title}" and all its tasks?`)) {
        this.deleteColumn(column.id);
      }
    });

    const tasksList = col.querySelector<HTMLElement>('.tasks-list')!;
    
    columnTasks.forEach(task => {
      const card = this.createCardElement(task);
      tasksList.appendChild(card);
    });

    // --- Column Drag & Drop Handling ---
    tasksList.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      const draggingCard = document.querySelector('.task-card.dragging') as HTMLElement;
      if (!draggingCard) return;

      const afterElement = this.getDragAfterElement(tasksList, e.clientY);
      
      // Visual feedback of card placement
      const emptyState = tasksList.querySelector('.empty-state');
      if (emptyState) {
        emptyState.remove();
      }

      if (afterElement == null) {
        tasksList.appendChild(draggingCard);
      } else {
        tasksList.insertBefore(draggingCard, afterElement);
      }
    });

    tasksList.addEventListener('dragenter', () => {
      col.classList.add('drag-over');
    });

    tasksList.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    tasksList.addEventListener('drop', (e: DragEvent) => {
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer?.getData('text/plain');
      if (!taskId) return;

      // Find the card visually below this one
      const draggingCard = document.querySelector('.task-card.dragging') as HTMLElement;
      const nextSibling = draggingCard?.nextElementSibling as HTMLElement | null;
      const afterTaskId = nextSibling?.dataset.taskId || null;

      this.moveTask(taskId, column.id, afterTaskId);
    });

    return col;
  }

  private createCardElement(task: Task): HTMLElement {
    const card = document.createElement('article');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;

    const priorityClass = `tag priority-${task.priority}`;
    const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6';
    const bgLight = task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';

    card.innerHTML = `
      <div class="task-card-header">
        <h3 class="task-title">${task.title}</h3>
      </div>
      <p class="task-desc">${task.description || 'No description provided.'}</p>
      <div class="task-meta">
        <div class="task-labels">
          <span class="${priorityClass}" style="color: ${priorityColor}; background-color: ${bgLight}">${task.priority}</span>
        </div>
        <div class="task-date">${new Date(task.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
      </div>
    `;

    // --- Card Drag Event Listeners ---
    card.addEventListener('dragstart', (e: DragEvent) => {
      card.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
      }
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      // Refresh board layout to ensure state is clean
      this.render();
    });

    // Card Double Click to edit
    card.addEventListener('dblclick', () => {
      this.showEditTaskModal(task);
    });

    return card;
  }

  // --- Helper to calculate drop slot ---
  private getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
    const draggableElements = Array.from(container.querySelectorAll('.task-card:not(.dragging)'));

    return draggableElements.reduce<{ offset: number; element: HTMLElement | null }>((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child as HTMLElement };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  // --- Modals implementation ---
  private setupModals() {
    // If dialogs already exist, remove them first to avoid duplicates
    document.querySelectorAll('dialog').forEach(d => d.remove());

    const body = document.body;

    // 1. Add Task Dialog
    const addTaskDialog = document.createElement('dialog');
    addTaskDialog.id = 'dialog-add-task';
    
    const columnOptions = this.state.columns.map(c => `<option value="${c.id}">${c.title}</option>`).join('');

    addTaskDialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">New Task</h2>
        <button class="modal-close" id="close-add-task">&times;</button>
      </div>
      <form id="form-add-task">
        <div class="form-group">
          <label class="form-label" for="task-title">Title</label>
          <input type="text" class="form-input" id="task-title" required placeholder="What needs to be done?">
        </div>
        <div class="form-group">
          <label class="form-label" for="task-desc">Description</label>
          <textarea class="form-textarea" id="task-desc" rows="3" placeholder="Add some details..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="task-col">Column</label>
          <select class="form-select" id="task-col">${columnOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label" for="task-priority">Priority</label>
          <select class="form-select" id="task-priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-task">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Task</button>
        </div>
      </form>
    `;

    body.appendChild(addTaskDialog);

    // Event Handlers for Add Task
    const formAddTask = addTaskDialog.querySelector<HTMLFormElement>('#form-add-task')!;
    const closeAdd = () => {
      formAddTask.reset();
      addTaskDialog.close();
    };

    addTaskDialog.querySelector('#close-add-task')!.addEventListener('click', closeAdd);
    addTaskDialog.querySelector('#btn-cancel-task')!.addEventListener('click', closeAdd);

    formAddTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('task-title') as HTMLInputElement).value;
      const desc = (document.getElementById('task-desc') as HTMLTextAreaElement).value;
      const columnId = (document.getElementById('task-col') as HTMLSelectElement).value;
      const priority = (document.getElementById('task-priority') as HTMLSelectElement).value as 'low' | 'medium' | 'high';

      this.addTask(title, desc, columnId, priority);
      closeAdd();
    });

    // 2. Add Column Dialog
    const addColDialog = document.createElement('dialog');
    addColDialog.id = 'dialog-add-column';
    addColDialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">New Column</h2>
        <button class="modal-close" id="close-add-column">&times;</button>
      </div>
      <form id="form-add-column">
        <div class="form-group">
          <label class="form-label" for="col-title">Column Title</label>
          <input type="text" class="form-input" id="col-title" required placeholder="e.g. Done">
        </div>
        <div class="form-group">
          <label class="form-label" for="col-color">Color</label>
          <select class="form-select" id="col-color">
            <option value="var(--column-todo)">Blue</option>
            <option value="var(--column-progress)">Yellow</option>
            <option value="var(--column-review)">Purple</option>
            <option value="var(--column-done)">Green</option>
            <option value="#f43f5e">Rose</option>
            <option value="#06b6d4">Cyan</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-column">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Column</button>
        </div>
      </form>
    `;

    body.appendChild(addColDialog);

    // Event Handlers for Add Column
    const formAddCol = addColDialog.querySelector<HTMLFormElement>('#form-add-column')!;
    const closeCol = () => {
      formAddCol.reset();
      addColDialog.close();
    };

    addColDialog.querySelector('#close-add-column')!.addEventListener('click', closeCol);
    addColDialog.querySelector('#btn-cancel-column')!.addEventListener('click', closeCol);

    formAddCol.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('col-title') as HTMLInputElement).value;
      const color = (document.getElementById('col-color') as HTMLSelectElement).value;

      this.addColumn(title, color);
      closeCol();
    });

    // 3. Edit Task Dialog (Dynamically generated on double click)
    const editTaskDialog = document.createElement('dialog');
    editTaskDialog.id = 'dialog-edit-task';
    body.appendChild(editTaskDialog);
  }

  private showEditTaskModal(task: Task) {
    const editDialog = document.querySelector<HTMLDialogElement>('#dialog-edit-task')!;
    
    editDialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Edit Task</h2>
        <button class="modal-close" id="close-edit-task">&times;</button>
      </div>
      <form id="form-edit-task">
        <div class="form-group">
          <label class="form-label" for="edit-title">Title</label>
          <input type="text" class="form-input" id="edit-title" value="${task.title}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-desc">Description</label>
          <textarea class="form-textarea" id="edit-desc" rows="3">${task.description}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-priority">Priority</label>
          <select class="form-select" id="edit-priority">
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
          </select>
        </div>
        <div class="form-actions" style="justify-content: space-between;">
          <button type="button" class="btn btn-secondary" id="btn-delete-task" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2)">Delete Task</button>
          <div style="display: flex; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-edit">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </form>
    `;

    editDialog.showModal();

    const formEdit = editDialog.querySelector<HTMLFormElement>('#form-edit-task')!;
    const closeEdit = () => {
      editDialog.close();
    };

    editDialog.querySelector('#close-edit-task')!.addEventListener('click', closeEdit);
    editDialog.querySelector('#btn-cancel-edit')!.addEventListener('click', closeEdit);

    editDialog.querySelector('#btn-delete-task')!.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this task?')) {
        this.deleteTask(task.id);
        closeEdit();
      }
    });

    formEdit.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('edit-title') as HTMLInputElement).value;
      const desc = (document.getElementById('edit-desc') as HTMLTextAreaElement).value;
      const priority = (document.getElementById('edit-priority') as HTMLSelectElement).value as 'low' | 'medium' | 'high';

      this.updateTask(task.id, { title, description: desc, priority });
      closeEdit();
    });
  }

  private setupGlobalEvents() {
    // Backdrop click cancels dialog
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'DIALOG') {
        (target as HTMLDialogElement).close();
      }
    });
  }
}

// Initialize Board on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new KanbanBoard();
});
