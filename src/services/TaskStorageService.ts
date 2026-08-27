import type { Task } from '../types/task';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTaskLike = (value: unknown): value is Task => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.category === 'string' &&
    (value.priority === 'low' || value.priority === 'medium' || value.priority === 'high') &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
};

export class TaskStorageService {
  private readonly storageKey: string;
  private readonly storage: Storage;

  constructor(storageKey: string, storage: Storage = window.localStorage) {
    this.storageKey = storageKey;
    this.storage = storage;
  }

  getTasks(): Task[] {
    try {
      const rawTasks = this.storage.getItem(this.storageKey);

      if (!rawTasks) {
        return [];
      }

      const parsed = JSON.parse(rawTasks) as unknown;

      if (!Array.isArray(parsed)) {
        throw new Error('Los datos guardados no son válidos.');
      }

      return parsed.filter(isTaskLike);
    } catch (error) {
      console.error('Error al leer tareas desde localStorage:', error);
      throw new Error('No se pudieron cargar las tareas guardadas.');
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error al guardar tareas en localStorage:', error);
      throw new Error('No se pudieron guardar los cambios.');
    }
  }

  addTask(task: Task): Task {
    const tasks = this.getTasks();
    const updatedTasks = [...tasks, task];
    this.saveTasks(updatedTasks);
    return task;
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return null;
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    this.saveTasks(updatedTasks);
    return updatedTask;
  }

  deleteTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (filteredTasks.length === tasks.length) {
      return false;
    }

    this.saveTasks(filteredTasks);
    return true;
  }
}
