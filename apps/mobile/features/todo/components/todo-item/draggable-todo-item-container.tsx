import { useDragReorderItem } from "../../hooks/use-drag-reorder-item";
import type { DragState } from "../../hooks/use-drag-reorder-list";
import { useSwipeAction } from "../../hooks/use-swipe-action";
import type { Todo } from "../../stores/todo-store";
import { useTodoStore } from "../../stores/todo-store";
import { DraggableTodoItem } from "./draggable-todo-item";

type DraggableTodoItemContainerProps = {
	todo: Todo;
	index: number;
	totalCount: number;
	onReorder: (fromIndex: number, toIndex: number) => void;
	dragState: DragState;
};

export function DraggableTodoItemContainer({
	todo,
	index,
	totalCount,
	onReorder,
	dragState,
}: DraggableTodoItemContainerProps) {
	const toggleTodo = useTodoStore((s) => s.toggleTodo);
	const removeTodo = useTodoStore((s) => s.removeTodo);

	const { panGesture, animatedStyle: dragAnimatedStyle } = useDragReorderItem({
		index,
		totalCount,
		dragState,
		onReorder,
	});

	const {
		swipeGesture,
		translateX,
		itemAnimatedStyle: swipeAnimatedStyle,
	} = useSwipeAction({
		onSwipeRight: () => toggleTodo(todo.id),
		onSwipeLeft: () => removeTodo(todo.id),
	});

	return (
		<DraggableTodoItem
			todo={todo}
			onToggle={toggleTodo}
			panGesture={panGesture}
			dragAnimatedStyle={dragAnimatedStyle}
			swipeGesture={swipeGesture}
			swipeAnimatedStyle={swipeAnimatedStyle}
			swipeTranslateX={translateX}
		/>
	);
}
