import type { Task, TaskFormMode, TaskFormValues } from '../types/task';

export interface TaskFormSubmitEvent {
  values: TaskFormValues;
  mode: TaskFormMode;
  taskId?: string;
}

export class TaskForm {
  private readonly root: HTMLElement;
  private readonly form: HTMLFormElement;
  private readonly titleInput: HTMLInputElement;
  private readonly descriptionInput: HTMLTextAreaElement;
  private readonly categoryInput: HTMLInputElement;
  private readonly prioritySelect: HTMLSelectElement;
  private readonly submitButton: HTMLButtonElement;
  private readonly cancelButton: HTMLButtonElement;
  private readonly titleElement: HTMLElement;
  private readonly onSubmit: (event: TaskFormSubmitEvent) => void;
  private mode: TaskFormMode = 'create';
  private editingTaskId: string | null = null;

  constructor(onSubmit: (event: TaskFormSubmitEvent) => void) {
    this.root = document.createElement('section');
    this.root.className = 'panel task-form';
    this.onSubmit = onSubmit;

    this.root.innerHTML = `
      <div class="panel__header">
        <h2 id="task-form-title">Nueva tarea</h2>
      </div>
      <form class="task-form__form" novalidate>
        <div class="field-group field-group--two">
          <label class="field">
            <span class="field__label">Título</span>
            <input id="task-title" name="title" type="text" maxlength="80" placeholder="Ej: Revisar informe mensual" required />
          </label>
          <label class="field">
            <span class="field__label">Categoría</span>
            <input id="task-category" name="category" type="text" maxlength="40" placeholder="Ej: Trabajo" required />
          </label>
        </div>

        <label class="field">
          <span class="field__label">Descripción</span>
          <textarea id="task-description" name="description" rows="4" maxlength="300" placeholder="Describe la tarea..." required></textarea>
        </label>

        <div class="field-group field-group--two field-group--inline">
          <label class="field">
            <span class="field__label">Prioridad</span>
            <select id="task-priority" name="priority">
              <option value="high">Alta</option>
              <option value="medium" selected>Media</option>
              <option value="low">Baja</option>
            </select>
          </label>

          <div class="task-form__actions">
            <button type="submit" class="btn btn--primary">Crear tarea</button>
            <button type="button" class="btn btn--secondary hidden" id="cancel-edit-btn">Cancelar</button>
          </div>
        </div>

        <p class="form-error" aria-live="polite"></p>
      </form>
    `;

    this.form = this.root.querySelector('form') as HTMLFormElement;
    this.titleInput = this.root.querySelector('#task-title') as HTMLInputElement;
    this.descriptionInput = this.root.querySelector('#task-description') as HTMLTextAreaElement;
    this.categoryInput = this.root.querySelector('#task-category') as HTMLInputElement;
    this.prioritySelect = this.root.querySelector('#task-priority') as HTMLSelectElement;
    this.submitButton = this.root.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.cancelButton = this.root.querySelector('#cancel-edit-btn') as HTMLButtonElement;
    this.titleElement = this.root.querySelector('h2') as HTMLElement;

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit();
    });

    this.cancelButton.addEventListener('click', () => {
      this.resetForm();
    });
  }

  render(): HTMLElement {
    return this.root;
  }

  setTaskForEdit(task: Task): void {
    this.mode = 'edit';
    this.editingTaskId = task.id;
    this.titleElement.textContent = 'Editar tarea';
    this.submitButton.textContent = 'Guardar cambios';
    this.cancelButton.classList.remove('hidden');
    this.titleInput.value = task.title;
    this.descriptionInput.value = task.description;
    this.categoryInput.value = task.category;
    this.prioritySelect.value = task.priority;
    this.titleInput.focus();
  }

  resetForm(): void {
    this.mode = 'create';
    this.editingTaskId = null;
    this.titleElement.textContent = 'Nueva tarea';
    this.submitButton.textContent = 'Crear tarea';
    this.cancelButton.classList.add('hidden');
    this.form.reset();
    this.prioritySelect.value = 'medium';
    this.clearError();
  }

  getValues(): TaskFormValues {
    return {
      title: this.titleInput.value.trim(),
      description: this.descriptionInput.value.trim(),
      category: this.categoryInput.value.trim(),
      priority: this.prioritySelect.value as Task['priority'],
    };
  }

  setError(message: string): void {
    const errorElement = this.root.querySelector('.form-error') as HTMLElement;
    errorElement.textContent = message;
  }

  clearError(): void {
    const errorElement = this.root.querySelector('.form-error') as HTMLElement;
    errorElement.textContent = '';
  }

  isEditingTask(taskId: string): boolean {
    return this.mode === 'edit' && this.editingTaskId === taskId;
  }

  private handleSubmit(): void {
    const values = this.getValues();
    if (!this.validate(values)) {
      return;
    }

    this.onSubmit({
      values,
      mode: this.mode,
      taskId: this.editingTaskId ?? undefined,
    });
  }

  private validate(values: TaskFormValues): boolean {
    if (!values.title || values.title.length < 3) {
      this.setError('El título debe tener al menos 3 caracteres.');
      return false;
    }

    if (values.description.length < 5) {
      this.setError('La descripción debe tener al menos 5 caracteres.');
      return false;
    }

    if (!values.category || values.category.length < 2) {
      this.setError('La categoría es obligatoria.');
      return false;
    }

    this.clearError();
    return true;
  }
}
