import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../../constants/theme";
import type { EquipmentId, EquipmentSlot } from "../../types";
import { getEquipmentDefinition } from "../../utils/equipment";
import { getRarityColor } from "../../utils/gacha";

type EquipmentManagementProps = {
	equippedItems: {
		weapon: EquipmentId | null;
		armor: EquipmentId | null;
		accessory: EquipmentId | null;
	};
	ownedEquipment: EquipmentId[];
	onEquip: (equipmentId: EquipmentId) => void;
	onUnequip: (slot: EquipmentSlot) => void;
};

const SLOT_CONFIG: { slot: EquipmentSlot; emoji: string; label: string }[] = [
	{ slot: "weapon", emoji: "\u{1F5E1}\uFE0F", label: "武器" },
	{ slot: "armor", emoji: "\u{1F6E1}\uFE0F", label: "防具" },
	{ slot: "accessory", emoji: "\u{1F48D}", label: "アクセサリー" },
];

function formatStats(stats: Partial<Record<string, number>>): string {
	const parts: string[] = [];
	const statLabels: Record<string, string> = {
		atk: "ATK",
		def: "DEF",
		hp: "HP",
		spd: "SPD",
		luk: "LUK",
	};

	for (const [key, label] of Object.entries(statLabels)) {
		const value = stats[key];
		if (value && value > 0) {
			parts.push(`${label}+${value}`);
		}
	}

	return parts.join(" ");
}

export function EquipmentManagement({
	equippedItems,
	ownedEquipment,
	onEquip,
	onUnequip,
}: EquipmentManagementProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const equippedIds = new Set(
		Object.values(equippedItems).filter((id): id is EquipmentId => id !== null),
	);

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.sectionTitle, { color: theme.foreground }]}>装備中</Text>

			<View style={styles.equippedSection}>
				{SLOT_CONFIG.map(({ slot, emoji, label }) => {
					const equippedId = equippedItems[slot];
					const def = equippedId ? getEquipmentDefinition(equippedId) : undefined;

					return (
						<View
							key={slot}
							style={[
								styles.equippedRow,
								{ backgroundColor: theme.card, borderColor: theme.border },
							]}
						>
							<Text style={styles.slotEmoji}>{emoji}</Text>
							<Text style={[styles.slotLabel, { color: theme.mutedForeground }]}>{label}:</Text>
							<Text
								style={[
									styles.equippedName,
									{ color: def ? theme.foreground : theme.mutedForeground },
								]}
							>
								{def ? def.name : "---"}
							</Text>

							{def ? (
								<Pressable
									style={[styles.unequipButton, { backgroundColor: theme.muted }]}
									onPress={() => onUnequip(slot)}
								>
									<Text style={[styles.unequipButtonText, { color: theme.mutedForeground }]}>
										外す
									</Text>
								</Pressable>
							) : (
								<View style={styles.unequipPlaceholder}>
									<Text style={[styles.unequipButtonText, { color: theme.mutedForeground }]}>
										---
									</Text>
								</View>
							)}
						</View>
					);
				})}
			</View>

			<Text style={[styles.sectionTitle, { color: theme.foreground }]}>所持アイテム</Text>

			{ownedEquipment.length === 0 ? (
				<Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
					アイテムがありません
				</Text>
			) : (
				<ScrollView style={styles.listContainer}>
					{ownedEquipment.map((eqId) => {
						const def = getEquipmentDefinition(eqId);
						if (!def) return null;

						const isEquipped = equippedIds.has(eqId);
						const rarityColor = getRarityColor(def.rarity);
						const statsText = formatStats(def.stats);

						return (
							<View
								key={eqId}
								style={[styles.itemRow, { backgroundColor: theme.card, borderColor: theme.border }]}
							>
								<View style={styles.itemInfo}>
									<View style={styles.itemHeader}>
										<Text style={styles.itemEmoji}>{def.emoji}</Text>
										<Text style={[styles.itemName, { color: theme.foreground }]}>{def.name}</Text>
										<View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
									</View>
									<Text style={[styles.itemStats, { color: theme.mutedForeground }]}>
										{statsText}
									</Text>
								</View>

								<Pressable
									style={[
										styles.actionButton,
										isEquipped
											? { backgroundColor: theme.muted }
											: { backgroundColor: theme.primary },
									]}
									onPress={() => {
										if (isEquipped) {
											onUnequip(def.slot);
										} else {
											onEquip(eqId);
										}
									}}
								>
									<Text
										style={[
											styles.actionButtonText,
											isEquipped
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
	equippedSection: {
		gap: parseNumeric(spacing[2]),
	},
	equippedRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: parseNumeric(spacing[3]),
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		gap: parseNumeric(spacing[2]),
	},
	slotEmoji: {
		fontSize: 20,
	},
	slotLabel: {
		...textBase,
		fontSize: 13,
		fontWeight: "600",
		width: 80,
	},
	equippedName: {
		...textBase,
		fontSize: 14,
		fontWeight: "500",
		flex: 1,
	},
	unequipButton: {
		paddingHorizontal: parseNumeric(spacing[3]),
		paddingVertical: parseNumeric(spacing[1]),
		borderRadius: parseNumeric(radius.md),
	},
	unequipPlaceholder: {
		paddingHorizontal: parseNumeric(spacing[3]),
		paddingVertical: parseNumeric(spacing[1]),
	},
	unequipButtonText: {
		...textBase,
		fontSize: 12,
		fontWeight: "600",
	},
	listContainer: {
		flex: 1,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: parseNumeric(spacing[3]),
		borderRadius: parseNumeric(radius.lg),
		borderWidth: 1,
		marginBottom: parseNumeric(spacing[2]),
	},
	itemInfo: {
		flex: 1,
		gap: parseNumeric(spacing[1]),
	},
	itemHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[2]),
	},
	itemEmoji: {
		fontSize: 20,
	},
	itemName: {
		...textBase,
		fontSize: 14,
		fontWeight: "600",
	},
	rarityDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	itemStats: {
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
