import { useTodoList } from "../../hooks/use-todo-list";
import { TodoList } from "./todo-list";

export function TodoListContainer() {
	const { todos, handleReorder } = useTodoList();

	return <TodoList todos={todos} onReorder={handleReorder} />;
}
