import type { EquippedSkill, OwnedSkill, Rarity, SkillDefinition, SkillId } from "../types";

// =============================================================================
// 定数
// =============================================================================

export const MAX_SKILL_SLOTS = 5;

export const ALL_SKILLS: SkillDefinition[] = [
	{
		id: "fire",
		name: "ファイア",
		emoji: "\u{1F525}",
		description: "炎の魔法で攻撃",
		baseDamageMultiplier: 1.8,
		baseCooldown: 5,
		rarity: "common",
		category: "attack",
	},
	{
		id: "frost",
		name: "フロスト",
		emoji: "\u2744\uFE0F",
		description: "氷の魔法で攻撃し敵を減速",
		baseDamageMultiplier: 1.2,
		baseCooldown: 7,
		rarity: "rare",
		category: "attack",
	},
	{
		id: "thunder",
		name: "サンダー",
		emoji: "\u26A1",
		description: "雷の魔法で大ダメージ",
		baseDamageMultiplier: 2.5,
		baseCooldown: 10,
		rarity: "epic",
		category: "attack",
	},
	{
		id: "heal",
		name: "ヒール",
		emoji: "\u{1F49A}",
		description: "HPを20%回復",
		baseDamageMultiplier: 0,
		baseCooldown: 12,
		rarity: "rare",
		category: "heal",
	},
	{
		id: "poison",
		name: "毒撃",
		emoji: "\u{1F40D}",
		description: "毒を付与し継続ダメージ",
		baseDamageMultiplier: 0.3,
		baseCooldown: 8,
		rarity: "rare",
		category: "debuff",
	},
	{
		id: "berserk",
		name: "バーサーク",
		emoji: "\u{1F4A2}",
		description: "攻撃力2倍・防御半減",
		baseDamageMultiplier: 2.0,
		baseCooldown: 15,
		rarity: "epic",
		category: "buff",
	},
	{
		id: "precision",
		name: "会心の構え",
		emoji: "\u{1F3AF}",
		description: "次の攻撃が必ずクリティカル",
		baseDamageMultiplier: 0,
		baseCooldown: 10,
		rarity: "rare",
		category: "buff",
	},
	{
		id: "drain",
		name: "吸血斬",
		emoji: "\u{1F987}",
		description: "与ダメの30%回復",
		baseDamageMultiplier: 1.5,
		baseCooldown: 10,
		rarity: "epic",
		category: "special",
	},
	{
		id: "divine",
		name: "神の一撃",
		emoji: "\u2728",
		description: "超高倍率の一撃",
		baseDamageMultiplier: 5.0,
		baseCooldown: 25,
		rarity: "legendary",
		category: "attack",
	},
	{
		id: "shield",
		name: "シールド",
		emoji: "\u{1F6E1}\uFE0F",
		description: "防御力を一時的に2倍",
		baseDamageMultiplier: 0,
		baseCooldown: 10,
		rarity: "common",
		category: "buff",
	},
];

// =============================================================================
// スキル検索
// =============================================================================

const skillMap = new Map<SkillId, SkillDefinition>(ALL_SKILLS.map((skill) => [skill.id, skill]));

export function getSkillDefinition(skillId: SkillId): SkillDefinition | undefined {
	return skillMap.get(skillId);
}

export function getSkillDefinitionMap(): Map<SkillId, SkillDefinition> {
	return new Map(skillMap);
}

export function getSkillsByRarity(rarity: Rarity): SkillDefinition[] {
	return ALL_SKILLS.filter((skill) => skill.rarity === rarity);
}

// =============================================================================
// スキル所持管理
// =============================================================================

export function levelUpSkill(owned: OwnedSkill): OwnedSkill {
	return { ...owned, level: owned.level + 1 };
}

export function addOrLevelUpSkill(ownedSkills: OwnedSkill[], skillId: SkillId): OwnedSkill[] {
	const exists = ownedSkills.some((s) => s.skillId === skillId);
	if (exists) {
		return ownedSkills.map((s) => (s.skillId === skillId ? levelUpSkill(s) : s));
	}
	return [...ownedSkills, { skillId, level: 1 }];
}

// =============================================================================
// スキル装備管理
// =============================================================================

export function canEquipSkill(equippedSkills: EquippedSkill[], maxSlots: number): boolean {
	return equippedSkills.length < maxSlots;
}

export function equipSkill(
	equippedSkills: EquippedSkill[],
	skillId: SkillId,
	_baseCooldown: number,
): EquippedSkill[] {
	if (!canEquipSkill(equippedSkills, MAX_SKILL_SLOTS)) {
		return [...equippedSkills];
	}
	return [...equippedSkills, { skillId, currentCooldown: 0 }];
}

export function unequipSkill(equippedSkills: EquippedSkill[], skillId: SkillId): EquippedSkill[] {
	return equippedSkills.filter((s) => s.skillId !== skillId);
}
