import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { useSetAtom } from "jotai";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { textBase } from "../../../constants/theme";
import type { Todo } from "../../../stores/todo-store";
import { toggleTodoAtom } from "../../../stores/todo-store";

type TodoItemProps = {
	todo: Todo;
};

export function TodoItem({ todo }: TodoItemProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const toggleTodo = useSetAtom(toggleTodoAtom);

	return (
		<Animated.View entering={FadeIn} exiting={FadeOut}>
			<Pressable
				style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
				onPress={() => toggleTodo(todo.id)}
				accessibilityRole="checkbox"
				accessibilityState={{ checked: todo.completed }}
			>
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
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: parseNumeric(spacing[3]),
		paddingHorizontal: parseNumeric(spacing[4]),
		borderRadius: parseNumeric(radius.xl),
		borderWidth: 1,
		gap: parseNumeric(spacing[3]),
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
