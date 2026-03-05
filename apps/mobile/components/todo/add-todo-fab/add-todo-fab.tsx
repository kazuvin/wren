import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

type AddTodoFabProps = {
	onPress: () => void;
};

export function AddTodoFab({ onPress }: AddTodoFabProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<Pressable
			style={[styles.fab, { backgroundColor: theme.primary }]}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel="タスクを追加"
		>
			<Text style={[styles.icon, { color: theme.primaryForeground }]}>+</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		bottom: parseNumeric(spacing[8]),
		right: parseNumeric(spacing[6]),
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	icon: {
		fontSize: 28,
		fontWeight: "300",
		lineHeight: 30,
	},
});
