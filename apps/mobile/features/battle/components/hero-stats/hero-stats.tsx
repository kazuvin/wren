import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../../constants/theme";
import type { HeroStats } from "../../types";

type HeroStatsProps = {
	baseStats: HeroStats;
	effectiveStats: HeroStats;
	currentFloor: number;
};

function formatStat(label: string, base: number, effective: number): string {
	const bonus = effective - base;
	if (bonus > 0) {
		return `${label}: ${effective}(+${bonus})`;
	}
	return `${label}: ${effective}`;
}

export function HeroStatsDisplay({ baseStats, effectiveStats, currentFloor }: HeroStatsProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
			<Text style={[styles.floorText, { color: theme.primary }]}>フロア: {currentFloor}</Text>
			<View style={styles.statsRow}>
				<Text style={[styles.statText, { color: theme.foreground }]}>
					HP: {effectiveStats.hp}/{effectiveStats.maxHp}
				</Text>
				<Text style={[styles.statText, { color: theme.foreground }]}>
					{formatStat("ATK", baseStats.atk, effectiveStats.atk)}
				</Text>
				<Text style={[styles.statText, { color: theme.foreground }]}>
					{formatStat("DEF", baseStats.def, effectiveStats.def)}
				</Text>
			</View>
			<View style={styles.statsRow}>
				<Text style={[styles.statText, { color: theme.foreground }]}>
					{formatStat("SPD", baseStats.spd, effectiveStats.spd)}
				</Text>
				<Text style={[styles.statText, { color: theme.foreground }]}>
					{formatStat("LUK", baseStats.luk, effectiveStats.luk)}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: parseNumeric(spacing[3]),
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		gap: parseNumeric(spacing[1]),
	},
	floorText: {
		...textBase,
		fontSize: 14,
		fontWeight: "700",
	},
	statsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: parseNumeric(spacing[3]),
	},
	statText: {
		...textBase,
		fontSize: 12,
		fontWeight: "500",
	},
});
