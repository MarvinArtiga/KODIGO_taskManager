import { formatDate } from '../utils/helpers';
import type { Task } from '../types/task';

export type TaskItemActions = {
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export class TaskItem {
  private readonly root: HTMLElement;
  private readonly checkbox: HTMLInputElement;
  private readonly deleteButton: HTMLButtonElement;
  private readonly editButton: HTMLButtonElement;
  private readonly task: Task;
  private readonly actions: TaskItemActions;

  constructor(task: Task, actions: TaskItemActions) {
    this.task = task;
    this.actions = actions;

    this.root = document.createElement('article');
    this.root.className = `task-card${task.completed ? ' task-card--completed' : ''}`;
    this.root.dataset.taskId = task.id;

    this.root.innerHTML = `
      <div class="task-card__header">
        <label class="task-card__check">
          <input type="checkbox" aria-label="Marcar tarea como completada" ${task.completed ? 'checked' : ''} />
          <span class="task-card__status">${task.completed ? 'Completada' : 'Pendiente'}</span>
        </label>
        <div class="task-card__meta">
          <span class="badge badge--${task.priority}">${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</span>
        </div>
      </div>

      <div class="task-card__body">
        <h3>${task.title}</h3>
        <p>${task.description}</p>
      </div>

      <div class="task-card__footer">
        <span class="task-card__category">${task.category}</span>
        <time class="task-card__date">${formatDate(task.createdAt)}</time>
      </div>

      <div class="task-card__actions">
        <button type="button" class="btn btn--ghost btn--small" data-action="edit">Editar</button>
        <button type="button" class="btn btn--danger btn--small" data-action="delete">Eliminar</button>
      </div>
    `;

    this.checkbox = this.root.querySelector('input[type="checkbox"]') as HTMLInputElement;
    this.editButton = this.root.querySelector('[data-action="edit"]') as HTMLButtonElement;
    this.deleteButton = this.root.querySelector('[data-action="delete"]') as HTMLButtonElement;

    this.checkbox.addEventListener('change', () => {
      this.actions.onToggleComplete(this.task.id);
    });

    this.editButton.addEventListener('click', () => {
      this.actions.onEdit(this.task);
    });

    this.deleteButton.addEventListener('click', () => {
      this.actions.onDelete(this.task.id);
    });
  }

  render(): HTMLElement {
    return this.root;
  }
}
