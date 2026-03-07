import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../../constants/theme";
import type { EquippedSkill, OwnedSkill, SkillId } from "../../types";
import { getRarityColor } from "../../utils/gacha";
import { MAX_SKILL_SLOTS, getSkillDefinition } from "../../utils/skill";

type SkillManagementProps = {
	ownedSkills: OwnedSkill[];
	equippedSkills: EquippedSkill[];
	onEquip: (skillId: SkillId) => void;
	onUnequip: (skillId: SkillId) => void;
};

export function SkillManagement({
	ownedSkills,
	equippedSkills,
	onEquip,
	onUnequip,
}: SkillManagementProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const equippedSkillIds = new Set(equippedSkills.map((s) => s.skillId));
	const isFull = equippedSkills.length >= MAX_SKILL_SLOTS;

	const slots = Array.from({ length: MAX_SKILL_SLOTS }, (_, i) => {
		const equipped = equippedSkills[i];
		if (!equipped) return null;
		const def = getSkillDefinition(equipped.skillId);
		const owned = ownedSkills.find((s) => s.skillId === equipped.skillId);
		return { def, owned, skillId: equipped.skillId };
	});

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.sectionTitle, { color: theme.foreground }]}>装備中のスキル</Text>

			<View style={styles.slotsRow}>
				{slots.map((slot, slotIndex) => {
					const slotKey = slot?.skillId ? `skill-${slot.skillId}` : `slot-${String(slotIndex)}`;
					if (slot?.def) {
						return (
							<Pressable
								key={slotKey}
								style={[
									styles.slot,
									styles.slotFilled,
									{ backgroundColor: theme.card, borderColor: theme.border },
								]}
								onPress={() => onUnequip(slot.skillId)}
							>
								<Text style={styles.slotEmoji}>{slot.def.emoji}</Text>
								<Text style={[styles.slotLevel, { color: theme.mutedForeground }]}>
									Lv.{slot.owned?.level ?? 1}
								</Text>
							</Pressable>
						);
					}
					return (
						<View
							key={slotKey}
							style={[styles.slot, styles.slotEmpty, { borderColor: theme.border }]}
						>
							<Text style={[styles.slotEmptyText, { color: theme.mutedForeground }]}>-</Text>
						</View>
					);
				})}
			</View>

			<Text style={[styles.sectionTitle, { color: theme.foreground }]}>所持スキル</Text>

			{ownedSkills.length === 0 ? (
				<Text style={[styles.emptyText, { color: theme.mutedForeground }]}>スキルがありません</Text>
			) : (
				<ScrollView style={styles.listContainer}>
					{ownedSkills.map((owned) => {
						const def = getSkillDefinition(owned.skillId);
						if (!def) return null;

						const isEquipped = equippedSkillIds.has(owned.skillId);
						const rarityColor = getRarityColor(def.rarity);

						return (
							<View
								key={owned.skillId}
								style={[
									styles.skillRow,
									{ backgroundColor: theme.card, borderColor: theme.border },
								]}
							>
								<View style={styles.skillInfo}>
									<View style={styles.skillHeader}>
										<Text style={styles.skillEmoji}>{def.emoji}</Text>
										<Text style={[styles.skillName, { color: theme.foreground }]}>{def.name}</Text>
										<Text style={[styles.skillLevel, { color: theme.mutedForeground }]}>
											Lv.{owned.level}
										</Text>
										<View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
									</View>
									<Text style={[styles.skillDescription, { color: theme.mutedForeground }]}>
										{def.description}
									</Text>
								</View>

								<Pressable
									style={[
										styles.actionButton,
										isEquipped
											? { backgroundColor: theme.muted }
											: isFull
												? { backgroundColor: theme.muted }
												: { backgroundColor: theme.primary },
									]}
									onPress={() => {
										if (isEquipped) {
											onUnequip(owned.skillId);
										} else if (!isFull) {
											onEquip(owned.skillId);
										}
									}}
									disabled={!isEquipped && isFull}
								>
									<Text
										style={[
											styles.actionButtonText,
											isEquipped
												? { color: theme.mutedForeground }
												: isFull
													? { color: theme.mutedForeground }
													: { color: theme.primaryForeground },
										]}
									>
										{isEquipped ? "装備済み" : "装備"}
									</Text>
								</Pressable>
							</View>
						);
					})}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: parseNumeric(spacing[4]),
		gap: parseNumeric(spacing[4]),
	},
	sectionTitle: {
		...textBase,
		fontSize: 16,
		fontWeight: "700",
	},
	slotsRow: {
		flexDirection: "row",
		gap: parseNumeric(spacing[2]),
		justifyContent: "center",
	},
	slot: {
		width: 56,
		height: 56,
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	slotFilled: {},
	slotEmpty: {
		borderStyle: "dashed",
	},
	slotEmoji: {
		fontSize: 24,
	},
	slotLevel: {
		...textBase,
		fontSize: 10,
	},
	slotEmptyText: {
		...textBase,
		fontSize: 20,
	},
	listContainer: {
		flex: 1,
	},
	skillRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: parseNumeric(spacing[3]),
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		marginBottom: parseNumeric(spacing[2]),
	},
	skillInfo: {
		flex: 1,
		gap: parseNumeric(spacing[1]),
	},
	skillHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[2]),
	},
	skillEmoji: {
		fontSize: 20,
	},
	skillName: {
		...textBase,
		fontSize: 14,
		fontWeight: "600",
	},
	skillLevel: {
		...textBase,
		fontSize: 12,
	},
	rarityDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	skillDescription: {
		...textBase,
		fontSize: 12,
		paddingLeft: parseNumeric(spacing[1]),
	},
	actionButton: {
		paddingHorizontal: parseNumeric(spacing[3]),
		paddingVertical: parseNumeric(spacing[2]),
		borderRadius: parseNumeric(radius.md),
		marginLeft: parseNumeric(spacing[2]),
	},
	actionButtonText: {
		...textBase,
		fontSize: 12,
		fontWeight: "600",
	},
	emptyText: {
		...textBase,
		fontSize: 14,
		textAlign: "center",
		paddingVertical: parseNumeric(spacing[8]),
	},
});
