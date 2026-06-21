import type { Column as ColumnType, Task } from '../types';
import { Card } from './Card';
import { Icons } from './Icons';

export class Column {
  public static render(column: ColumnType, columnTasks: Task[]): HTMLElement {
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
        <button class="column-actions" title="Delete column">
          ${Icons.get('trash', 'icon-trash', 14)}
        </button>
      </div>
      <div class="tasks-list" data-column-id="${column.id}">
        ${columnTasks.length === 0 ? '<div class="empty-state">No tasks here yet</div>' : ''}
      </div>
    `;

    // Delete column action
    col.querySelector('.column-actions')!.addEventListener('click', () => {
      col.dispatchEvent(new CustomEvent('kanban-delete-column', {
        detail: { id: column.id, title: column.title },
        bubbles: true,
        composed: true
      }));
    });

    const tasksList = col.querySelector<HTMLElement>('.tasks-list')!;
    
    columnTasks.forEach(task => {
      const card = Card.render(task);
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

      col.dispatchEvent(new CustomEvent('kanban-move-task', {
        detail: { taskId, targetColumnId: column.id, afterTaskId },
        bubbles: true,
        composed: true
      }));
    });

    return col;
  }

  // --- Helper to calculate drop slot ---
  private static getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
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
}
