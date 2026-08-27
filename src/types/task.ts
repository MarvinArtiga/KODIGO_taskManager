export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatusFilter = 'all' | 'pending' | 'completed';
export type TaskPriorityFilter = 'all' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status: TaskStatusFilter;
  priority: TaskPriorityFilter;
  search: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
}

export type TaskFormMode = 'create' | 'edit';
