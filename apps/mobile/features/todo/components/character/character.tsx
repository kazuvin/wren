import { colors, parseNumeric, spacing } from "@wren/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { textBase } from "../../../../constants/theme";
import type { CharacterLevel } from "../../utils/character-level";

type CharacterProps = {
	face: string;
	level: CharacterLevel;
	remaining: number | null;
	animatedStyle: AnimatedStyle;
};

export function Character({ face, level, remaining, animatedStyle }: CharacterProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.characterWrap, animatedStyle]}>
				<Text style={styles.character}>{face}</Text>
			</Animated.View>
			<Text style={[styles.levelText, { color: theme.mutedForeground }]}>
				Lv.{level.level} {level.name}
			</Text>
			{remaining !== null && (
				<Text style={[styles.progressText, { color: theme.mutedForeground }]}>
					次のレベルまで あと {remaining} 個
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
