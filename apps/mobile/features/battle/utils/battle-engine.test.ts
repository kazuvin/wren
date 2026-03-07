import { beforeEach, describe, expect, it } from "vitest";
import type { EquippedSkill, HeroStats, Monster, SkillDefinition, SkillId } from "../types";
import {
	applyCritical,
	calculateDamage,
	getSkillCooldownForLevel,
	getSkillMultiplierForLevel,
	isBossFloor,
	isCritical,
	processHeroAttack,
	processMonsterAttack,
	reviveHero,
} from "./battle-engine";

// =============================================================================
// calculateDamage
// =============================================================================

describe("calculateDamage", () => {
	it("ATK * skillMultiplier - DEF * 0.5 の計算結果を返す", () => {
		// ATK=10, DEF=4, multiplier=1.0 => 10*1.0 - 4*0.5 = 8
		expect(calculateDamage(10, 4, 1.0)).toBe(8);
	});

	it("小数点以下は切り捨てる", () => {
		// ATK=7, DEF=3, multiplier=1.5 => 7*1.5 - 3*0.5 = 10.5 - 1.5 = 9
		expect(calculateDamage(7, 3, 1.5)).toBe(9);
	});

	it("結果が0以下でも最低1を返す", () => {
		// ATK=1, DEF=100, multiplier=1.0 => 1*1.0 - 100*0.5 = -49
		expect(calculateDamage(1, 100, 1.0)).toBe(1);
	});

	it("DEFが0の場合はATK * skillMultiplierがそのまま返る", () => {
		expect(calculateDamage(10, 0, 2.0)).toBe(20);
	});

	it("スキル倍率が高い場合のダメージ計算", () => {
		// ATK=20, DEF=10, multiplier=3.0 => 20*3.0 - 10*0.5 = 60 - 5 = 55
		expect(calculateDamage(20, 10, 3.0)).toBe(55);
	});

	it("ATKが0でもDEFが0なら最低1を返す", () => {
		// ATK=0, DEF=0, multiplier=1.0 => 0*1.0 - 0*0.5 = 0 => max(1, 0) = 1
		expect(calculateDamage(0, 0, 1.0)).toBe(1);
	});
});

// =============================================================================
// isCritical
// =============================================================================

describe("isCritical", () => {
	it("乱数がLUK/100未満ならクリティカル判定になる", () => {
		// LUK=50 => 50% chance, random returns 0.3 => true
		expect(isCritical(50, () => 0.3)).toBe(true);
	});

	it("乱数がLUK/100以上ならクリティカルにならない", () => {
		// LUK=50 => 50% chance, random returns 0.7 => false
		expect(isCritical(50, () => 0.7)).toBe(false);
	});

	it("LUKが0なら常にクリティカルにならない", () => {
		expect(isCritical(0, () => 0.0)).toBe(false);
	});

	it("LUKが100なら常にクリティカルになる", () => {
		expect(isCritical(100, () => 0.99)).toBe(true);
	});

	it("境界値: 乱数がちょうどLUK/100と等しい場合はクリティカルにならない", () => {
		// LUK=50 => threshold = 0.5, random = 0.5 => false (< ではなく)
		expect(isCritical(50, () => 0.5)).toBe(false);
	});

	it("randomを省略した場合にデフォルトのMath.randomが使われる", () => {
		// エラーなく呼び出せることを確認
		const result = isCritical(50);
		expect(typeof result).toBe("boolean");
	});
});

// =============================================================================
// applyCritical
// =============================================================================

describe("applyCritical", () => {
	it("ダメージを1.5倍にする", () => {
		expect(applyCritical(10)).toBe(15);
	});

	it("小数点以下は切り捨てる", () => {
		// 7 * 1.5 = 10.5 => 10
		expect(applyCritical(7)).toBe(10);
	});

	it("ダメージが1の場合は1.5を切り捨てて1になる", () => {
		// 1 * 1.5 = 1.5 => 1
		expect(applyCritical(1)).toBe(1);
	});
});

// =============================================================================
// isBossFloor
// =============================================================================

describe("isBossFloor", () => {
	it("5の倍数ならボスフロアである", () => {
		expect(isBossFloor(5)).toBe(true);
		expect(isBossFloor(10)).toBe(true);
		expect(isBossFloor(15)).toBe(true);
		expect(isBossFloor(100)).toBe(true);
	});

	it("5の倍数でなければボスフロアではない", () => {
		expect(isBossFloor(1)).toBe(false);
		expect(isBossFloor(3)).toBe(false);
		expect(isBossFloor(7)).toBe(false);
		expect(isBossFloor(99)).toBe(false);
	});
});

// =============================================================================
// getSkillCooldownForLevel
// =============================================================================

describe("getSkillCooldownForLevel", () => {
	it("レベル1ではbaseCooldownがそのまま返る", () => {
		expect(getSkillCooldownForLevel(10, 1)).toBe(10);
	});

	it("レベルが上がるごとにクールダウンが1ずつ減る", () => {
		expect(getSkillCooldownForLevel(10, 3)).toBe(8);
	});

	it("最小値は3で下限が設定される", () => {
		expect(getSkillCooldownForLevel(5, 10)).toBe(3);
	});

	it("baseCooldownが3でレベル1の場合は3を返す", () => {
		expect(getSkillCooldownForLevel(3, 1)).toBe(3);
	});

	it("baseCooldownが3でレベル2以上でも3を返す", () => {
		expect(getSkillCooldownForLevel(3, 5)).toBe(3);
	});
});

// =============================================================================
// getSkillMultiplierForLevel
// =============================================================================

describe("getSkillMultiplierForLevel", () => {
	it("レベル1ではbaseMultiplierがそのまま返る", () => {
		expect(getSkillMultiplierForLevel(2.0, 1)).toBe(2.0);
	});

	it("レベルが上がるごとにbaseMultiplierの10%ずつ増加する", () => {
		// 2.0 * (1 + (3-1) * 0.1) = 2.0 * 1.2 = 2.4
		expect(getSkillMultiplierForLevel(2.0, 3)).toBe(2.4);
	});

	it("レベル10でのスキル倍率を正しく計算する", () => {
		// 1.5 * (1 + (10-1) * 0.1) = 1.5 * 1.9 = 2.85
		expect(getSkillMultiplierForLevel(1.5, 10)).toBeCloseTo(2.85);
	});
});

// =============================================================================
// processMonsterAttack
// =============================================================================

describe("processMonsterAttack", () => {
	let hero: HeroStats;
	let monster: Monster;

	beforeEach(() => {
		hero = {
			hp: 100,
			maxHp: 100,
			atk: 20,
			def: 10,
			spd: 5,
			luk: 10,
		};
		monster = {
			name: "Slime",
			emoji: "slime",
			hp: 50,
			maxHp: 50,
			atk: 15,
			def: 5,
		};
	});

	it("モンスターがヒーローにダメージを与える (monster.atk - hero.def * 0.5)", () => {
		// damage = max(1, 15 - 10*0.5) = max(1, 10) = 10
		const result = processMonsterAttack(monster, hero);
		expect(result.damage).toBe(10);
		expect(result.updatedHero.hp).toBe(90);
	});

	it("ヒーローのHPが0未満にならない", () => {
		hero.hp = 5;
		// damage = 10
		const result = processMonsterAttack(monster, hero);
		expect(result.updatedHero.hp).toBe(0);
	});

	it("DEFが高くてもダメージは最低1", () => {
		hero.def = 100;
		// damage = max(1, 15 - 100*0.5) = max(1, -35) = 1
		const result = processMonsterAttack(monster, hero);
		expect(result.damage).toBe(1);
	});

	it("元のヒーローオブジェクトが変更されない", () => {
		const originalHp = hero.hp;
		processMonsterAttack(monster, hero);
		expect(hero.hp).toBe(originalHp);
	});
});

// =============================================================================
// reviveHero
// =============================================================================

describe("reviveHero", () => {
	it("ヒーローのHPをmaxHpに回復する", () => {
		const hero: HeroStats = {
			hp: 0,
			maxHp: 100,
			atk: 20,
			def: 10,
			spd: 5,
			luk: 10,
		};
		const revived = reviveHero(hero);
		expect(revived.hp).toBe(100);
		expect(revived.maxHp).toBe(100);
	});

	it("元のヒーローオブジェクトが変更されない", () => {
		const hero: HeroStats = {
			hp: 0,
			maxHp: 100,
			atk: 20,
			def: 10,
			spd: 5,
			luk: 10,
		};
		reviveHero(hero);
		expect(hero.hp).toBe(0);
	});

	it("他のステータスは維持される", () => {
		const hero: HeroStats = {
			hp: 0,
			maxHp: 150,
			atk: 25,
			def: 15,
			spd: 8,
			luk: 12,
		};
		const revived = reviveHero(hero);
		expect(revived.atk).toBe(25);
		expect(revived.def).toBe(15);
		expect(revived.spd).toBe(8);
		expect(revived.luk).toBe(12);
	});
});

// =============================================================================
// processHeroAttack
// =============================================================================

describe("processHeroAttack", () => {
	let hero: HeroStats;
	let monster: Monster;
	let equippedSkills: EquippedSkill[];
	let skillDefinitions: Map<SkillId, SkillDefinition>;

	const fireSkill: SkillDefinition = {
		id: "fire",
		name: "Fire",
		emoji: "fire",
		description: "A fire attack",
		baseDamageMultiplier: 2.0,
		baseCooldown: 5,
		rarity: "common",
		category: "attack",
	};

	const iceSkill: SkillDefinition = {
		id: "ice",
		name: "Ice",
		emoji: "ice",
		description: "An ice attack",
		baseDamageMultiplier: 1.8,
		baseCooldown: 4,
		rarity: "rare",
		category: "attack",
	};

	beforeEach(() => {
		hero = {
			hp: 100,
			maxHp: 100,
			atk: 20,
			def: 10,
			spd: 5,
			luk: 0, // クリティカルなしにデフォルト設定
		};
		monster = {
			name: "Slime",
			emoji: "slime",
			hp: 100,
			maxHp: 100,
			atk: 10,
			def: 6,
		};
		equippedSkills = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "ice", currentCooldown: 3 },
		];
		skillDefinitions = new Map<SkillId, SkillDefinition>([
			["fire", fireSkill],
			["ice", iceSkill],
		]);
	});

	it("クールダウンが0のスキルが使用される", () => {
		const result = processHeroAttack(
			hero,
			monster,
			equippedSkills,
			skillDefinitions,
			1,
			() => 1, // クリティカルなし
		);
		expect(result.skillUsed).toEqual(fireSkill);
	});

	it("スキル使用時にスキル倍率でダメージが計算される", () => {
		// fire skill: multiplier=2.0, ATK=20, DEF=6
		// damage = max(1, 20*2.0 - 6*0.5) = max(1, 40 - 3) = 37
		const result = processHeroAttack(
			hero,
			monster,
			equippedSkills,
			skillDefinitions,
			1,
			() => 1, // クリティカルなし
		);
		expect(result.damage).toBe(37);
		expect(result.isCritical).toBe(false);
	});

	it("使用されたスキルのクールダウンがbaseCooldownにリセットされる", () => {
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		const usedSkill = result.updatedSkills.find((s) => s.skillId === "fire");
		// baseCooldown=5, level is obtained from skillDefinitions
		// getSkillCooldownForLevel(5, 1) = 5 (currentTick isn't relevant for cooldown calc, level=1 default)
		expect(usedSkill?.currentCooldown).toBe(5);
	});

	it("他のスキルのクールダウンが1減少する", () => {
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		const otherSkill = result.updatedSkills.find((s) => s.skillId === "ice");
		expect(otherSkill?.currentCooldown).toBe(2);
	});

	it("クールダウンが0以下にならない", () => {
		equippedSkills = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "ice", currentCooldown: 0 },
		];
		// fireが先に使われる（順番通り）
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		const iceSkillResult = result.updatedSkills.find((s) => s.skillId === "ice");
		// iceのcooldownは既に0で、さらに1減るが最低0
		expect(iceSkillResult?.currentCooldown).toBe(0);
	});

	it("すべてのスキルがクールダウン中の場合は通常攻撃になる", () => {
		equippedSkills = [
			{ skillId: "fire", currentCooldown: 3 },
			{ skillId: "ice", currentCooldown: 2 },
		];
		// 通常攻撃: multiplier=1.0
		// damage = max(1, 20*1.0 - 6*0.5) = max(1, 17) = 17
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		expect(result.skillUsed).toBeNull();
		expect(result.damage).toBe(17);
	});

	it("通常攻撃でもクールダウンが1減少する", () => {
		equippedSkills = [
			{ skillId: "fire", currentCooldown: 3 },
			{ skillId: "ice", currentCooldown: 2 },
		];
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		expect(result.updatedSkills[0].currentCooldown).toBe(2);
		expect(result.updatedSkills[1].currentCooldown).toBe(1);
	});

	it("クリティカルヒットが発生した場合ダメージが1.5倍になる", () => {
		hero.luk = 100; // 100%クリティカル
		// fire skill: damage = max(1, 20*2.0 - 6*0.5) = 37
		// critical: floor(37 * 1.5) = 55
		const result = processHeroAttack(
			hero,
			monster,
			equippedSkills,
			skillDefinitions,
			1,
			() => 0, // クリティカル確定
		);
		expect(result.isCritical).toBe(true);
		expect(result.damage).toBe(55);
	});

	it("モンスターのHPが正しく減少する", () => {
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		expect(result.updatedMonster.hp).toBe(monster.hp - result.damage);
	});

	it("元のモンスターオブジェクトが変更されない", () => {
		const originalHp = monster.hp;
		processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		expect(monster.hp).toBe(originalHp);
	});

	it("スキルが空の場合は通常攻撃になる", () => {
		const result = processHeroAttack(hero, monster, [], skillDefinitions, 1, () => 1);
		expect(result.skillUsed).toBeNull();
		expect(result.damage).toBe(17);
	});

	it("複数のスキルがクールダウン0の場合、最初のスキルが使われる", () => {
		equippedSkills = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "ice", currentCooldown: 0 },
		];
		const result = processHeroAttack(hero, monster, equippedSkills, skillDefinitions, 1, () => 1);
		expect(result.skillUsed?.id).toBe("fire");
	});
});
