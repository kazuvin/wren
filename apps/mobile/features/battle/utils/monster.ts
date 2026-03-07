import type { Monster, MonsterTemplate } from "../types";

// =============================================================================
// Floor Zone Definitions
// =============================================================================

type FloorZone = {
	maxFloor: number;
	zoneName: string;
	poolKey: keyof typeof MONSTER_POOLS;
};

const FLOOR_ZONES: readonly FloorZone[] = [
	{ maxFloor: 5, zoneName: "森", poolKey: "forest" },
	{ maxFloor: 10, zoneName: "荒野", poolKey: "beasts" },
	{ maxFloor: 15, zoneName: "深淵", poolKey: "dragons" },
	{ maxFloor: 20, zoneName: "冥界", poolKey: "undead" },
] as const;

const DEFAULT_ZONE = { zoneName: "魔王城", poolKey: "demons" } as const;

function getFloorZone(floor: number) {
	return FLOOR_ZONES.find((zone) => floor <= zone.maxFloor) ?? DEFAULT_ZONE;
}

// =============================================================================
// Monster Pools
// =============================================================================

export const MONSTER_POOLS = {
	forest: [
		{ name: "イノシシ", emoji: "🐗", baseHp: 30, baseAtk: 8, baseDef: 3 },
		{ name: "キツネ", emoji: "🦊", baseHp: 25, baseAtk: 10, baseDef: 2 },
		{ name: "オオカミ", emoji: "🐺", baseHp: 35, baseAtk: 9, baseDef: 4 },
		{ name: "ヘビ", emoji: "🐍", baseHp: 20, baseAtk: 12, baseDef: 1 },
		{ name: "サソリ", emoji: "🦂", baseHp: 22, baseAtk: 11, baseDef: 2 },
	] as MonsterTemplate[],
	beasts: [
		{ name: "クマ", emoji: "🐻", baseHp: 50, baseAtk: 12, baseDef: 6 },
		{ name: "ライオン", emoji: "🦁", baseHp: 45, baseAtk: 14, baseDef: 5 },
		{ name: "ワニ", emoji: "🐊", baseHp: 55, baseAtk: 11, baseDef: 8 },
		{ name: "サメ", emoji: "🦈", baseHp: 40, baseAtk: 15, baseDef: 4 },
		{ name: "ワシ", emoji: "🦅", baseHp: 35, baseAtk: 13, baseDef: 3 },
	] as MonsterTemplate[],
	dragons: [
		{ name: "ドラゴン", emoji: "🐉", baseHp: 70, baseAtk: 16, baseDef: 9 },
		{ name: "ティラノ", emoji: "🦖", baseHp: 80, baseAtk: 18, baseDef: 7 },
		{ name: "ブラキオ", emoji: "🦕", baseHp: 90, baseAtk: 12, baseDef: 12 },
		{ name: "クラーケン", emoji: "🐙", baseHp: 65, baseAtk: 17, baseDef: 8 },
		{ name: "イカ", emoji: "🦑", baseHp: 60, baseAtk: 19, baseDef: 6 },
	] as MonsterTemplate[],
	undead: [
		{ name: "オーガ", emoji: "👹", baseHp: 100, baseAtk: 20, baseDef: 10 },
		{ name: "テング", emoji: "👺", baseHp: 85, baseAtk: 22, baseDef: 8 },
		{ name: "スケルトン", emoji: "💀", baseHp: 70, baseAtk: 24, baseDef: 6 },
		{ name: "ゴースト", emoji: "👻", baseHp: 60, baseAtk: 25, baseDef: 5 },
		{ name: "ゾンビ", emoji: "🧟", baseHp: 110, baseAtk: 18, baseDef: 12 },
	] as MonsterTemplate[],
	demons: [
		{ name: "デーモン", emoji: "😈", baseHp: 120, baseAtk: 25, baseDef: 12 },
		{
			name: "アークデーモン",
			emoji: "👿",
			baseHp: 130,
			baseAtk: 28,
			baseDef: 10,
		},
		{
			name: "イフリート",
			emoji: "🔥",
			baseHp: 100,
			baseAtk: 32,
			baseDef: 8,
		},
		{
			name: "デスナイト",
			emoji: "☠️",
			baseHp: 140,
			baseAtk: 26,
			baseDef: 14,
		},
		{
			name: "サンダーロード",
			emoji: "⚡",
			baseHp: 110,
			baseAtk: 30,
			baseDef: 11,
		},
	] as MonsterTemplate[],
} as const;

// =============================================================================
// Functions
// =============================================================================

export function isBossFloor(floor: number): boolean {
	return floor % 5 === 0;
}

export function getMonsterPool(floor: number): MonsterTemplate[] {
	return MONSTER_POOLS[getFloorZone(floor).poolKey];
}

export function scaleMonsterStats(template: MonsterTemplate, floor: number): Monster {
	const hp = Math.floor(template.baseHp * (1 + floor * 0.15));
	const atk = Math.floor(template.baseAtk * (1 + floor * 0.1));
	const def = Math.floor(template.baseDef * (1 + floor * 0.08));

	return {
		name: template.name,
		emoji: template.emoji,
		hp,
		maxHp: hp,
		atk,
		def,
	};
}

export function applyBossMultiplier(monster: Monster): Monster {
	const hp = monster.hp * 3;
	return {
		...monster,
		hp,
		maxHp: hp,
		atk: Math.floor(monster.atk * 1.5),
	};
}

export function generateMonster(floor: number, random: () => number = Math.random): Monster {
	const pool = getMonsterPool(floor);
	const index = Math.floor(random() * pool.length);
	const template = pool[index];

	const scaled = scaleMonsterStats(template, floor);

	if (!isBossFloor(floor)) {
		return scaled;
	}

	const bossMonster = applyBossMultiplier(scaled);
	return { ...bossMonster, name: `ボス: ${bossMonster.name}` };
}

export function getFloorZoneName(floor: number): string {
	return getFloorZone(floor).zoneName;
}
