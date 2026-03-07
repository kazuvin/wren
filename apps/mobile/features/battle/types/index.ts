// =============================================================================
// Rarity
// =============================================================================

export type Rarity = "common" | "rare" | "epic" | "legendary";

// =============================================================================
// Hero
// =============================================================================

export type HeroStats = {
	hp: number;
	maxHp: number;
	atk: number;
	def: number;
	spd: number;
	luk: number;
};

// =============================================================================
// Skill
// =============================================================================

export type SkillId = string;

export type SkillDefinition = {
	id: SkillId;
	name: string;
	emoji: string;
	description: string;
	baseDamageMultiplier: number;
	baseCooldown: number;
	rarity: Rarity;
	/** "attack" | "buff" | "debuff" | "heal" | "special" */
	category: SkillCategory;
};

export type SkillCategory = "attack" | "buff" | "debuff" | "heal" | "special";

export type OwnedSkill = {
	skillId: SkillId;
	level: number;
};

export type EquippedSkill = {
	skillId: SkillId;
	currentCooldown: number;
};

// =============================================================================
// Equipment
// =============================================================================

export type EquipmentId = string;

export type EquipmentSlot = "weapon" | "armor" | "accessory";

export type EquipmentDefinition = {
	id: EquipmentId;
	name: string;
	emoji: string;
	slot: EquipmentSlot;
	rarity: Rarity;
	stats: Partial<EquipmentStats>;
};

export type EquipmentStats = {
	atk: number;
	def: number;
	hp: number;
	spd: number;
	luk: number;
};

// =============================================================================
// Monster
// =============================================================================

export type Monster = {
	name: string;
	emoji: string;
	hp: number;
	maxHp: number;
	atk: number;
	def: number;
};

export type MonsterTemplate = {
	name: string;
	emoji: string;
	baseHp: number;
	baseAtk: number;
	baseDef: number;
};

// =============================================================================
// Battle
// =============================================================================

export type BattleLogEntry = {
	tick: number;
	message: string;
	type:
		| "hero_attack"
		| "monster_attack"
		| "skill"
		| "critical"
		| "defeat"
		| "level_up"
		| "revive"
		| "boss"
		| "hero_defeat";
};

export type BattleState = {
	currentFloor: number;
	currentTick: number;
	hero: HeroStats;
	equippedSkills: EquippedSkill[];
	monster: Monster;
	battleLog: BattleLogEntry[];
	lastTickTime: number;
	isBossFloor: boolean;
};

// =============================================================================
// Gacha / Rewards
// =============================================================================

export type GachaRewardType = "stat_boost" | "skill" | "equipment";

export type StatBoostReward = {
	type: "stat_boost";
	rarity: Rarity;
	stat: keyof Omit<HeroStats, "hp" | "maxHp">;
	amount: number;
};

export type SkillReward = {
	type: "skill";
	rarity: Rarity;
	skillId: SkillId;
};

export type EquipmentReward = {
	type: "equipment";
	rarity: Rarity;
	equipmentId: EquipmentId;
};

export type GachaReward = StatBoostReward | SkillReward | EquipmentReward;

// =============================================================================
// Offline Progress
// =============================================================================

export type OfflineProgressResult = {
	elapsedTicks: number;
	floorsCleared: number;
	monstersDefeated: number;
	rewards: GachaReward[];
	finalFloor: number;
	heroDeaths: number;
};
