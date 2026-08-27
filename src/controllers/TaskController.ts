import { Filters } from '../components/Filters';
import { Modal } from '../components/Modal';
import { TaskForm, type TaskFormSubmitEvent } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TASKS_STORAGE_KEY } from '../constants/storage';
import { TaskStorageService } from '../services/TaskStorageService';
import type { Task, TaskFilters } from '../types/task';
import { createUniqueId } from '../utils/helpers';

export class TaskController {
  private readonly storageService: TaskStorageService;
  private readonly taskForm: TaskForm;
  private readonly filters: Filters;
  private readonly taskList: TaskList;
  private readonly modal: Modal;
  private readonly toastContainer: HTMLElement;
  private readonly taskListRoot: HTMLElement;
  private tasks: Task[] = [];
  private filtersState: TaskFilters = {
    status: 'all',
    priority: 'all',
    search: '',
  };

  constructor(root: HTMLElement) {
    this.storageService = new TaskStorageService(TASKS_STORAGE_KEY);
    this.taskForm = new TaskForm((event) => this.handleFormSubmit(event));
    this.filters = new Filters((nextFilters) => this.handleFiltersChange(nextFilters));
    this.taskList = new TaskList({
      onToggleComplete: (taskId) => this.toggleTaskCompletion(taskId),
      onEdit: (task) => this.editTask(task),
      onDelete: (taskId) => this.confirmDelete(taskId),
    });
    this.modal = new Modal();
    this.taskListRoot = root;
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    this.toastContainer.setAttribute('aria-live', 'polite');

    this.renderShell();
    this.loadTasks();
  }

  private renderShell(): void {
    const appLayout = document.createElement('div');
    appLayout.className = 'app-shell';

    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
      <div>
        <p class="eyebrow">Productividad</p>
        <h1>TaskFlow</h1>
      </div>
      <p class="app-header__subtitle">Organiza tus tareas y mantén el control de tu día.</p>
    `;

    const main = document.createElement('main');
    main.className = 'app-main';
    main.appendChild(this.taskForm.render());
    main.appendChild(this.filters.render());
    main.appendChild(this.taskList.render() as HTMLElement);

    appLayout.appendChild(header);
    appLayout.appendChild(main);
    appLayout.appendChild(this.modal.render());
    this.taskListRoot.appendChild(appLayout);
    this.taskListRoot.appendChild(this.toastContainer);
  }

  private loadTasks(): void {
    try {
      this.tasks = this.storageService.getTasks();
      this.applyFilters();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron cargar las tareas.';
      this.showToast(message, 'error');
      this.tasks = [];
      this.taskList.render([]);
    }
  }

  private handleFormSubmit(event: TaskFormSubmitEvent): void {
    const values = event.values;

    if (event.mode === 'create') {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: createUniqueId(),
        title: values.title,
        description: values.description,
        category: values.category,
        priority: values.priority,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      this.tasks = [...this.tasks, newTask];
      this.storageService.saveTasks(this.tasks);
      this.taskForm.resetForm();
      this.applyFilters();
      this.showToast('Tarea creada correctamente.', 'success');
      return;
    }

    if (!event.taskId) {
      this.showToast('No se pudo identificar la tarea a editar.', 'error');
      return;
    }

    const taskIndex = this.tasks.findIndex((task) => task.id === event.taskId);
    if (taskIndex === -1) {
      this.showToast('La tarea seleccionada ya no existe.', 'error');
      return;
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      updatedAt: new Date().toISOString(),
    };

    this.tasks = this.tasks.map((task) => (task.id === event.taskId ? updatedTask : task));
    this.storageService.saveTasks(this.tasks);
    this.taskForm.resetForm();
    this.applyFilters();
    this.showToast('Tarea actualizada correctamente.', 'success');
  }

  private handleFiltersChange(nextFilters: TaskFilters): void {
    this.filtersState = nextFilters;
    this.applyFilters();
  }

  private applyFilters(): void {
    const filteredTasks = this.tasks.filter((task) => {
      const matchesStatus =
        this.filtersState.status === 'all' ||
        (this.filtersState.status === 'pending' && !task.completed) ||
        (this.filtersState.status === 'completed' && task.completed);

      const matchesPriority =
        this.filtersState.priority === 'all' || task.priority === this.filtersState.priority;

      const normalizedSearch = this.filtersState.search.toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 || task.title.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesPriority && matchesSearch;
    });

    this.taskList.render(filteredTasks);
  }

  private toggleTaskCompletion(taskId: string): void {
    const task = this.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString(),
    };

    this.tasks = this.tasks.map((item) => (item.id === taskId ? updatedTask : item));
    this.storageService.saveTasks(this.tasks);
    this.applyFilters();
    this.showToast(
      updatedTask.completed ? 'Tarea marcada como completada.' : 'Tarea marcada como pendiente.',
      'success',
    );
  }

  private editTask(task: Task): void {
    this.taskForm.setTaskForEdit(task);
    this.taskForm.clearError();
  }

  private confirmDelete(taskId: string): void {
    const task = this.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    this.modal.open({
      title: 'Confirmar eliminación',
      message: `¿Seguro que deseas eliminar la tarea "${task.title}"?`,
      onConfirm: () => this.deleteTask(taskId),
    });
  }

  private deleteTask(taskId: string): void {
    const task = this.tasks.find((item) => item.id === taskId);
    const removed = this.storageService.deleteTask(taskId);

    if (!removed) {
      this.showToast('No se pudo eliminar la tarea.', 'error');
      return;
    }

    this.tasks = this.tasks.filter((item) => item.id !== taskId);
    this.applyFilters();

    if (this.taskForm.isEditingTask(taskId)) {
      this.taskForm.resetForm();
    }

    this.showToast(task ? `"${task.title}" eliminada.` : 'Tarea eliminada.', 'success');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add('toast--hide');
      window.setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}
