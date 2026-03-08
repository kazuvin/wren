import { useDragReorderList } from "../../hooks/use-drag-reorder-list";
import { useTodoList } from "../../hooks/use-todo-list";
import { TodoList } from "./todo-list";

export function TodoListContainer() {
	const { pendingTodos, completedTodos, handleReorder } = useTodoList();
	const dragState = useDragReorderList();

	return (
		<TodoList
			pendingTodos={pendingTodos}
			completedTodos={completedTodos}
			onReorder={handleReorder}
			dragState={dragState}
		/>
	);
}
