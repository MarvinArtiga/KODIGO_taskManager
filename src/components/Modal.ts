export type ModalConfirmHandler = () => void;

export class Modal {
  private readonly root: HTMLElement;
  private readonly dialog: HTMLDialogElement;
  private readonly title: HTMLElement;
  private readonly message: HTMLElement;
  private readonly cancelButton: HTMLButtonElement;
  private readonly confirmButton: HTMLButtonElement;
  private onConfirm: ModalConfirmHandler | null = null;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'modal-root';

    this.dialog = document.createElement('dialog');
    this.dialog.className = 'modal';
    this.dialog.setAttribute('aria-modal', 'true');
    this.dialog.setAttribute('aria-labelledby', 'delete-task-title');

    this.dialog.innerHTML = `
      <div class="modal__card" role="document">
        <div class="modal__header">
          <h2 id="delete-task-title">Confirmar eliminación</h2>
        </div>
        <p class="modal__message">¿Seguro que deseas eliminar esta tarea?</p>
        <div class="modal__actions">
          <button type="button" class="btn btn--secondary" data-action="cancel">Cancelar</button>
          <button type="button" class="btn btn--danger" data-action="confirm">Eliminar</button>
        </div>
      </div>
    `;

    this.title = this.dialog.querySelector('h2') as HTMLElement;
    this.message = this.dialog.querySelector('.modal__message') as HTMLElement;
    this.cancelButton = this.dialog.querySelector('[data-action="cancel"]') as HTMLButtonElement;
    this.confirmButton = this.dialog.querySelector('[data-action="confirm"]') as HTMLButtonElement;

    this.cancelButton.addEventListener('click', () => this.close());
    this.confirmButton.addEventListener('click', () => {
      if (this.onConfirm) {
        this.onConfirm();
      }
      this.close();
    });

    this.root.appendChild(this.dialog);
  }

  render(): HTMLElement {
    return this.root;
  }

  open({ title, message, onConfirm }: { title?: string; message: string; onConfirm: ModalConfirmHandler }): void {
    this.title.textContent = title ?? 'Confirmar eliminación';
    this.message.textContent = message;
    this.onConfirm = onConfirm;
    this.dialog.showModal();
    this.confirmButton.focus();
  }

  close(): void {
    this.onConfirm = null;
    this.dialog.close();
  }
}
