# Kanban Native Project Guidelines & Agent Instructions

This document outlines the design decisions, patterns, and constraints for the **kanban-native** project.

## Project Vision & Requirements

1. **Zero External Dependencies**:
   - The application must be built using only vanilla HTML, CSS, and client-side TypeScript.
   - Do NOT install any drag-and-drop, state-management, or UI component packages (e.g. no react, no tailwind, no lodash, no drag-and-drop libraries).
   - Use only Vite and TypeScript as development tools.

2. **Native Drag & Drop API**:
   - Leverage the browser's native Drag and Drop API (`draggable="true"`, `dragstart`, `dragover`, `dragenter`, `dragleave`, `drop`, `dragend`).
   - Implement custom visual states for drag-and-drop actions, including:
     - Card ghost/active styling while dragging.
     - Column hover highlighting.
     - Dynamic drop indicators to preview where a card will land.

3. **Rich, Modern Aesthetics**:
   - Clean, premium typography (e.g. `system-ui`, `Inter`).
   - Professional dark/light theme, preferably using modern CSS custom properties and matching system preferences.
   - Soft gradients, glassmorphism UI elements (using `backdrop-filter: blur()`), and subtle hover micro-animations.
   - Distinct, curated accent colors for different statuses or task priorities.

4. **Robust Features**:
   - Columns: Able to add, rename, and delete columns.
   - Cards: Able to add, edit, delete, and move cards across columns or reorder them within a column.
   - LocalStorage persistence: The entire board state (columns, cards, positions) must persist automatically on change.
   - Search/Filter: A search bar at the top to filter cards by title, description, or labels.

---

## Technical & Architecture Guidelines

### 1. State Management
- Maintain a single, immutable-style state object representing columns and tasks:
  ```typescript
  interface Task {
    id: string;
    title: string;
    description: string;
    columnId: string;
    createdAt: number;
    labels?: string[];
  }

  interface Column {
    id: string;
    title: string;
    order: number;
  }

  interface BoardState {
    columns: Column[];
    tasks: Task[];
  }
  ```
- Any state changes should trigger a save to `localStorage` and a re-render of the DOM (or specific modified sections).

### 2. DOM Rendering & Performance
- Use a component-like or modular structure in TypeScript.
- Build modern HTML semantic structures (`<main>`, `<section>`, `<article>`, `<header>`, `<dialog>`).
- Implement dynamic forms using native `<dialog>` elements for modals instead of custom absolute-positioned overlays where possible.

### 3. Drag and Drop Implementation Details
- Add `draggable="true"` to each card element.
- Use data transfer to share state or track active ID: `event.dataTransfer.setData('text/plain', taskId)`.
- Use a visual guide/placeholder when dragging over columns. Calculate the closest card in the column based on mouse Y coordinates to insert the card at the exact slot.
- Example logic for finding insertion position:
  ```typescript
  function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
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
  ```

### 4. Development Commands
- Use **Bun** as the package manager and runner.
- Start dev server: `bun run dev`
- Build project: `bun run build`
