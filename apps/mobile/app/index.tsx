import { AddTodoFab } from "@/components/todo/add-todo-fab";
import { Character } from "@/components/todo/character";
import { TodoList } from "@/components/todo/todo-list";
import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<ScrollView
				contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
				showsVerticalScrollIndicator={false}
			>
				<Character />
				<TodoList />
				<View style={styles.bottomSpacer} />
			</ScrollView>
			<AddTodoFab onPress={() => router.push("/modal")} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scroll: {
		paddingBottom: parseNumeric(spacing[16]),
	},
	bottomSpacer: {
		height: 100,
	},
});
