import type { EquippedSkill, HeroStats, OfflineProgressResult, OwnedSkill } from "../types";
import {
	calculateDamage,
	getSkillCooldownForLevel,
	getSkillMultiplierForLevel,
} from "./battle-engine";
import { generateMonster } from "./monster";
import { getSkillDefinition } from "./skill";

// =============================================================================
// 定数
// =============================================================================

export const MAX_OFFLINE_TICKS = 86400;

const ATTACK_INTERVAL = 3;

// =============================================================================
// calculateElapsedTicks
// =============================================================================

export function calculateElapsedTicks(lastTickTime: number, currentTime: number): number {
	if (lastTickTime === 0 || currentTime < lastTickTime) {
		return 0;
	}
	const ticks = Math.floor((currentTime - lastTickTime) / 1000);
	return Math.min(ticks, MAX_OFFLINE_TICKS);
}

// =============================================================================
// simulateOfflineBattle
// =============================================================================

type SimulateParams = {
	hero: HeroStats;
	equippedSkills: EquippedSkill[];
	ownedSkills: OwnedSkill[];
	currentFloor: number;
	elapsedTicks: number;
	random?: () => number;
};

export function simulateOfflineBattle(params: SimulateParams): OfflineProgressResult {
	const {
		hero: initialHero,
		equippedSkills: initialSkills,
		ownedSkills,
		currentFloor: startFloor,
		elapsedTicks,
		random = Math.random,
	} = params;

	if (elapsedTicks === 0) {
		return {
			elapsedTicks: 0,
			floorsCleared: 0,
			monstersDefeated: 0,
			rewards: [],
			finalFloor: startFloor,
			heroDeaths: 0,
		};
	}

	// ミュータブルな状態を用意
	let heroHp = initialHero.hp;
	const heroMaxHp = initialHero.maxHp;
	const heroAtk = initialHero.atk;
	const heroDef = initialHero.def;

	let currentFloor = startFloor;
	let monstersDefeated = 0;
	let heroDeaths = 0;

	// スキルクールダウンの状態（ミュータブル）
	const skillCooldowns: number[] = initialSkills.map((s) => s.currentCooldown);

	// スキル情報のキャッシュ
	const skillInfos = initialSkills.map((equipped) => {
		const def = getSkillDefinition(equipped.skillId);
		const owned = ownedSkills.find((o) => o.skillId === equipped.skillId);
		const level = owned?.level ?? 1;
		return {
			skillId: equipped.skillId,
			definition: def,
			level,
			multiplier: def ? getSkillMultiplierForLevel(def.baseDamageMultiplier, level) : 1.0,
			cooldown: def ? getSkillCooldownForLevel(def.baseCooldown, level) : 0,
		};
	});

	// 現在のモンスターを生成し、戦闘用にプリミティブ変数へキャッシュ
	let monster = generateMonster(currentFloor, random);
	let monsterHp = monster.hp;
	let monsterDef = monster.def;
	let monsterAtk = monster.atk;

	const skillCount = skillCooldowns.length;

	for (let tick = 1; tick <= elapsedTicks; tick++) {
		// 攻撃タイミング判定（3 tick ごと）
		if (tick % ATTACK_INTERVAL === 0) {
			// --- ヒーローの攻撃 ---
			let damage = 0;

			// スキル発動チェック
			let skillFired = false;
			for (let i = 0; i < skillCount; i++) {
				if (skillCooldowns[i] === 0 && skillInfos[i].definition) {
					damage = calculateDamage(heroAtk, monsterDef, skillInfos[i].multiplier);
					skillCooldowns[i] = skillInfos[i].cooldown;
					skillFired = true;
					break;
				}
			}

			if (!skillFired) {
				damage = calculateDamage(heroAtk, monsterDef, 1.0);
			}

			monsterHp -= damage;

			// モンスター撃破チェック
			if (monsterHp <= 0) {
				monstersDefeated++;
				currentFloor++;
				monster = generateMonster(currentFloor, random);
				monsterHp = monster.hp;
				monsterDef = monster.def;
				monsterAtk = monster.atk;
			}

			// --- モンスターの攻撃 ---
			heroHp -= Math.max(1, Math.floor(monsterAtk - heroDef * 0.5));

			// ヒーロー死亡チェック
			if (heroHp <= 0) {
				heroDeaths++;
				heroHp = heroMaxHp;
			}
		}

		// スキルクールダウン減少（毎 tick）
		for (let i = 0; i < skillCount; i++) {
			if (skillCooldowns[i] > 0) {
				skillCooldowns[i]--;
			}
		}
	}

	return {
		elapsedTicks,
		floorsCleared: currentFloor - startFloor,
		monstersDefeated,
		rewards: [],
		finalFloor: currentFloor,
		heroDeaths,
	};
}

// =============================================================================
// formatOfflineResult
// =============================================================================

export function formatOfflineResult(result: OfflineProgressResult): string {
	if (result.elapsedTicks === 0) {
		return "留守中の進捗はありません";
	}

	return [
		`留守中に ${result.floorsCleared} フロア進みました!`,
		`モンスター撃破数: ${result.monstersDefeated}`,
		`到達フロア: ${result.finalFloor}`,
	].join("\n");
}
