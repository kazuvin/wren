import { useDragReorderItem } from "../../hooks/use-drag-reorder-item";
import type { DragState } from "../../hooks/use-drag-reorder-list";
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
	const { panGesture, animatedStyle } = useDragReorderItem({
		index,
		totalCount,
		dragState,
		onReorder,
	});

	return (
		<DraggableTodoItem
			todo={todo}
			onToggle={toggleTodo}
			panGesture={panGesture}
			animatedStyle={animatedStyle}
		/>
	);
}
