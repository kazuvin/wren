import type { EquippedSkill, HeroStats, Monster, SkillDefinition, SkillId } from "../types";

// =============================================================================
// 戻り値の型定義
// =============================================================================

export type HeroAttackResult = {
	damage: number;
	isCritical: boolean;
	skillUsed: SkillDefinition | null;
	updatedSkills: EquippedSkill[];
	updatedMonster: Monster;
};

export type MonsterAttackResult = {
	damage: number;
	updatedHero: HeroStats;
};

// =============================================================================
// 基本計算
// =============================================================================

/**
 * ダメージ計算
 * ATK * skillMultiplier - DEF * 0.5 (最低1、切り捨て)
 */
export function calculateDamage(
	attackerAtk: number,
	defenderDef: number,
	skillMultiplier: number,
): number {
	return Math.max(1, Math.floor(attackerAtk * skillMultiplier - defenderDef * 0.5));
}

/**
 * クリティカル判定
 * LUK% の確率でクリティカル
 */
export function isCritical(luk: number, random: () => number = Math.random): boolean {
	return random() < luk / 100;
}

/**
 * クリティカルダメージ適用
 * ダメージを1.5倍 (切り捨て)
 */
export function applyCritical(damage: number): number {
	return Math.floor(damage * 1.5);
}

/**
 * ボスフロア判定
 * 5の倍数ならボスフロア
 */
export function isBossFloor(floor: number): boolean {
	return floor % 5 === 0;
}

// =============================================================================
// スキルレベル補正
// =============================================================================

/**
 * スキルクールダウンのレベル補正
 * レベルごとに1ずつ減少、最低3
 */
export function getSkillCooldownForLevel(baseCooldown: number, level: number): number {
	return Math.max(3, baseCooldown - (level - 1));
}

/**
 * スキル倍率のレベル補正
 * レベルごとにbaseの10%ずつ増加
 */
export function getSkillMultiplierForLevel(baseMultiplier: number, level: number): number {
	return baseMultiplier * (1 + (level - 1) * 0.1);
}

// =============================================================================
// 内部ヘルパー
// =============================================================================

/**
 * 装備スキルから使用可能な最初のスキルを検索
 */
function findReadySkill(
	equippedSkills: EquippedSkill[],
	skillDefinitions: Map<SkillId, SkillDefinition>,
): { skill: SkillDefinition; index: number } | null {
	for (let i = 0; i < equippedSkills.length; i++) {
		if (equippedSkills[i].currentCooldown === 0) {
			const definition = skillDefinitions.get(equippedSkills[i].skillId);
			if (definition) {
				return { skill: definition, index: i };
			}
		}
	}
	return null;
}

/**
 * スキルクールダウンの更新
 * 使用したスキルはbaseCooldownにリセット、それ以外は1減少
 */
function updateCooldowns(
	equippedSkills: EquippedSkill[],
	usedSkillIndex: number,
	usedSkillBaseCooldown: number,
): EquippedSkill[] {
	return equippedSkills.map((skill, index) => {
		if (index === usedSkillIndex) {
			return { ...skill, currentCooldown: usedSkillBaseCooldown };
		}
		return {
			...skill,
			currentCooldown: Math.max(0, skill.currentCooldown - 1),
		};
	});
}

// =============================================================================
// バトル処理
// =============================================================================

/**
 * ヒーローの攻撃処理
 */
export function processHeroAttack(
	hero: HeroStats,
	monster: Monster,
	equippedSkills: EquippedSkill[],
	skillDefinitions: Map<SkillId, SkillDefinition>,
	_currentTick: number,
	random: () => number = Math.random,
): HeroAttackResult {
	const readySkill = findReadySkill(equippedSkills, skillDefinitions);

	const multiplier = readySkill?.skill.baseDamageMultiplier ?? 1.0;
	let damage = calculateDamage(hero.atk, monster.def, multiplier);

	const crit = isCritical(hero.luk, random);
	if (crit) {
		damage = applyCritical(damage);
	}

	const updatedSkills =
		readySkill !== null
			? updateCooldowns(equippedSkills, readySkill.index, readySkill.skill.baseCooldown)
			: updateCooldowns(equippedSkills, -1, 0);

	return {
		damage,
		isCritical: crit,
		skillUsed: readySkill?.skill ?? null,
		updatedSkills,
		updatedMonster: { ...monster, hp: monster.hp - damage },
	};
}

/**
 * モンスターの攻撃処理
 */
export function processMonsterAttack(monster: Monster, hero: HeroStats): MonsterAttackResult {
	const damage = Math.max(1, Math.floor(monster.atk - hero.def * 0.5));

	return {
		damage,
		updatedHero: { ...hero, hp: Math.max(0, hero.hp - damage) },
	};
}

/**
 * ヒーロー復活
 */
export function reviveHero(hero: HeroStats): HeroStats {
	return { ...hero, hp: hero.maxHp };
}
