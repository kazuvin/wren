import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { useEffect } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { textBase } from "../../../../constants/theme";
import type { GachaReward } from "../../types";
import { getEquipmentDefinition } from "../../utils/equipment";
import { getRarityColor, getRarityLabel } from "../../utils/gacha";
import { getSkillDefinition } from "../../utils/skill";

type GachaNotificationProps = {
	reward: GachaReward | null;
	onDismiss: () => void;
};

function getRewardDescription(reward: GachaReward): string {
	switch (reward.type) {
		case "stat_boost": {
			const statLabels: Record<string, string> = {
				atk: "ATK",
				def: "DEF",
				spd: "SPD",
				luk: "LUK",
			};
			const label = statLabels[reward.stat] ?? reward.stat;
			return `${label} +${reward.amount}`;
		}
		case "skill": {
			const skillDef = getSkillDefinition(reward.skillId);
			if (skillDef) {
				return `${skillDef.emoji} ${skillDef.name} を獲得!`;
			}
			return "スキルを獲得!";
		}
		case "equipment": {
			const equipDef = getEquipmentDefinition(reward.equipmentId);
			if (equipDef) {
				return `${equipDef.emoji} ${equipDef.name} を獲得!`;
			}
			return "装備を獲得!";
		}
	}
}

const AUTO_DISMISS_MS = 3000;
const SLIDE_DURATION = 300;

export function GachaNotification({ reward, onDismiss }: GachaNotificationProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const translateY = useSharedValue(-100);

	useEffect(() => {
		if (reward === null) {
			translateY.value = -100;
			return;
		}

		translateY.value = withSequence(
			withTiming(0, { duration: SLIDE_DURATION }),
			withDelay(AUTO_DISMISS_MS, withTiming(-100, { duration: SLIDE_DURATION })),
		);

		const timer = setTimeout(
			() => {
				onDismiss();
			},
			SLIDE_DURATION + AUTO_DISMISS_MS + SLIDE_DURATION,
		);

		return () => clearTimeout(timer);
	}, [reward, translateY, onDismiss]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	if (reward === null) {
		return null;
	}

	const rarityColor = getRarityColor(reward.rarity);
	const rarityLabel = getRarityLabel(reward.rarity);
	const description = getRewardDescription(reward);

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
				<View style={[styles.rarityBar, { backgroundColor: rarityColor }]} />
				<View style={styles.content}>
					<Text style={[styles.rarityLabel, { color: rarityColor }]}>{rarityLabel}</Text>
					<Text style={[styles.description, { color: theme.foreground }]}>{description}</Text>
				</View>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 100,
		paddingHorizontal: parseNumeric(spacing[4]),
		paddingTop: parseNumeric(spacing[2]),
	},
	card: {
		flexDirection: "row",
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 4,
	},
	rarityBar: {
		width: 4,
	},
	content: {
		flex: 1,
		padding: parseNumeric(spacing[3]),
		gap: parseNumeric(spacing[1]),
	},
	rarityLabel: {
		...textBase,
		fontSize: 11,
		fontWeight: "700",
	},
	description: {
		...textBase,
		fontSize: 14,
		fontWeight: "600",
	},
});
