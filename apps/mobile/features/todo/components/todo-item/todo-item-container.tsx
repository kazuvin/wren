import { useTodoStore } from "../../stores/todo-store";
import type { Todo } from "../../stores/todo-store";
import { TodoItem } from "./todo-item";

type TodoItemContainerProps = {
	todo: Todo;
};

export function TodoItemContainer({ todo }: TodoItemContainerProps) {
	const toggleTodo = useTodoStore((s) => s.toggleTodo);

	return <TodoItem todo={todo} onToggle={toggleTodo} />;
}
