import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { ANIMATION } from "../../../../constants/animation";
import { textBase } from "../../../../constants/theme";
import type { DragState } from "../../hooks/use-drag-reorder-list";
import type { Todo } from "../../stores/todo-store";
import { DraggableTodoItemContainer } from "../todo-item/draggable-todo-item-container";
import { TodoItemContainer } from "../todo-item/todo-item-container";

type TodoListProps = {
	pendingTodos: Todo[];
	completedTodos: Todo[];
	onReorder: (fromIndex: number, toIndex: number) => void;
	dragState: DragState;
};

export function TodoList({ pendingTodos, completedTodos, onReorder, dragState }: TodoListProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const hasPending = pendingTodos.length > 0;
	const hasCompleted = completedTodos.length > 0;

	return (
		<View style={styles.container}>
			<Text style={[styles.heading, { color: theme.foreground }]}>Todo</Text>
			<View style={styles.list}>
				{!hasPending && !hasCompleted ? (
					<Text style={[styles.empty, { color: theme.mutedForeground }]}>
						タスクを追加しましょう！
					</Text>
				) : (
					pendingTodos.map((todo, index) => (
						<DraggableTodoItemContainer
							key={todo.id}
							todo={todo}
							index={index}
							totalCount={pendingTodos.length}
							onReorder={onReorder}
							dragState={dragState}
						/>
					))
				)}
			</View>

			{hasCompleted && (
				<Animated.View
					entering={FadeIn.duration(ANIMATION.entering.duration)}
					exiting={FadeOut.duration(ANIMATION.exiting.duration)}
					layout={LinearTransition.duration(ANIMATION.layout.duration)}
					style={styles.completedSection}
				>
					<Text style={[styles.completedHeading, { color: theme.mutedForeground }]}>
						完了したタスク
					</Text>
					<View style={styles.list}>
						{completedTodos.map((todo) => (
							<Animated.View
								key={todo.id}
								entering={FadeIn.duration(ANIMATION.entering.duration)}
								exiting={FadeOut.duration(ANIMATION.exiting.duration)}
								layout={LinearTransition.duration(ANIMATION.layout.duration)}
							>
								<TodoItemContainer todo={todo} />
							</Animated.View>
						))}
					</View>
				</Animated.View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: parseNumeric(spacing[3]),
	},
	heading: {
		...textBase,
		fontSize: 24,
		fontWeight: "700",
		paddingHorizontal: parseNumeric(spacing[4]),
	},
	list: {
		gap: parseNumeric(spacing[2]),
		paddingHorizontal: parseNumeric(spacing[4]),
	},
	empty: {
		...textBase,
		textAlign: "center",
		paddingVertical: parseNumeric(spacing[8]),
		fontSize: 14,
	},
	completedSection: {
		gap: parseNumeric(spacing[3]),
	},
	completedHeading: {
		...textBase,
		fontSize: 16,
		fontWeight: "600",
		paddingHorizontal: parseNumeric(spacing[4]),
	},
});
