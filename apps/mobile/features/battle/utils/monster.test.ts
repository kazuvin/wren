import { describe, expect, it } from "vitest";
import type { Monster, MonsterTemplate } from "../types";
import {
	MONSTER_POOLS,
	applyBossMultiplier,
	generateMonster,
	getFloorZoneName,
	getMonsterPool,
	isBossFloor,
	scaleMonsterStats,
} from "./monster";

// =============================================================================
// isBossFloor
// =============================================================================

describe("isBossFloor", () => {
	it("フロア5はボスフロアである", () => {
		expect(isBossFloor(5)).toBe(true);
	});

	it("フロア10はボスフロアである", () => {
		expect(isBossFloor(10)).toBe(true);
	});

	it("フロア15はボスフロアである", () => {
		expect(isBossFloor(15)).toBe(true);
	});

	it("フロア20はボスフロアである", () => {
		expect(isBossFloor(20)).toBe(true);
	});

	it("フロア25はボスフロアである", () => {
		expect(isBossFloor(25)).toBe(true);
	});

	it("フロア1はボスフロアではない", () => {
		expect(isBossFloor(1)).toBe(false);
	});

	it("フロア3はボスフロアではない", () => {
		expect(isBossFloor(3)).toBe(false);
	});

	it("フロア7はボスフロアではない", () => {
		expect(isBossFloor(7)).toBe(false);
	});
});

// =============================================================================
// MONSTER_POOLS
// =============================================================================

describe("MONSTER_POOLS", () => {
	it("forestプールに5体のモンスターが存在する", () => {
		expect(MONSTER_POOLS.forest).toHaveLength(5);
	});

	it("beastsプールに5体のモンスターが存在する", () => {
		expect(MONSTER_POOLS.beasts).toHaveLength(5);
	});

	it("dragonsプールに5体のモンスターが存在する", () => {
		expect(MONSTER_POOLS.dragons).toHaveLength(5);
	});

	it("undeadプールに5体のモンスターが存在する", () => {
		expect(MONSTER_POOLS.undead).toHaveLength(5);
	});

	it("demonsプールに5体のモンスターが存在する", () => {
		expect(MONSTER_POOLS.demons).toHaveLength(5);
	});

	it("forestプールにイノシシが含まれる", () => {
		const boar = MONSTER_POOLS.forest.find((m) => m.name === "イノシシ");
		expect(boar).toEqual({
			name: "イノシシ",
			emoji: "🐗",
			baseHp: 30,
			baseAtk: 8,
			baseDef: 3,
		});
	});

	it("demonsプールにデーモンが含まれる", () => {
		const demon = MONSTER_POOLS.demons.find((m) => m.name === "デーモン");
		expect(demon).toEqual({
			name: "デーモン",
			emoji: "😈",
			baseHp: 120,
			baseAtk: 25,
			baseDef: 12,
		});
	});
});

// =============================================================================
// getMonsterPool
// =============================================================================

describe("getMonsterPool", () => {
	it("フロア1で森のモンスタープールを返す", () => {
		expect(getMonsterPool(1)).toBe(MONSTER_POOLS.forest);
	});

	it("フロア5で森のモンスタープールを返す", () => {
		expect(getMonsterPool(5)).toBe(MONSTER_POOLS.forest);
	});

	it("フロア6で荒野のモンスタープールを返す", () => {
		expect(getMonsterPool(6)).toBe(MONSTER_POOLS.beasts);
	});

	it("フロア10で荒野のモンスタープールを返す", () => {
		expect(getMonsterPool(10)).toBe(MONSTER_POOLS.beasts);
	});

	it("フロア11で深淵のモンスタープールを返す", () => {
		expect(getMonsterPool(11)).toBe(MONSTER_POOLS.dragons);
	});

	it("フロア15で深淵のモンスタープールを返す", () => {
		expect(getMonsterPool(15)).toBe(MONSTER_POOLS.dragons);
	});

	it("フロア16で冥界のモンスタープールを返す", () => {
		expect(getMonsterPool(16)).toBe(MONSTER_POOLS.undead);
	});

	it("フロア20で冥界のモンスタープールを返す", () => {
		expect(getMonsterPool(20)).toBe(MONSTER_POOLS.undead);
	});

	it("フロア21で魔王城のモンスタープールを返す", () => {
		expect(getMonsterPool(21)).toBe(MONSTER_POOLS.demons);
	});

	it("フロア100で魔王城のモンスタープールを返す", () => {
		expect(getMonsterPool(100)).toBe(MONSTER_POOLS.demons);
	});
});

// =============================================================================
// scaleMonsterStats
// =============================================================================

describe("scaleMonsterStats", () => {
	const template: MonsterTemplate = {
		name: "テスト",
		emoji: "🧪",
		baseHp: 100,
		baseAtk: 20,
		baseDef: 10,
	};

	it("フロア1でステータスがスケールされる", () => {
		const monster = scaleMonsterStats(template, 1);
		// HP = floor(100 * (1 + 1 * 0.15)) = floor(114.999...) = 114 (浮動小数点)
		// ATK = floor(20 * (1 + 1 * 0.1)) = floor(20 * 1.1) = 22
		// DEF = floor(10 * (1 + 1 * 0.08)) = floor(10 * 1.08) = 10
		expect(monster.hp).toBe(114);
		expect(monster.atk).toBe(22);
		expect(monster.def).toBe(10);
	});

	it("フロア10でステータスがスケールされる", () => {
		const monster = scaleMonsterStats(template, 10);
		// HP = floor(100 * (1 + 10 * 0.15)) = floor(100 * 2.5) = 250
		// ATK = floor(20 * (1 + 10 * 0.1)) = floor(20 * 2.0) = 40
		// DEF = floor(10 * (1 + 10 * 0.08)) = floor(10 * 1.8) = 18
		expect(monster.hp).toBe(250);
		expect(monster.atk).toBe(40);
		expect(monster.def).toBe(18);
	});

	it("maxHpがhpと同じ値になる", () => {
		const monster = scaleMonsterStats(template, 5);
		expect(monster.maxHp).toBe(monster.hp);
	});

	it("名前とemojiがテンプレートから引き継がれる", () => {
		const monster = scaleMonsterStats(template, 1);
		expect(monster.name).toBe("テスト");
		expect(monster.emoji).toBe("🧪");
	});

	it("フロア20でステータスが正しく計算される", () => {
		const monster = scaleMonsterStats(template, 20);
		// HP = floor(100 * (1 + 20 * 0.15)) = floor(100 * 4.0) = 400
		// ATK = floor(20 * (1 + 20 * 0.1)) = floor(20 * 3.0) = 60
		// DEF = floor(10 * (1 + 20 * 0.08)) = floor(10 * 2.6) = 26
		expect(monster.hp).toBe(400);
		expect(monster.atk).toBe(60);
		expect(monster.def).toBe(26);
	});

	it("小数点以下が切り捨てられる", () => {
		const oddTemplate: MonsterTemplate = {
			name: "端数",
			emoji: "📐",
			baseHp: 33,
			baseAtk: 7,
			baseDef: 3,
		};
		const monster = scaleMonsterStats(oddTemplate, 3);
		// HP = floor(33 * (1 + 3 * 0.15)) = floor(33 * 1.45) = floor(47.85) = 47
		// ATK = floor(7 * (1 + 3 * 0.1)) = floor(7 * 1.3) = floor(9.1) = 9
		// DEF = floor(3 * (1 + 3 * 0.08)) = floor(3 * 1.24) = floor(3.72) = 3
		expect(monster.hp).toBe(47);
		expect(monster.atk).toBe(9);
		expect(monster.def).toBe(3);
	});
});

// =============================================================================
// applyBossMultiplier
// =============================================================================

describe("applyBossMultiplier", () => {
	const baseMonster: Monster = {
		name: "テスト",
		emoji: "🧪",
		hp: 100,
		maxHp: 100,
		atk: 20,
		def: 10,
	};

	it("HPが3倍になる", () => {
		const boss = applyBossMultiplier(baseMonster);
		expect(boss.hp).toBe(300);
	});

	it("maxHpも3倍になる", () => {
		const boss = applyBossMultiplier(baseMonster);
		expect(boss.maxHp).toBe(300);
	});

	it("ATKが1.5倍になり切り捨てられる", () => {
		const boss = applyBossMultiplier(baseMonster);
		// floor(20 * 1.5) = 30
		expect(boss.atk).toBe(30);
	});

	it("ATKが奇数の場合に切り捨てが適用される", () => {
		const oddMonster: Monster = {
			...baseMonster,
			atk: 15,
		};
		const boss = applyBossMultiplier(oddMonster);
		// floor(15 * 1.5) = floor(22.5) = 22
		expect(boss.atk).toBe(22);
	});

	it("DEFは変更されない", () => {
		const boss = applyBossMultiplier(baseMonster);
		expect(boss.def).toBe(10);
	});

	it("名前とemojiは変更されない", () => {
		const boss = applyBossMultiplier(baseMonster);
		expect(boss.name).toBe("テスト");
		expect(boss.emoji).toBe("🧪");
	});

	it("元のモンスターが変更されない（イミュータブル）", () => {
		applyBossMultiplier(baseMonster);
		expect(baseMonster.hp).toBe(100);
		expect(baseMonster.maxHp).toBe(100);
		expect(baseMonster.atk).toBe(20);
	});
});

// =============================================================================
// generateMonster
// =============================================================================

describe("generateMonster", () => {
	it("指定したrandomで決定的にモンスターを生成できる", () => {
		// random = 0 -> index 0 (プールの最初のモンスター)
		const monster = generateMonster(1, () => 0);
		expect(monster.name).toBe("イノシシ");
	});

	it("フロア1で森のモンスターが生成される", () => {
		const forestNames = MONSTER_POOLS.forest.map((m) => m.name);
		const monster = generateMonster(1, () => 0.5);
		expect(forestNames).toContain(monster.name);
	});

	it("フロア6で荒野のモンスターが生成される", () => {
		const beastNames = MONSTER_POOLS.beasts.map((m) => m.name);
		const monster = generateMonster(6, () => 0);
		expect(beastNames).toContain(monster.name);
	});

	it("フロア11で深淵のモンスターが生成される", () => {
		const dragonNames = MONSTER_POOLS.dragons.map((m) => m.name);
		const monster = generateMonster(11, () => 0);
		expect(dragonNames).toContain(monster.name);
	});

	it("フロア16で冥界のモンスターが生成される", () => {
		const undeadNames = MONSTER_POOLS.undead.map((m) => m.name);
		const monster = generateMonster(16, () => 0);
		expect(undeadNames).toContain(monster.name);
	});

	it("フロア21で魔王城のモンスターが生成される", () => {
		const demonNames = MONSTER_POOLS.demons.map((m) => m.name);
		const monster = generateMonster(21, () => 0);
		expect(demonNames).toContain(monster.name);
	});

	it("ステータスがフロアに応じてスケールされる（非ボスフロア）", () => {
		const monster = generateMonster(8, () => 0);
		// フロア8は荒野プール、index 0 = クマ: baseHp=50, baseAtk=12, baseDef=6
		// HP = floor(50 * (1 + 8 * 0.15)) = floor(50 * 2.2) = 110
		// ATK = floor(12 * (1 + 8 * 0.1)) = floor(12 * 1.8) = 21
		// DEF = floor(6 * (1 + 8 * 0.08)) = floor(6 * 1.64) = 9
		expect(monster.hp).toBe(110);
		expect(monster.atk).toBe(21);
		expect(monster.def).toBe(9);
	});

	it("ボスフロアでボス倍率が適用される", () => {
		const monster = generateMonster(5, () => 0);
		// イノシシ: baseHp=30, baseAtk=8, baseDef=3
		// スケール後: HP=floor(30*(1+5*0.15))=floor(30*1.75)=52, ATK=floor(8*(1+5*0.1))=floor(8*1.5)=12, DEF=floor(3*(1+5*0.08))=floor(3*1.4)=4
		// ボス倍率: HP=52*3=156, ATK=floor(12*1.5)=18, DEF=4
		expect(monster.hp).toBe(156);
		expect(monster.maxHp).toBe(156);
		expect(monster.atk).toBe(18);
		expect(monster.def).toBe(4);
	});

	it("ボスフロアで名前に「ボス: 」が付加される", () => {
		const monster = generateMonster(5, () => 0);
		expect(monster.name).toBe("ボス: イノシシ");
	});

	it("通常フロアで名前に「ボス: 」が付加されない", () => {
		const monster = generateMonster(3, () => 0);
		expect(monster.name).not.toContain("ボス: ");
	});

	it("randomパラメータなしでもモンスターが生成される", () => {
		const monster = generateMonster(1);
		expect(monster).toBeDefined();
		expect(monster.name).toBeDefined();
		expect(monster.hp).toBeGreaterThan(0);
		expect(monster.atk).toBeGreaterThan(0);
	});

	it("randomが0.99の場合にプールの最後のモンスターが選ばれる", () => {
		const monster = generateMonster(1, () => 0.99);
		// floor(0.99 * 5) = 4 -> index 4 = サソリ
		expect(monster.name).toBe("サソリ");
	});
});

// =============================================================================
// getFloorZoneName
// =============================================================================

describe("getFloorZoneName", () => {
	it("フロア1で「森」を返す", () => {
		expect(getFloorZoneName(1)).toBe("森");
	});

	it("フロア5で「森」を返す", () => {
		expect(getFloorZoneName(5)).toBe("森");
	});

	it("フロア6で「荒野」を返す", () => {
		expect(getFloorZoneName(6)).toBe("荒野");
	});

	it("フロア10で「荒野」を返す", () => {
		expect(getFloorZoneName(10)).toBe("荒野");
	});

	it("フロア11で「深淵」を返す", () => {
		expect(getFloorZoneName(11)).toBe("深淵");
	});

	it("フロア15で「深淵」を返す", () => {
		expect(getFloorZoneName(15)).toBe("深淵");
	});

	it("フロア16で「冥界」を返す", () => {
		expect(getFloorZoneName(16)).toBe("冥界");
	});

	it("フロア20で「冥界」を返す", () => {
		expect(getFloorZoneName(20)).toBe("冥界");
	});

	it("フロア21で「魔王城」を返す", () => {
		expect(getFloorZoneName(21)).toBe("魔王城");
	});

	it("フロア100で「魔王城」を返す", () => {
		expect(getFloorZoneName(100)).toBe("魔王城");
	});
});
