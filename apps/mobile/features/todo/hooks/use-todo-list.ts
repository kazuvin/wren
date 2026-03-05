import { useTodoStore } from "../stores/todo-store";

export function useTodoList() {
	const todos = useTodoStore((s) => s.todos);
	const reorderTodos = useTodoStore((s) => s.reorderTodos);

	const handleReorder = (fromIndex: number, toIndex: number) => {
		reorderTodos({ fromIndex, toIndex });
	};

	return { todos, handleReorder };
}
