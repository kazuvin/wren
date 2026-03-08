import { useSwipeAction } from "../../hooks/use-swipe-action";
import { useTodoStore } from "../../stores/todo-store";
import type { Todo } from "../../stores/todo-store";
import { TodoItem } from "./todo-item";

type TodoItemContainerProps = {
	todo: Todo;
};

export function TodoItemContainer({ todo }: TodoItemContainerProps) {
	const toggleTodo = useTodoStore((s) => s.toggleTodo);
	const removeTodo = useTodoStore((s) => s.removeTodo);

	const { swipeGesture, translateX, itemAnimatedStyle } = useSwipeAction({
		onSwipeRight: () => toggleTodo(todo.id),
		onSwipeLeft: () => removeTodo(todo.id),
	});

	return (
		<TodoItem
			todo={todo}
			onToggle={toggleTodo}
			swipeGesture={swipeGesture}
			swipeAnimatedStyle={itemAnimatedStyle}
			swipeTranslateX={translateX}
		/>
	);
}
