import { create } from "zustand";
import type {
	BattleLogEntry,
	EquipmentId,
	EquipmentSlot,
	EquippedSkill,
	GachaReward,
	HeroStats,
	Monster,
	OwnedSkill,
	SkillId,
} from "../types";
import { isBossFloor, processHeroAttack, processMonsterAttack } from "../utils/battle-engine";
import {
	applyEquipmentToHero,
	calculateEquipmentBonus,
	getEquipmentDefinition,
} from "../utils/equipment";
import { generateBossReward, generateReward } from "../utils/gacha";
import { generateMonster } from "../utils/monster";
import { calculateElapsedTicks, simulateOfflineBattle } from "../utils/offline-progress";
import {
	addOrLevelUpSkill,
	equipSkill as equipSkillUtil,
	getSkillDefinition,
	getSkillDefinitionMap,
	unequipSkill as unequipSkillUtil,
} from "../utils/skill";

// =============================================================================
// 定数
// =============================================================================

const INITIAL_HERO_BASE_STATS: HeroStats = {
	hp: 100,
	maxHp: 100,
	atk: 10,
	def: 5,
	spd: 10,
	luk: 5,
};

const MAX_BATTLE_LOG_SIZE = 20;
const ATTACK_INTERVAL = 3;

// =============================================================================
// 型定義
// =============================================================================

type EquippedItems = {
	weapon: EquipmentId | null;
	armor: EquipmentId | null;
	accessory: EquipmentId | null;
};

type GameState = {
	// Hero
	heroBaseStats: HeroStats;
	equippedSkills: EquippedSkill[];
	equippedItems: EquippedItems;

	// Inventory
	ownedSkills: OwnedSkill[];
	ownedEquipment: EquipmentId[];

	// Battle
	currentFloor: number;
	currentTick: number;
	monster: Monster;
	battleLog: BattleLogEntry[];
	battleLogVersion: number;
	lastTickTime: number;
	isDefeated: boolean;

	// Gacha notification
	lastReward: GachaReward | null;

	// Actions
	initBattle: () => void;
	processTick: () => void;
	retryBattle: () => void;
	equipSkill: (skillId: SkillId, slotIndex?: number) => void;
	unequipSkill: (skillId: SkillId) => void;
	equipItem: (equipmentId: EquipmentId) => void;
	unequipItem: (slot: EquipmentSlot) => void;
	addReward: (reward: GachaReward) => void;
	processTaskComplete: () => void;
	processOfflineProgress: (currentTime: number) => void;
	clearLastReward: () => void;
	getEffectiveStats: () => HeroStats;
};

// =============================================================================
// ヘルパー関数
// =============================================================================

function createInitialState() {
	return {
		heroBaseStats: { ...INITIAL_HERO_BASE_STATS },
		equippedSkills: [] as EquippedSkill[],
		equippedItems: {
			weapon: null,
			armor: null,
			accessory: null,
		} as EquippedItems,
		ownedSkills: [] as OwnedSkill[],
		ownedEquipment: [] as EquipmentId[],
		currentFloor: 1,
		currentTick: 0,
		monster: generateMonster(1),
		battleLog: [] as BattleLogEntry[],
		battleLogVersion: 0,
		lastTickTime: Date.now(),
		lastReward: null as GachaReward | null,
		isDefeated: false,
	};
}

export function computeEffectiveStats(base: HeroStats, equippedItems: EquippedItems): HeroStats {
	const bonus = calculateEquipmentBonus([
		equippedItems.weapon,
		equippedItems.armor,
		equippedItems.accessory,
	]);
	return applyEquipmentToHero(base, bonus);
}

function applyRewardToState(
	heroBaseStats: HeroStats,
	ownedSkills: OwnedSkill[],
	ownedEquipment: EquipmentId[],
	reward: GachaReward,
): Partial<{
	heroBaseStats: HeroStats;
	ownedSkills: OwnedSkill[];
	ownedEquipment: EquipmentId[];
}> {
	switch (reward.type) {
		case "stat_boost": {
			const newStats = { ...heroBaseStats };
			newStats[reward.stat] += reward.amount;
			return { heroBaseStats: newStats };
		}
		case "skill": {
			return {
				ownedSkills: addOrLevelUpSkill(ownedSkills, reward.skillId),
			};
		}
		case "equipment": {
			if (ownedEquipment.includes(reward.equipmentId)) {
				return {};
			}
			return {
				ownedEquipment: [...ownedEquipment, reward.equipmentId],
			};
		}
	}
}

type AttackTurnResult = {
	monster: Monster;
	heroBaseStats: HeroStats;
	equippedSkills: EquippedSkill[];
	currentFloor: number;
	lastReward: GachaReward | null;
	logs: BattleLogEntry[];
	isDefeated: boolean;
};

function processAttackTurn(
	tick: number,
	state: {
		monster: Monster;
		heroBaseStats: HeroStats;
		equippedSkills: EquippedSkill[];
		equippedItems: EquippedItems;
		currentFloor: number;
		lastReward: GachaReward | null;
		ownedSkills: OwnedSkill[];
		ownedEquipment: EquipmentId[];
	},
): AttackTurnResult {
	let { monster, heroBaseStats, equippedSkills, currentFloor, lastReward } = state;
	const logs: BattleLogEntry[] = [];

	const effectiveStats = computeEffectiveStats(heroBaseStats, state.equippedItems);

	// ヒーローの攻撃
	const heroResult = processHeroAttack(
		effectiveStats,
		monster,
		equippedSkills,
		getSkillDefinitionMap(),
		tick,
	);

	monster = heroResult.updatedMonster;
	equippedSkills = heroResult.updatedSkills;

	logs.push({
		tick,
		message: heroResult.skillUsed
			? `${heroResult.skillUsed.emoji} ${heroResult.skillUsed.name}で ${heroResult.damage} ダメージ!`
			: `${heroResult.damage} ダメージを与えた!`,
		type: heroResult.isCritical ? "critical" : heroResult.skillUsed ? "skill" : "hero_attack",
	});

	// モンスター撃破チェック
	if (monster.hp <= 0) {
		logs.push({
			tick,
			message: `${monster.emoji} ${monster.name} を倒した!`,
			type: "defeat",
		});

		if (isBossFloor(currentFloor)) {
			const bossReward = generateBossReward();
			const rewardResult = applyRewardToState(
				heroBaseStats,
				state.ownedSkills,
				state.ownedEquipment,
				bossReward,
			);
			heroBaseStats = rewardResult.heroBaseStats ?? heroBaseStats;
			lastReward = bossReward;
		}

		heroBaseStats = { ...heroBaseStats, hp: heroBaseStats.maxHp };
		currentFloor += 1;
		monster = generateMonster(currentFloor);
	}

	// モンスターの攻撃
	const monsterResult = processMonsterAttack(monster, effectiveStats);

	heroBaseStats = { ...heroBaseStats, hp: Math.max(0, heroBaseStats.hp - monsterResult.damage) };

	logs.push({
		tick,
		message: `${monster.emoji} ${monster.name} から ${monsterResult.damage} ダメージを受けた!`,
		type: "monster_attack",
	});

	// ヒーロー死亡チェック
	let isDefeated = false;
	if (heroBaseStats.hp <= 0) {
		isDefeated = true;
		logs.push({ tick, message: "勇者は倒れた...", type: "hero_defeat" });
	}

	return { monster, heroBaseStats, equippedSkills, currentFloor, lastReward, logs, isDefeated };
}

function trimBattleLog(existingLog: BattleLogEntry[], newLogs: BattleLogEntry[]): BattleLogEntry[] {
	return [...existingLog, ...newLogs].slice(-MAX_BATTLE_LOG_SIZE);
}

// =============================================================================
// ストア
// =============================================================================

export const useGameStore = create<GameState>((set, get) => ({
	...createInitialState(),

	initBattle: () => {
		set(createInitialState());
	},

	processTick: () => {
		set((state) => {
			if (state.isDefeated) return {};

			const newTick = state.currentTick + 1;

			if (newTick % ATTACK_INTERVAL !== 0) {
				return {
					currentTick: newTick,
					lastTickTime: Date.now(),
				};
			}

			const turnResult = processAttackTurn(newTick, {
				monster: state.monster,
				heroBaseStats: state.heroBaseStats,
				equippedSkills: state.equippedSkills,
				equippedItems: state.equippedItems,
				currentFloor: state.currentFloor,
				lastReward: state.lastReward,
				ownedSkills: state.ownedSkills,
				ownedEquipment: state.ownedEquipment,
			});

			return {
				currentTick: newTick,
				monster: turnResult.monster,
				heroBaseStats: turnResult.heroBaseStats,
				equippedSkills: turnResult.equippedSkills,
				currentFloor: turnResult.currentFloor,
				lastReward: turnResult.lastReward,
				battleLog: trimBattleLog(state.battleLog, turnResult.logs),
				battleLogVersion: state.battleLogVersion + 1,
				lastTickTime: Date.now(),
				isDefeated: turnResult.isDefeated,
			};
		});
	},

	retryBattle: () => {
		set((state) => ({
			isDefeated: false,
			heroBaseStats: { ...state.heroBaseStats, hp: state.heroBaseStats.maxHp },
			monster: { ...state.monster, hp: state.monster.maxHp },
			battleLog: [],
			currentTick: 0,
			equippedSkills: state.equippedSkills.map((s) => ({ ...s, currentCooldown: 0 })),
		}));
	},

	equipSkill: (skillId: SkillId) => {
		set((state) => {
			const skillDef = getSkillDefinition(skillId);
			const baseCooldown = skillDef?.baseCooldown ?? 0;
			return {
				equippedSkills: equipSkillUtil(state.equippedSkills, skillId, baseCooldown),
			};
		});
	},

	unequipSkill: (skillId: SkillId) => {
		set((state) => ({
			equippedSkills: unequipSkillUtil(state.equippedSkills, skillId),
		}));
	},

	equipItem: (equipmentId: EquipmentId) => {
		const equipment = getEquipmentDefinition(equipmentId);
		if (!equipment) return;

		set((state) => ({
			equippedItems: { ...state.equippedItems, [equipment.slot]: equipmentId },
		}));
	},

	unequipItem: (slot: EquipmentSlot) => {
		set((state) => ({
			equippedItems: { ...state.equippedItems, [slot]: null },
		}));
	},

	addReward: (reward: GachaReward) => {
		set((state) =>
			applyRewardToState(state.heroBaseStats, state.ownedSkills, state.ownedEquipment, reward),
		);
	},

	processTaskComplete: () => {
		const reward = generateReward();
		get().addReward(reward);
		set({ lastReward: reward });
	},

	processOfflineProgress: (currentTime: number) => {
		set((state) => {
			const elapsedTicks = calculateElapsedTicks(state.lastTickTime, currentTime);

			if (elapsedTicks === 0) {
				return { lastTickTime: currentTime };
			}

			const result = simulateOfflineBattle({
				hero: state.heroBaseStats,
				equippedSkills: state.equippedSkills,
				ownedSkills: state.ownedSkills,
				currentFloor: state.currentFloor,
				elapsedTicks,
			});

			return {
				currentFloor: result.finalFloor,
				monster: generateMonster(result.finalFloor),
				heroBaseStats: {
					...state.heroBaseStats,
					hp: state.heroBaseStats.maxHp,
				},
				lastTickTime: currentTime,
			};
		});
	},

	clearLastReward: () => {
		set({ lastReward: null });
	},

	getEffectiveStats: (): HeroStats => {
		const state = get();
		return computeEffectiveStats(state.heroBaseStats, state.equippedItems);
	},
}));
