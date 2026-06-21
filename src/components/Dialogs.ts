import type { Column, Task } from '../types';
import { Icons } from './Icons';

export class Dialogs {
  private static columns: Column[] = [];

  public static render(columns: Column[]): void {
    this.columns = columns;

    // Remove existing dialogs to avoid duplicates
    document.querySelectorAll('dialog').forEach(d => d.remove());

    const body = document.body;

    // 1. Add Task Dialog
    const addTaskDialog = document.createElement('dialog');
    addTaskDialog.id = 'dialog-add-task';
    this.populateAddTaskDialog(addTaskDialog);
    body.appendChild(addTaskDialog);

    // 2. Add Column Dialog
    const addColDialog = document.createElement('dialog');
    addColDialog.id = 'dialog-add-column';
    this.populateAddColumnDialog(addColDialog);
    body.appendChild(addColDialog);

    // 3. Edit Task Dialog (Container to be populated dynamically)
    const editTaskDialog = document.createElement('dialog');
    editTaskDialog.id = 'dialog-edit-task';
    body.appendChild(editTaskDialog);
  }

  public static updateColumns(columns: Column[]): void {
    this.columns = columns;
    const taskColSelect = document.getElementById('task-col') as HTMLSelectElement | null;
    if (taskColSelect) {
      taskColSelect.innerHTML = this.columns.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    }
  }

  public static showAddTask(): void {
    const dialog = document.getElementById('dialog-add-task') as HTMLDialogElement | null;
    if (dialog) dialog.showModal();
  }

  public static showAddColumn(): void {
    const dialog = document.getElementById('dialog-add-column') as HTMLDialogElement | null;
    if (dialog) dialog.showModal();
  }

  public static showEditTask(task: Task): void {
    const editDialog = document.getElementById('dialog-edit-task') as HTMLDialogElement | null;
    if (!editDialog) return;

    editDialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Edit Task</h2>
        <button class="modal-close" id="close-edit-task">
          ${Icons.get('x', 'icon-close', 16)}
        </button>
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
        editDialog.dispatchEvent(new CustomEvent('kanban-delete-task', {
          detail: { id: task.id },
          bubbles: true,
          composed: true
        }));
        closeEdit();
      }
    });

    formEdit.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('edit-title') as HTMLInputElement).value;
      const desc = (document.getElementById('edit-desc') as HTMLTextAreaElement).value;
      const priority = (document.getElementById('edit-priority') as HTMLSelectElement).value as 'low' | 'medium' | 'high';

      editDialog.dispatchEvent(new CustomEvent('kanban-update-task', {
        detail: { id: task.id, title, description: desc, priority },
        bubbles: true,
        composed: true
      }));
      closeEdit();
    });
  }

  private static populateAddTaskDialog(dialog: HTMLDialogElement): void {
    const columnOptions = this.columns.map(c => `<option value="${c.id}">${c.title}</option>`).join('');

    dialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">New Task</h2>
        <button class="modal-close" id="close-add-task">
          ${Icons.get('x', 'icon-close', 16)}
        </button>
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

    const formAddTask = dialog.querySelector<HTMLFormElement>('#form-add-task')!;
    const closeAdd = () => {
      formAddTask.reset();
      dialog.close();
    };

    dialog.querySelector('#close-add-task')!.addEventListener('click', closeAdd);
    dialog.querySelector('#btn-cancel-task')!.addEventListener('click', closeAdd);

    formAddTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('task-title') as HTMLInputElement).value;
      const desc = (document.getElementById('task-desc') as HTMLTextAreaElement).value;
      const columnId = (document.getElementById('task-col') as HTMLSelectElement).value;
      const priority = (document.getElementById('task-priority') as HTMLSelectElement).value as 'low' | 'medium' | 'high';

      dialog.dispatchEvent(new CustomEvent('kanban-create-task', {
        detail: { title, description: desc, columnId, priority },
        bubbles: true,
        composed: true
      }));
      closeAdd();
    });
  }

  private static populateAddColumnDialog(dialog: HTMLDialogElement): void {
    dialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">New Column</h2>
        <button class="modal-close" id="close-add-column">
          ${Icons.get('x', 'icon-close', 16)}
        </button>
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

    const formAddCol = dialog.querySelector<HTMLFormElement>('#form-add-column')!;
    const closeCol = () => {
      formAddCol.reset();
      dialog.close();
    };

    dialog.querySelector('#close-add-column')!.addEventListener('click', closeCol);
    dialog.querySelector('#btn-cancel-column')!.addEventListener('click', closeCol);

    formAddCol.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('col-title') as HTMLInputElement).value;
      const color = (document.getElementById('col-color') as HTMLSelectElement).value;

      dialog.dispatchEvent(new CustomEvent('kanban-create-column', {
        detail: { title, color },
        bubbles: true,
        composed: true
      }));
      closeCol();
    });
  }
}
