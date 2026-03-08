import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Gesture, GestureDetector, type GestureType } from "react-native-gesture-handler";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { textBase } from "../../../../constants/theme";
import type { Todo } from "../../stores/todo-store";
import { SwipeableRow } from "./swipeable-row";

type DraggableTodoItemProps = {
	todo: Todo;
	onToggle: (id: string) => void;
	panGesture: GestureType;
	dragAnimatedStyle: AnimatedStyle;
	swipeGesture: GestureType;
	swipeAnimatedStyle: AnimatedStyle;
	swipeTranslateX: SharedValue<number>;
};

export function DraggableTodoItem({
	todo,
	onToggle,
	panGesture,
	dragAnimatedStyle,
	swipeGesture,
	swipeAnimatedStyle,
	swipeTranslateX,
}: DraggableTodoItemProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const composedGesture = Gesture.Race(panGesture, swipeGesture);

	return (
		<SwipeableRow translateX={swipeTranslateX}>
			<GestureDetector gesture={composedGesture}>
				<Animated.View style={swipeAnimatedStyle}>
					<Animated.View style={dragAnimatedStyle}>
						<Pressable
							style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
							onPress={() => onToggle(todo.id)}
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
				</Animated.View>
			</GestureDetector>
		</SwipeableRow>
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
