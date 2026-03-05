import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { textBase } from "../../../../constants/theme";
import { useDragReorder } from "../../hooks/use-drag-reorder";
import type { Todo } from "../../stores/todo-store";
import { useTodoStore } from "../../stores/todo-store";

type DraggableTodoItemProps = {
	todo: Todo;
	index: number;
	totalCount: number;
	onReorder: (fromIndex: number, toIndex: number) => void;
};

export function DraggableTodoItem({ todo, index, totalCount, onReorder }: DraggableTodoItemProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const toggleTodo = useTodoStore((s) => s.toggleTodo);
	const { panGesture, animatedStyle } = useDragReorder({ index, totalCount, onReorder });

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={animatedStyle}>
				<Pressable
					style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
					onPress={() => toggleTodo(todo.id)}
					accessibilityRole="checkbox"
					accessibilityState={{ checked: todo.completed }}
				>
					<Text style={styles.dragHandle}>⠿</Text>
					<Text style={styles.emoji}>{todo.emoji}</Text>
					<Text
						style={[
							styles.title,
							{ color: theme.foreground },
							todo.completed && styles.completedTitle,
							todo.completed && { color: theme.mutedForeground },
						]}
						numberOfLines={1}
					>
						{todo.title}
					</Text>
					<View
						style={[
							styles.checkbox,
							{ borderColor: theme.border },
							todo.completed && { backgroundColor: theme.primary, borderColor: theme.primary },
						]}
					>
						{todo.completed && <Text style={styles.checkmark}>✓</Text>}
					</View>
				</Pressable>
			</Animated.View>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: parseNumeric(spacing[3]),
		paddingLeft: parseNumeric(spacing[2]),
		paddingRight: parseNumeric(spacing[4]),
		borderRadius: parseNumeric(radius.xl),
		borderWidth: 1,
		gap: parseNumeric(spacing[2]),
		height: 56,
	},
	dragHandle: {
		fontSize: 16,
		opacity: 0.3,
	},
	emoji: {
		fontSize: 20,
	},
	title: {
		...textBase,
		flex: 1,
		fontSize: 16,
	},
	completedTitle: {
		textDecorationLine: "line-through",
		opacity: 0.6,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: parseNumeric(radius.md),
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	checkmark: {
		color: "white",
		fontSize: 14,
		fontWeight: "bold",
	},
});
