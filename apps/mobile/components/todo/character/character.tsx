import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { useEffect } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { textBase } from "../../../constants/theme";
import { getCompletedCount, useTodoStore } from "../../../stores/todo-store";
import { getCharacterLevel, getCharacterScale } from "../../../utils/character-level";

const CHARACTER_FACES = ["🥚", "🐣", "🐥", "🐔"];

export function Character() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const completedCount = useTodoStore((s) => getCompletedCount(s.todos));
	const level = getCharacterLevel(completedCount);
	const targetScale = getCharacterScale(completedCount);
	const scale = useSharedValue(targetScale);

	useEffect(() => {
		scale.value = withTiming(targetScale, { duration: 500 });
	}, [targetScale, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const face = CHARACTER_FACES[level.level - 1];

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.characterWrap, animatedStyle]}>
				<Text style={styles.character}>{face}</Text>
			</Animated.View>
			<Text style={[styles.levelText, { color: theme.mutedForeground }]}>
				Lv.{level.level} {level.name}
			</Text>
			{level.requiredForNext !== null && (
				<Text style={[styles.progressText, { color: theme.mutedForeground }]}>
					次のレベルまで あと {level.requiredForNext - completedCount} 個
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		paddingVertical: parseNumeric(spacing[6]),
		gap: parseNumeric(spacing[2]),
	},
	characterWrap: {
		width: 120,
		height: 120,
		justifyContent: "center",
		alignItems: "center",
	},
	character: {
		fontSize: 80,
	},
	levelText: {
		...textBase,
		fontSize: 16,
		fontWeight: "600",
	},
	progressText: {
		...textBase,
		fontSize: 12,
	},
});
