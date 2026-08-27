import type { Task } from '../types/task';
import { TaskItem, type TaskItemActions } from './TaskItem';

export class TaskList {
  private readonly root: HTMLElement;
  private readonly emptyState: HTMLElement;
  private readonly list: HTMLUListElement;
  private readonly actions: TaskItemActions;

  constructor(actions: TaskItemActions) {
    this.actions = actions;
    this.root = document.createElement('section');
    this.root.className = 'panel task-list';

    this.root.innerHTML = `
      <div class="panel__header panel__header--list">
        <h2>Tareas</h2>
        <span class="task-count" aria-live="polite">0</span>
      </div>
      <div class="task-list__content">
        <ul class="task-list__items" aria-live="polite"></ul>
        <div class="empty-state hidden">
          <h3>No tienes tareas todavía.</h3>
          <p>Crea tu primera tarea para comenzar.</p>
        </div>
      </div>
    `;

    this.list = this.root.querySelector('.task-list__items') as HTMLUListElement;
    this.emptyState = this.root.querySelector('.empty-state') as HTMLElement;
  }

  render(tasks?: Task[]): HTMLElement | void {
    if (tasks === undefined) {
      return this.root;
    }

    this.list.innerHTML = '';
    const countElement = this.root.querySelector('.task-count') as HTMLElement;
    countElement.textContent = `${tasks.length}`;

    if (tasks.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.list.classList.add('empty');
      return;
    }

    this.emptyState.classList.add('hidden');
    this.list.classList.remove('empty');

    tasks.forEach((task) => {
      const item = new TaskItem(task, this.actions);
      const listItem = document.createElement('li');
      listItem.appendChild(item.render());
      this.list.appendChild(listItem);
    });
  }
}
