import { atom } from "jotai";

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

export const todosAtom = atom<Todo[]>([]);

export const addTodoAtom = atom(null, (get, set, input: { title: string; emoji?: string }) => {
	const newTodo: Todo = {
		id: generateId(),
		title: input.title,
		emoji: input.emoji ?? "📝",
		completed: false,
	};
	set(todosAtom, [...get(todosAtom), newTodo]);
});

export const toggleTodoAtom = atom(null, (get, set, id: string) => {
	set(
		todosAtom,
		get(todosAtom).map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
	);
});

export const removeTodoAtom = atom(null, (get, set, id: string) => {
	set(
		todosAtom,
		get(todosAtom).filter((todo) => todo.id !== id),
	);
});

export const reorderTodosAtom = atom(
	null,
	(get, set, { fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
		const todos = [...get(todosAtom)];
		const [moved] = todos.splice(fromIndex, 1);
		todos.splice(toIndex, 0, moved);
		set(todosAtom, todos);
	},
);

export const completedCountAtom = atom((get) => {
	return get(todosAtom).filter((todo) => todo.completed).length;
});
