import type {
	EquipmentDefinition,
	EquipmentId,
	EquipmentSlot,
	EquipmentStats,
	HeroStats,
	Rarity,
} from "../types";

// =============================================================================
// Constants
// =============================================================================

export const EQUIPMENT_SLOTS = ["weapon", "armor", "accessory"] as const;

export const ALL_EQUIPMENT: EquipmentDefinition[] = [
	// Weapons
	{
		id: "wooden_sword",
		name: "木の剣",
		emoji: "🗡️",
		slot: "weapon",
		rarity: "common",
		stats: { atk: 3 },
	},
	{
		id: "iron_sword",
		name: "鉄の剣",
		emoji: "⚔️",
		slot: "weapon",
		rarity: "rare",
		stats: { atk: 8 },
	},
	{
		id: "flame_sword",
		name: "炎の剣",
		emoji: "🔥",
		slot: "weapon",
		rarity: "epic",
		stats: { atk: 15, luk: 3 },
	},
	{
		id: "holy_sword",
		name: "聖剣",
		emoji: "✨",
		slot: "weapon",
		rarity: "legendary",
		stats: { atk: 25, luk: 5, spd: 2 },
	},
	// Armor
	{
		id: "leather_armor",
		name: "革の鎧",
		emoji: "🧥",
		slot: "armor",
		rarity: "common",
		stats: { def: 2, hp: 10 },
	},
	{
		id: "iron_armor",
		name: "鉄の鎧",
		emoji: "🛡️",
		slot: "armor",
		rarity: "rare",
		stats: { def: 5, hp: 25 },
	},
	{
		id: "dragon_armor",
		name: "竜の鎧",
		emoji: "🐉",
		slot: "armor",
		rarity: "epic",
		stats: { def: 10, hp: 50 },
	},
	{
		id: "holy_armor",
		name: "聖なる鎧",
		emoji: "👼",
		slot: "armor",
		rarity: "legendary",
		stats: { def: 18, hp: 80, spd: 1 },
	},
	// Accessories
	{
		id: "lucky_charm",
		name: "幸運のお守り",
		emoji: "🍀",
		slot: "accessory",
		rarity: "common",
		stats: { luk: 3 },
	},
	{
		id: "speed_ring",
		name: "疾風のリング",
		emoji: "💨",
		slot: "accessory",
		rarity: "rare",
		stats: { spd: 3, luk: 2 },
	},
	{
		id: "power_amulet",
		name: "力のアミュレット",
		emoji: "💪",
		slot: "accessory",
		rarity: "epic",
		stats: { atk: 8, luk: 5 },
	},
	{
		id: "divine_ring",
		name: "神のリング",
		emoji: "💍",
		slot: "accessory",
		rarity: "legendary",
		stats: { atk: 5, def: 5, hp: 30, spd: 3, luk: 8 },
	},
];

// =============================================================================
// Functions
// =============================================================================

export function getEquipmentDefinition(equipmentId: EquipmentId): EquipmentDefinition | undefined {
	return ALL_EQUIPMENT.find((e) => e.id === equipmentId);
}

export function getEquipmentBySlot(slot: EquipmentSlot): EquipmentDefinition[] {
	return ALL_EQUIPMENT.filter((e) => e.slot === slot);
}

export function getEquipmentByRarity(rarity: Rarity): EquipmentDefinition[] {
	return ALL_EQUIPMENT.filter((e) => e.rarity === rarity);
}

export function calculateEquipmentBonus(equippedIds: (EquipmentId | null)[]): EquipmentStats {
	const bonus: EquipmentStats = { atk: 0, def: 0, hp: 0, spd: 0, luk: 0 };

	for (const id of equippedIds) {
		if (id === null) continue;
		const equipment = getEquipmentDefinition(id);
		if (!equipment) continue;

		bonus.atk += equipment.stats.atk ?? 0;
		bonus.def += equipment.stats.def ?? 0;
		bonus.hp += equipment.stats.hp ?? 0;
		bonus.spd += equipment.stats.spd ?? 0;
		bonus.luk += equipment.stats.luk ?? 0;
	}

	return bonus;
}

export function applyEquipmentToHero(
	baseStats: HeroStats,
	equipmentBonus: EquipmentStats,
): HeroStats {
	return {
		hp: baseStats.hp,
		maxHp: baseStats.maxHp + equipmentBonus.hp,
		atk: baseStats.atk + equipmentBonus.atk,
		def: baseStats.def + equipmentBonus.def,
		spd: baseStats.spd + equipmentBonus.spd,
		luk: baseStats.luk + equipmentBonus.luk,
	};
}

export function canEquipToSlot(equipmentId: EquipmentId, slot: EquipmentSlot): boolean {
	const equipment = getEquipmentDefinition(equipmentId);
	if (!equipment) return false;
	return equipment.slot === slot;
}
