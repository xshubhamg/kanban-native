import { Icons } from './Icons';

export class Header {
  public static render(initialSearchTerm: string, activeTheme: 'light' | 'dark' | 'system'): HTMLElement {
    const header = document.createElement('header');
    header.innerHTML = `
      <div class="title-area">
        <h1>Kanban Flow</h1>
        <p>A native, zero-dependency task board</p>
      </div>
      <div class="controls">
        <div class="search-wrapper">
          ${Icons.get('search', 'icon-search', 15)}
          <input type="text" class="search-input" id="search-bar" placeholder="Search tasks..." value="${initialSearchTerm}">
        </div>

        <div class="theme-toggle-group" id="theme-selectors">
          <button class="theme-toggle-btn" data-theme="light" title="Light Theme">
            ${Icons.get('sun', 'icon-sun', 15)}
          </button>
          <button class="theme-toggle-btn" data-theme="system" title="System Preference">
            ${Icons.get('monitor', 'icon-monitor', 15)}
          </button>
          <button class="theme-toggle-btn" data-theme="dark" title="Dark Theme">
            ${Icons.get('moon', 'icon-moon', 15)}
          </button>
        </div>

        <button class="btn btn-secondary" id="btn-add-column">
          ${Icons.get('plus', 'icon-plus', 15)} Add Column
        </button>
        <button class="btn btn-primary" id="btn-add-task">
          ${Icons.get('plus', 'icon-plus', 15)} New Task
        </button>
      </div>
    `;

    // Search event
    const searchInput = header.querySelector<HTMLInputElement>('#search-bar')!;
    searchInput.addEventListener('input', () => {
      header.dispatchEvent(new CustomEvent('kanban-search', {
        detail: { query: searchInput.value },
        bubbles: true,
        composed: true
      }));
    });

    // Theme selector events
    const themeSelectors = header.querySelector('#theme-selectors')!;
    themeSelectors.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const button = btn as HTMLButtonElement;
      if (button.dataset.theme === activeTheme) {
        button.classList.add('active');
      }

      button.addEventListener('click', () => {
        themeSelectors.querySelectorAll('.theme-toggle-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        header.dispatchEvent(new CustomEvent('kanban-theme-change', {
          detail: { theme: button.dataset.theme },
          bubbles: true,
          composed: true
        }));
      });
    });

    // Add column button
    header.querySelector('#btn-add-column')!.addEventListener('click', () => {
      header.dispatchEvent(new CustomEvent('kanban-open-add-column-modal', {
        bubbles: true,
        composed: true
      }));
    });

    // Add task button
    header.querySelector('#btn-add-task')!.addEventListener('click', () => {
      header.dispatchEvent(new CustomEvent('kanban-open-add-task-modal', {
        bubbles: true,
        composed: true
      }));
    });

    return header;
  }
}
