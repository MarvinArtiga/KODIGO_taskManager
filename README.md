# TaskFlow

TaskFlow es un sistema de gestión de tareas moderno y responsive desarrollado con Vite + TypeScript vanilla. Permite crear, editar, eliminar, filtrar y persistir tareas usando localStorage.

## Tecnologías utilizadas

- Vite
- TypeScript
- HTML5
- CSS3
- localStorage

## Características implementadas

- Creación de tareas con validación
- Edición y cancelación de edición
- Eliminación con confirmación mediante modal
- Cambio de estado entre pendiente y completada
- Búsqueda por título
- Filtros combinados por estado y prioridad
- Persistencia con localStorage
- Estados vacíos y notificaciones tipo toast
- Diseño responsive para móvil, tablet y desktop
- Arquitectura modular con separación de responsabilidades

## Estructura del proyecto

```text
src/
├── main.ts
├── types/
│   └── task.ts
├── constants/
│   └── storage.ts
├── services/
│   └── TaskStorageService.ts
├── components/
│   ├── TaskForm.ts
│   ├── TaskList.ts
│   ├── TaskItem.ts
│   ├── Filters.ts
│   └── Modal.ts
├── controllers/
│   └── TaskController.ts
├── utils/
│   └── helpers.ts
├── styles/
│   └── main.css
└── assets/
```

## Instalación

```bash
npm install
```

## Ejecución en modo desarrollo

```bash
npm run dev
```

## Generar build

```bash
npm run build
```
