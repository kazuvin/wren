import { useDragReorderList } from "../../hooks/use-drag-reorder-list";
import { useTodoList } from "../../hooks/use-todo-list";
import { TodoList } from "./todo-list";

export function TodoListContainer() {
	const { todos, handleReorder } = useTodoList();
	const dragState = useDragReorderList();

	return <TodoList todos={todos} onReorder={handleReorder} dragState={dragState} />;
}
