import './styles/main.css';
import { TaskController } from './controllers/TaskController';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (!appElement) {
  throw new Error('No se encontró el contenedor principal #app');
}

new TaskController(appElement);
