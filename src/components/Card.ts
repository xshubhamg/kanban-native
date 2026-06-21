import type { Task } from '../types';
import { Icons } from './Icons';

export class Card {
  public static render(task: Task): HTMLElement {
    const card = document.createElement('article');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;

    const priorityClass = `tag priority-${task.priority}`;

    card.innerHTML = `
      <div class="task-card-header">
        <h3 class="task-title">${task.title}</h3>
      </div>
      <p class="task-desc">${task.description || 'No description provided.'}</p>
      <div class="task-meta">
        <div class="task-labels">
          <span class="${priorityClass}">${task.priority}</span>
        </div>
        <div class="task-date-wrapper">
          ${Icons.get('calendar', 'icon-calendar', 12)}
          <span class="task-date">${new Date(task.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
        </div>
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
      card.dispatchEvent(new CustomEvent('kanban-dragend', {
        bubbles: true,
        composed: true
      }));
    });

    // Card Double Click to edit
    card.addEventListener('dblclick', () => {
      card.dispatchEvent(new CustomEvent('kanban-open-edit-modal', {
        detail: { task },
        bubbles: true,
        composed: true
      }));
    });

    return card;
  }
}
