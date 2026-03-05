import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { useAtomValue, useSetAtom } from "jotai";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../constants/theme";
import { reorderTodosAtom, todosAtom } from "../../../stores/todo-store";
import { DraggableTodoItem } from "../todo-item/draggable-todo-item";

export function TodoList() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const todos = useAtomValue(todosAtom);
	const reorder = useSetAtom(reorderTodosAtom);

	const handleReorder = (fromIndex: number, toIndex: number) => {
		reorder({ fromIndex, toIndex });
	};

	return (
		<View style={styles.container}>
			<Text style={[styles.heading, { color: theme.foreground }]}>Todo</Text>
			<View style={styles.list}>
				{todos.length === 0 ? (
					<Text style={[styles.empty, { color: theme.mutedForeground }]}>
						タスクを追加しましょう！
					</Text>
				) : (
					todos.map((todo, index) => (
						<DraggableTodoItem
							key={todo.id}
							todo={todo}
							index={index}
							totalCount={todos.length}
							onReorder={handleReorder}
						/>
					))
				)}
			</View>
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
});
