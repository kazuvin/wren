import { BattleScreenContainer, GachaNotificationContainer } from "@/features/battle";
import { useBattleTick } from "@/features/battle/hooks/use-battle-tick";
import { useTaskReward } from "@/features/battle/hooks/use-task-reward";
import { AddTodoFab, TodoListContainer } from "@/features/todo";
import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const insets = useSafeAreaInsets();

	useBattleTick();
	useTaskReward();

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GachaNotificationContainer />
			<ScrollView
				contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
				showsVerticalScrollIndicator={false}
			>
				<BattleScreenContainer />
				<TodoListContainer />
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
