import type { TaskFilters, TaskPriorityFilter, TaskStatusFilter } from '../types/task';

export class Filters {
  private readonly root: HTMLElement;
  private readonly statusSelect: HTMLSelectElement;
  private readonly prioritySelect: HTMLSelectElement;
  private readonly searchInput: HTMLInputElement;
  private readonly onChange: (nextFilters: TaskFilters) => void;

  constructor(onChange: (nextFilters: TaskFilters) => void) {
    this.root = document.createElement('div');
    this.root.className = 'filters';
    this.onChange = onChange;

    this.root.innerHTML = `
      <div class="filters__row">
        <label class="field field--search">
          <span class="field__label">Buscar</span>
          <input id="task-search" type="search" placeholder="Buscar por título" aria-label="Buscar tareas por título" />
        </label>
      </div>
      <div class="filters__row filters__row--compact">
        <label class="field">
          <span class="field__label">Estado</span>
          <select id="task-status-filter" aria-label="Filtrar tareas por estado">
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
        </label>

        <label class="field">
          <span class="field__label">Prioridad</span>
          <select id="task-priority-filter" aria-label="Filtrar tareas por prioridad">
            <option value="all">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </label>
      </div>
    `;

    this.searchInput = this.root.querySelector('#task-search') as HTMLInputElement;
    this.statusSelect = this.root.querySelector('#task-status-filter') as HTMLSelectElement;
    this.prioritySelect = this.root.querySelector('#task-priority-filter') as HTMLSelectElement;

    this.searchInput.addEventListener('input', () => this.emitChange());
    this.statusSelect.addEventListener('change', () => this.emitChange());
    this.prioritySelect.addEventListener('change', () => this.emitChange());
  }

  render(): HTMLElement {
    return this.root;
  }

  getValues(): TaskFilters {
    return {
      status: this.statusSelect.value as TaskStatusFilter,
      priority: this.prioritySelect.value as TaskPriorityFilter,
      search: this.searchInput.value.trim(),
    };
  }

  update(filters: TaskFilters): void {
    this.statusSelect.value = filters.status;
    this.prioritySelect.value = filters.priority;
    this.searchInput.value = filters.search;
  }

  private emitChange(): void {
    this.onChange(this.getValues());
  }
}
