import { create } from "zustand";

export type Todo = {
	id: string;
	title: string;
	emoji: string;
	completed: boolean;
};

let nextId = 1;

function generateId(): string {
	return `todo-${nextId++}`;
}

type TodoState = {
	todos: Todo[];
	addTodo: (input: { title: string; emoji?: string }) => void;
	toggleTodo: (id: string) => void;
	removeTodo: (id: string) => void;
	reorderTodos: (params: { fromIndex: number; toIndex: number }) => void;
};

export const useTodoStore = create<TodoState>((set) => ({
	todos: [],
	addTodo: (input) => {
		const newTodo: Todo = {
			id: generateId(),
			title: input.title,
			emoji: input.emoji ?? "📝",
			completed: false,
		};
		set((state) => ({ todos: [...state.todos, newTodo] }));
	},
	toggleTodo: (id) => {
		set((state) => ({
			todos: state.todos.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		}));
	},
	removeTodo: (id) => {
		set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) }));
	},
	reorderTodos: ({ fromIndex, toIndex }) => {
		set((state) => {
			const todos = [...state.todos];
			const [moved] = todos.splice(fromIndex, 1);
			todos.splice(toIndex, 0, moved);
			return { todos };
		});
	},
}));

export function getCompletedCount(todos: Todo[]): number {
	return todos.filter((todo) => todo.completed).length;
}

export function splitTodos(todos: Todo[]): { pending: Todo[]; completed: Todo[] } {
	const pending: Todo[] = [];
	const completed: Todo[] = [];
	for (const todo of todos) {
		if (todo.completed) {
			completed.push(todo);
		} else {
			pending.push(todo);
		}
	}
	return { pending, completed };
}
