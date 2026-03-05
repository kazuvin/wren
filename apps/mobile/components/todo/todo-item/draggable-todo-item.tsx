import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { useSetAtom } from "jotai";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { textBase } from "../../../constants/theme";
import type { Todo } from "../../../stores/todo-store";
import { toggleTodoAtom } from "../../../stores/todo-store";

const ITEM_HEIGHT = 56;

type DraggableTodoItemProps = {
	todo: Todo;
	index: number;
	totalCount: number;
	onReorder: (fromIndex: number, toIndex: number) => void;
};

export function DraggableTodoItem({ todo, index, totalCount, onReorder }: DraggableTodoItemProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const toggleTodo = useSetAtom(toggleTodoAtom);
	const translateY = useSharedValue(0);
	const isActive = useSharedValue(false);
	const zIndex = useSharedValue(0);

	const panGesture = Gesture.Pan()
		.activeOffsetY([-10, 10])
		.onStart(() => {
			isActive.value = true;
			zIndex.value = 100;
		})
		.onUpdate((e) => {
			translateY.value = e.translationY;
		})
		.onEnd(() => {
			const movedPositions = Math.round(translateY.value / ITEM_HEIGHT);
			const newIndex = Math.max(0, Math.min(totalCount - 1, index + movedPositions));

			if (newIndex !== index) {
				runOnJS(onReorder)(index, newIndex);
			}

			translateY.value = withTiming(0, { duration: 200 });
			isActive.value = false;
			zIndex.value = 0;
		});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		zIndex: zIndex.value,
		opacity: isActive.value ? 0.9 : 1,
	}));

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
		height: ITEM_HEIGHT,
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
