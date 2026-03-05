import { Input } from "@/components/ui/input";
import { textBase } from "@/constants/theme";
import { useTodoStore } from "@/stores/todo-store";
import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

const EMOJI_OPTIONS = ["📝", "😊", "🌱", "🛁", "🍳", "💪", "📚", "🎵"];

export default function AddTodoModal() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const addTodo = useTodoStore((s) => s.addTodo);
	const [title, setTitle] = useState("");
	const [selectedEmoji, setSelectedEmoji] = useState("📝");

	const handleAdd = () => {
		if (title.trim() === "") return;
		addTodo({ title: title.trim(), emoji: selectedEmoji });
		router.back();
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.heading, { color: theme.foreground }]}>タスクを追加</Text>

			<View style={styles.emojiRow}>
				{EMOJI_OPTIONS.map((emoji) => (
					<Pressable
						key={emoji}
						style={[
							styles.emojiButton,
							{ borderColor: theme.border },
							selectedEmoji === emoji && {
								borderColor: theme.primary,
								backgroundColor: theme.secondary,
							},
						]}
						onPress={() => setSelectedEmoji(emoji)}
					>
						<Text style={styles.emojiText}>{emoji}</Text>
					</Pressable>
				))}
			</View>

			<Input
				placeholder="タスク名を入力..."
				value={title}
				onChangeText={setTitle}
				autoFocus
				onSubmitEditing={handleAdd}
				returnKeyType="done"
			/>

			<Pressable
				style={[
					styles.addButton,
					{ backgroundColor: theme.primary },
					title.trim() === "" && styles.disabledButton,
				]}
				onPress={handleAdd}
				disabled={title.trim() === ""}
			>
				<Text style={[styles.addButtonText, { color: theme.primaryForeground }]}>追加する</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: parseNumeric(spacing[6]),
		gap: parseNumeric(spacing[5]),
	},
	heading: {
		...textBase,
		fontSize: 24,
		fontWeight: "700",
	},
	emojiRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: parseNumeric(spacing[2]),
	},
	emojiButton: {
		width: 44,
		height: 44,
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	emojiText: {
		fontSize: 20,
	},
	addButton: {
		paddingVertical: parseNumeric(spacing[3]),
		borderRadius: parseNumeric(radius.xl),
		alignItems: "center",
	},
	disabledButton: {
		opacity: 0.5,
	},
	addButtonText: {
		...textBase,
		fontSize: 16,
		fontWeight: "600",
	},
});
