import type {
	EquipmentReward,
	GachaReward,
	HeroStats,
	Rarity,
	SkillReward,
	StatBoostReward,
} from "../types";
import { getEquipmentByRarity } from "./equipment";
import { getSkillsByRarity } from "./skill";

// =============================================================================
// 定数
// =============================================================================

export const RARITY_PROBABILITIES = {
	common: 0.6,
	rare: 0.25,
	epic: 0.12,
	legendary: 0.03,
} as const;

export const BOSS_RARITY_PROBABILITIES = {
	rare: 0.5,
	epic: 0.35,
	legendary: 0.15,
} as const;

const RARITY_COLORS: Record<Rarity, string> = {
	common: "#9CA3AF",
	rare: "#3B82F6",
	epic: "#A855F7",
	legendary: "#F59E0B",
};

const RARITY_LABELS: Record<Rarity, string> = {
	common: "コモン",
	rare: "レア",
	epic: "エピック",
	legendary: "レジェンダリー",
};

const BOOST_STATS: (keyof Omit<HeroStats, "hp" | "maxHp">)[] = ["atk", "def", "spd", "luk"];

/** レアリティごとのステータスブースト値の範囲 */
const STAT_BOOST_RANGES: Partial<Record<Rarity, { min: number; max: number }>> = {
	common: { min: 1, max: 3 },
	rare: { min: 5, max: 10 },
	epic: { min: 10, max: 15 },
};

/** レアリティごとの報酬種別サブ確率 [stat_boost, skill] (残りがequipment) */
const REWARD_TYPE_THRESHOLDS: Record<Rarity, { statBoost: number; skill: number }> = {
	common: { statBoost: 1.0, skill: 0 },
	rare: { statBoost: 0.4, skill: 0.7 },
	epic: { statBoost: 0.2, skill: 0.6 },
	legendary: { statBoost: 0, skill: 0.5 },
};

// =============================================================================
// rollRarity
// =============================================================================

export function rollRarity(random: () => number = Math.random): Rarity {
	const roll = random();
	const { common, rare, epic } = RARITY_PROBABILITIES;

	if (roll < common) return "common";
	if (roll < common + rare) return "rare";
	if (roll < common + rare + epic) return "epic";
	return "legendary";
}

// =============================================================================
// generateStatBoost
// =============================================================================

export function generateStatBoost(
	rarity: Rarity,
	random: () => number = Math.random,
): StatBoostReward {
	const stat = pickFromArray(BOOST_STATS, random);
	const defaultRange = { min: 1, max: 3 };
	const range = STAT_BOOST_RANGES[rarity] ?? defaultRange;
	const amount = rollInRange(range.min, range.max, random);

	return { type: "stat_boost", rarity, stat, amount };
}

// =============================================================================
// generateReward
// =============================================================================

export function generateReward(random: () => number = Math.random): GachaReward {
	const rarity = rollRarity(random);
	return generateRewardForRarity(rarity, random);
}

// =============================================================================
// generateBossReward
// =============================================================================

export function generateBossReward(random: () => number = Math.random): GachaReward {
	const rarity = rollBossRarity(random);
	return generateRewardForRarity(rarity, random);
}

// =============================================================================
// getRarityColor / getRarityLabel
// =============================================================================

export function getRarityColor(rarity: Rarity): string {
	return RARITY_COLORS[rarity];
}

export function getRarityLabel(rarity: Rarity): string {
	return RARITY_LABELS[rarity];
}

// =============================================================================
// 内部ヘルパー
// =============================================================================

function rollBossRarity(random: () => number): Rarity {
	const roll = random();
	const { rare, epic } = BOSS_RARITY_PROBABILITIES;

	if (roll < rare) return "rare";
	if (roll < rare + epic) return "epic";
	return "legendary";
}

function generateRewardForRarity(rarity: Rarity, random: () => number): GachaReward {
	const thresholds = REWARD_TYPE_THRESHOLDS[rarity];

	// common は statBoost=1.0 なので必ず stat_boost になる
	// legendary は statBoost=0 なので stat_boost にならない
	if (thresholds.statBoost >= 1.0) {
		return generateStatBoost(rarity, random);
	}

	const subRoll = random();

	if (subRoll < thresholds.statBoost) {
		return generateStatBoost(rarity, random);
	}
	if (subRoll < thresholds.skill) {
		return generateSkillReward(rarity, random);
	}
	return generateEquipmentReward(rarity, random);
}

function generateSkillReward(rarity: Rarity, random: () => number): SkillReward {
	const skills = getSkillsByRarity(rarity);
	const skill = pickFromArray(skills, random);
	return { type: "skill", rarity, skillId: skill.id };
}

function generateEquipmentReward(rarity: Rarity, random: () => number): EquipmentReward {
	const equipment = getEquipmentByRarity(rarity);
	const item = pickFromArray(equipment, random);
	return { type: "equipment", rarity, equipmentId: item.id };
}

/** 配列からランダムに1つ選択する */
function pickFromArray<T>(items: readonly T[], random: () => number): T {
	const index = Math.min(Math.floor(random() * items.length), items.length - 1);
	return items[index];
}

/** min~max の整数をランダムに返す */
function rollInRange(min: number, max: number, random: () => number): number {
	return Math.min(min + Math.floor(random() * (max - min + 1)), max);
}
