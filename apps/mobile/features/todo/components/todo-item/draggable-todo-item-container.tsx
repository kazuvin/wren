import { useDragReorder } from "../../hooks/use-drag-reorder";
import type { Todo } from "../../stores/todo-store";
import { useTodoStore } from "../../stores/todo-store";
import { DraggableTodoItem } from "./draggable-todo-item";

type DraggableTodoItemContainerProps = {
	todo: Todo;
	index: number;
	totalCount: number;
	onReorder: (fromIndex: number, toIndex: number) => void;
};

export function DraggableTodoItemContainer({
	todo,
	index,
	totalCount,
	onReorder,
}: DraggableTodoItemContainerProps) {
	const toggleTodo = useTodoStore((s) => s.toggleTodo);
	const { panGesture, animatedStyle } = useDragReorder({ index, totalCount, onReorder });

	return (
		<DraggableTodoItem
			todo={todo}
			onToggle={toggleTodo}
			panGesture={panGesture}
			animatedStyle={animatedStyle}
		/>
	);
}
