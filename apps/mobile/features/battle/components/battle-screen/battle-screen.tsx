import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { textBase } from "../../../../constants/theme";
import type { BattleLogEntry, EquippedSkill, HeroStats, Monster } from "../../types";
import { getFloorZoneName } from "../../utils/monster";
import { getSkillDefinition } from "../../utils/skill";
import { HPBar } from "../hp-bar";

type BattleScreenProps = {
	hero: HeroStats;
	heroEffectiveStats: HeroStats;
	monster: Monster;
	currentFloor: number;
	battleLog: BattleLogEntry[];
	battleLogVersion: number;
	equippedSkills: EquippedSkill[];
	isBossFloor: boolean;
	isDefeated: boolean;
	onRetry: () => void;
	onNavigateSkills: () => void;
	onNavigateEquipment: () => void;
};

const MAX_SKILL_SLOTS = 5;
const VISIBLE_LOG_COUNT = 3;

const LOG_TYPE_COLORS: Record<string, string> = {
	critical: "#F59E0B",
	defeat: "",
	revive: "#3B82F6",
};

function getLogColor(
	type: BattleLogEntry["type"],
	theme: ReturnType<() => (typeof colors)["light"]>,
): string {
	if (type === "hero_attack" || type === "skill") return theme.foreground;
	if (type === "critical") return LOG_TYPE_COLORS.critical;
	if (type === "monster_attack") return theme.destructive;
	if (type === "defeat") return theme.success;
	if (type === "revive") return LOG_TYPE_COLORS.revive;
	return theme.foreground;
}

export function BattleScreen({
	hero,
	heroEffectiveStats,
	monster,
	currentFloor,
	battleLog,
	battleLogVersion,
	equippedSkills,
	isBossFloor,
	isDefeated,
	onRetry,
	onNavigateSkills,
	onNavigateEquipment,
}: BattleScreenProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const zoneName = getFloorZoneName(currentFloor);
	const visibleLogs = battleLog.slice(-VISIBLE_LOG_COUNT);

	// Attack animation shared values
	const heroTranslateX = useSharedValue(0);
	const monsterTranslateX = useSharedValue(0);

	// Track previous log version to detect new attack turns
	const prevLogVersionRef = useRef(battleLogVersion);

	useEffect(() => {
		if (battleLogVersion <= prevLogVersionRef.current) {
			prevLogVersionRef.current = battleLogVersion;
			return;
		}

		prevLogVersionRef.current = battleLogVersion;

		const recentEntries = battleLog.slice(-4);
		for (const entry of recentEntries) {
			if (entry.type === "hero_attack" || entry.type === "skill" || entry.type === "critical") {
				heroTranslateX.value = withSequence(
					withTiming(10, { duration: 100 }),
					withTiming(0, { duration: 100 }),
				);
			} else if (entry.type === "monster_attack") {
				monsterTranslateX.value = withSequence(
					withTiming(-10, { duration: 100 }),
					withTiming(0, { duration: 100 }),
				);
			}
		}
	}, [battleLogVersion, battleLog, heroTranslateX, monsterTranslateX]);

	const heroAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: heroTranslateX.value }],
	}));

	const monsterAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: monsterTranslateX.value }],
	}));

	// Build skill slots (fill to MAX_SKILL_SLOTS)
	const skillSlots: (EquippedSkill | null)[] = Array.from(
		{ length: MAX_SKILL_SLOTS },
		(_, i) => equippedSkills[i] ?? null,
	);

	return (
		<View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
			{/* Floor header */}
			<View style={styles.floorHeader}>
				<Text style={[styles.floorText, { color: theme.foreground }]}>
					{"⚔️"} フロア {currentFloor} - {zoneName}
				</Text>
				{isBossFloor && (
					<Text style={[styles.bossLabel, { color: LOG_TYPE_COLORS.critical }]}>{"👑"} ボス</Text>
				)}
			</View>

			{/* Battle area */}
			<View style={styles.battleArea}>
				{/* Hero */}
				<View style={styles.characterColumn}>
					<Animated.View style={[styles.emojiWrap, heroAnimatedStyle]}>
						<Text style={styles.emoji}>{"🧙"}</Text>
					</Animated.View>
					<HPBar
						current={heroEffectiveStats.hp}
						max={heroEffectiveStats.maxHp}
						color={theme.success}
					/>
				</View>

				{/* Monster */}
				<View style={styles.characterColumn}>
					<Animated.View style={[styles.emojiWrap, monsterAnimatedStyle]}>
						<Text style={styles.emoji}>{monster.emoji}</Text>
					</Animated.View>
					<HPBar current={monster.hp} max={monster.maxHp} color={theme.destructive} />
				</View>
			</View>

			{/* Skill slots */}
			<View style={styles.skillRow}>
				{skillSlots.map((slot, slotIndex) => {
					const slotKey = slot ? `skill-${slot.skillId}` : `slot-${String(slotIndex)}`;
					if (slot === null) {
						return (
							<View key={slotKey} style={[styles.skillSlot, { borderColor: theme.border }]}>
								<Text style={[styles.skillSlotEmpty, { color: theme.mutedForeground }]}>-</Text>
							</View>
						);
					}

					const skillDef = getSkillDefinition(slot.skillId);
					return (
						<View key={slotKey} style={[styles.skillSlot, { borderColor: theme.border }]}>
							<Text style={styles.skillEmoji}>{skillDef?.emoji ?? "?"}</Text>
							<Text
								style={[
									styles.skillCooldown,
									{
										color: slot.currentCooldown === 0 ? theme.success : theme.mutedForeground,
									},
								]}
							>
								{slot.currentCooldown}
							</Text>
						</View>
					);
				})}
			</View>

			{/* Battle log */}
			<View style={[styles.logContainer, { backgroundColor: theme.muted }]}>
				{visibleLogs.length === 0 ? (
					<Text style={[styles.logText, { color: theme.mutedForeground }]}>
						戦闘開始を待っています...
					</Text>
				) : (
					visibleLogs.map((entry, index) => (
						<Text
							key={`${entry.tick}-${index}`}
							style={[styles.logText, { color: getLogColor(entry.type, theme) }]}
						>
							{entry.message}
						</Text>
					))
				)}
			</View>

			{/* Defeat overlay */}
			{isDefeated && (
				<View style={[styles.defeatOverlay, { backgroundColor: theme.muted }]}>
					<Text style={[styles.defeatText, { color: theme.destructive }]}>
						{"💀"} 勇者は倒れた...
					</Text>
					<Pressable
						style={[styles.retryButton, { backgroundColor: theme.primary }]}
						onPress={onRetry}
					>
						<Text style={[styles.retryButtonText, { color: theme.primaryForeground }]}>
							{"⚔️"} 再戦する
						</Text>
					</Pressable>
				</View>
			)}

			{/* Navigation buttons */}
			<View style={styles.navRow}>
				<Pressable
					style={[styles.navButton, { backgroundColor: theme.secondary }]}
					onPress={onNavigateSkills}
				>
					<Text style={[styles.navButtonText, { color: theme.secondaryForeground }]}>
						{"⚡"} スキル
					</Text>
				</Pressable>
				<Pressable
					style={[styles.navButton, { backgroundColor: theme.secondary }]}
					onPress={onNavigateEquipment}
				>
					<Text style={[styles.navButtonText, { color: theme.secondaryForeground }]}>
						{"🛡️"} 装備
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		padding: parseNumeric(spacing[4]),
		gap: parseNumeric(spacing[3]),
	},
	floorHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	floorText: {
		...textBase,
		fontSize: 14,
		fontWeight: "600",
	},
	bossLabel: {
		...textBase,
		fontSize: 12,
		fontWeight: "700",
	},
	battleArea: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingVertical: parseNumeric(spacing[2]),
	},
	characterColumn: {
		alignItems: "center",
		gap: parseNumeric(spacing[1]),
		flex: 1,
	},
	emojiWrap: {
		width: 64,
		height: 64,
		justifyContent: "center",
		alignItems: "center",
	},
	emoji: {
		fontSize: 40,
	},
	skillRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: parseNumeric(spacing[2]),
	},
	skillSlot: {
		width: 44,
		height: 44,
		borderRadius: parseNumeric(radius.md),
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	skillSlotEmpty: {
		...textBase,
		fontSize: 16,
	},
	skillEmoji: {
		fontSize: 18,
	},
	skillCooldown: {
		...textBase,
		fontSize: 10,
	},
	logContainer: {
		borderRadius: parseNumeric(radius.md),
		padding: parseNumeric(spacing[2]),
		gap: parseNumeric(spacing[1]),
		minHeight: 60,
	},
	logText: {
		...textBase,
		fontSize: 12,
	},
	defeatOverlay: {
		borderRadius: parseNumeric(radius.md),
		padding: parseNumeric(spacing[4]),
		alignItems: "center",
		gap: parseNumeric(spacing[3]),
	},
	defeatText: {
		...textBase,
		fontSize: 16,
		fontWeight: "700",
	},
	retryButton: {
		paddingVertical: parseNumeric(spacing[2]),
		paddingHorizontal: parseNumeric(spacing[6]),
		borderRadius: parseNumeric(radius.md),
	},
	retryButtonText: {
		...textBase,
		fontSize: 14,
		fontWeight: "600",
	},
	navRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: parseNumeric(spacing[3]),
	},
	navButton: {
		flex: 1,
		paddingVertical: parseNumeric(spacing[2]),
		borderRadius: parseNumeric(radius.md),
		alignItems: "center",
	},
	navButtonText: {
		...textBase,
		fontSize: 13,
		fontWeight: "600",
	},
});
