import { useMemo } from "react";
import { splitTodos, useTodoStore } from "../stores/todo-store";

export function useTodoList() {
	const todos = useTodoStore((s) => s.todos);
	const reorderTodos = useTodoStore((s) => s.reorderTodos);

	const { pending: pendingTodos, completed: completedTodos } = useMemo(
		() => splitTodos(todos),
		[todos],
	);

	const handleReorder = (fromIndex: number, toIndex: number) => {
		reorderTodos({ fromIndex, toIndex });
	};

	return { todos, pendingTodos, completedTodos, handleReorder };
}
