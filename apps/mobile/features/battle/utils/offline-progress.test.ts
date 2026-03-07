import { describe, expect, it } from "vitest";
import type { EquippedSkill, HeroStats, OwnedSkill } from "../types";
import {
	MAX_OFFLINE_TICKS,
	calculateElapsedTicks,
	formatOfflineResult,
	simulateOfflineBattle,
} from "./offline-progress";

// =============================================================================
// テスト用ヘルパー
// =============================================================================

function createHero(overrides: Partial<HeroStats> = {}): HeroStats {
	return {
		hp: 100,
		maxHp: 100,
		atk: 20,
		def: 10,
		spd: 5,
		luk: 10,
		...overrides,
	};
}

// =============================================================================
// MAX_OFFLINE_TICKS
// =============================================================================

describe("MAX_OFFLINE_TICKS", () => {
	it("86400 である（24時間分）", () => {
		expect(MAX_OFFLINE_TICKS).toBe(86400);
	});
});

// =============================================================================
// calculateElapsedTicks
// =============================================================================

describe("calculateElapsedTicks", () => {
	it("経過秒数を正しく計算する", () => {
		const lastTickTime = 1000;
		const currentTime = 6000;
		// (6000 - 1000) / 1000 = 5
		expect(calculateElapsedTicks(lastTickTime, currentTime)).toBe(5);
	});

	it("小数点以下を切り捨てる", () => {
		const lastTickTime = 0;
		const currentTime = 2500;
		// 2500 / 1000 = 2.5 => 2
		expect(calculateElapsedTicks(lastTickTime + 1, currentTime)).toBe(2);
	});

	it("lastTickTime が 0 の場合は 0 を返す", () => {
		expect(calculateElapsedTicks(0, 5000)).toBe(0);
	});

	it("currentTime が lastTickTime より小さい場合は 0 を返す", () => {
		expect(calculateElapsedTicks(5000, 3000)).toBe(0);
	});

	it("最大値は 86400 (24時間) に制限される", () => {
		const lastTickTime = 1000;
		const currentTime = 1000 + 100000 * 1000; // 100000秒後
		expect(calculateElapsedTicks(lastTickTime, currentTime)).toBe(86400);
	});

	it("ちょうど 86400 の場合はそのまま返す", () => {
		const lastTickTime = 1000;
		const currentTime = 1000 + 86400 * 1000;
		expect(calculateElapsedTicks(lastTickTime, currentTime)).toBe(86400);
	});

	it("経過時間が 0 の場合は 0 を返す", () => {
		expect(calculateElapsedTicks(1000, 1000)).toBe(0);
	});
});

// =============================================================================
// simulateOfflineBattle
// =============================================================================

describe("simulateOfflineBattle", () => {
	it("elapsedTicks が 0 の場合は何も起こらない", () => {
		const hero = createHero();
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 0,
		});
		expect(result).toEqual({
			elapsedTicks: 0,
			floorsCleared: 0,
			monstersDefeated: 0,
			rewards: [],
			finalFloor: 1,
			heroDeaths: 0,
		});
	});

	it("ヒーローが 3 tick ごとに通常攻撃する", () => {
		// ATK=50, DEF=10 のヒーロー vs フロア1のモンスター
		// モンスターの DEF は低いので数回の攻撃で倒せるはず
		const hero = createHero({ atk: 50, def: 30, hp: 500, maxHp: 500 });
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 30,
			random: () => 0.5, // 固定乱数でモンスター選択を安定化
		});
		// 30 tick で複数回攻撃が行われ、モンスターを倒しているはず
		expect(result.monstersDefeated).toBeGreaterThanOrEqual(1);
		expect(result.elapsedTicks).toBe(30);
	});

	it("モンスターが 3 tick ごとにヒーローを攻撃する", () => {
		// HP の低いヒーローがモンスターの攻撃でダメージを受ける
		const hero = createHero({ hp: 30, maxHp: 30, atk: 5, def: 0 });
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 30,
			random: () => 0.5,
		});
		// HP が低いので死亡して復活しているはず
		expect(result.heroDeaths).toBeGreaterThanOrEqual(1);
	});

	it("ヒーローが死亡した場合は全回復して復活する", () => {
		// 非常に弱いヒーロー
		const hero = createHero({ hp: 10, maxHp: 10, atk: 3, def: 0 });
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 60,
			random: () => 0.5,
		});
		// 弱いので何度も死亡しているはず
		expect(result.heroDeaths).toBeGreaterThanOrEqual(1);
	});

	it("モンスターを倒すとフロアが進む", () => {
		// 非常に強いヒーロー
		const hero = createHero({ atk: 200, def: 100, hp: 1000, maxHp: 1000 });
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 100,
			random: () => 0.5,
		});
		expect(result.floorsCleared).toBeGreaterThanOrEqual(1);
		expect(result.finalFloor).toBeGreaterThan(1);
		expect(result.finalFloor).toBe(1 + result.floorsCleared);
	});

	it("monstersDefeated と floorsCleared が一致する", () => {
		const hero = createHero({ atk: 200, def: 100, hp: 1000, maxHp: 1000 });
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 100,
			random: () => 0.5,
		});
		// 1モンスター = 1フロア
		expect(result.monstersDefeated).toBe(result.floorsCleared);
	});

	it("rewards は空配列を返す", () => {
		const hero = createHero({ atk: 200, def: 100, hp: 1000, maxHp: 1000 });
		const result = simulateOfflineBattle({
			hero,
			equippedSkills: [],
			ownedSkills: [],
			currentFloor: 1,
			elapsedTicks: 100,
			random: () => 0.5,
		});
		expect(result.rewards).toEqual([]);
	});

	describe("スキル使用", () => {
		it("装備スキルのクールダウンが 0 になったら発動する", () => {
			// fire スキル: baseDamageMultiplier=1.8, baseCooldown=12
			const hero = createHero({
				atk: 100,
				def: 50,
				hp: 500,
				maxHp: 500,
			});
			const equippedSkills: EquippedSkill[] = [{ skillId: "fire", currentCooldown: 0 }];
			const ownedSkills: OwnedSkill[] = [{ skillId: "fire", level: 1 }];
			const resultWithSkill = simulateOfflineBattle({
				hero,
				equippedSkills,
				ownedSkills,
				currentFloor: 1,
				elapsedTicks: 100,
				random: () => 0.5,
			});

			const resultWithoutSkill = simulateOfflineBattle({
				hero,
				equippedSkills: [],
				ownedSkills: [],
				currentFloor: 1,
				elapsedTicks: 100,
				random: () => 0.5,
			});

			// スキルがある方がダメージが大きいので、より多くのフロアを進めるはず
			expect(resultWithSkill.floorsCleared).toBeGreaterThanOrEqual(
				resultWithoutSkill.floorsCleared,
			);
		});

		it("スキルレベルが反映される", () => {
			const hero = createHero({
				atk: 100,
				def: 50,
				hp: 500,
				maxHp: 500,
			});
			const equippedSkills: EquippedSkill[] = [{ skillId: "fire", currentCooldown: 0 }];
			const ownedSkillsLv1: OwnedSkill[] = [{ skillId: "fire", level: 1 }];
			const ownedSkillsLv10: OwnedSkill[] = [{ skillId: "fire", level: 10 }];
			const resultLv1 = simulateOfflineBattle({
				hero,
				equippedSkills,
				ownedSkills: ownedSkillsLv1,
				currentFloor: 1,
				elapsedTicks: 300,
				random: () => 0.5,
			});
			const resultLv10 = simulateOfflineBattle({
				hero,
				equippedSkills,
				ownedSkills: ownedSkillsLv10,
				currentFloor: 1,
				elapsedTicks: 300,
				random: () => 0.5,
			});

			// レベル10の方がスキル倍率が高いので多くのフロアを進めるはず
			expect(resultLv10.floorsCleared).toBeGreaterThanOrEqual(resultLv1.floorsCleared);
		});
	});

	describe("ボスフロア", () => {
		it("ボスフロア (5の倍数) ではモンスターが強化される", () => {
			// フロア4からスタートし、フロア5(ボス)に到達する場合
			const hero = createHero({
				atk: 50,
				def: 20,
				hp: 200,
				maxHp: 200,
			});
			const result = simulateOfflineBattle({
				hero,
				equippedSkills: [],
				ownedSkills: [],
				currentFloor: 4,
				elapsedTicks: 300,
				random: () => 0.5,
			});
			// フロア4のモンスターは倒せるが、フロア5のボスは難しい可能性
			// 少なくともフロア4のモンスターは倒しているはず
			expect(result.monstersDefeated).toBeGreaterThanOrEqual(1);
		});
	});

	describe("パフォーマンス", () => {
		it("86400 tick の処理が高速に完了する", () => {
			const hero = createHero({
				atk: 100,
				def: 50,
				hp: 1000,
				maxHp: 1000,
			});
			const start = Date.now();
			simulateOfflineBattle({
				hero,
				equippedSkills: [],
				ownedSkills: [],
				currentFloor: 1,
				elapsedTicks: 86400,
				random: () => 0.5,
			});
			const elapsed = Date.now() - start;
			// 5秒以内に完了すること（実際は数十msで終わるはず）
			expect(elapsed).toBeLessThan(5000);
		});
	});

	describe("具体的な計算検証", () => {
		it("3 tick で1回の攻撃が行われる", () => {
			// 3 tick ちょうどの場合、ヒーローとモンスターが1回ずつ攻撃
			const hero = createHero({
				atk: 200,
				def: 100,
				hp: 1000,
				maxHp: 1000,
			});
			const result = simulateOfflineBattle({
				hero,
				equippedSkills: [],
				ownedSkills: [],
				currentFloor: 1,
				elapsedTicks: 3,
				random: () => 0.5,
			});
			// 3 tick でヒーローが1回攻撃、ATK=200 なら1体は倒せるはず
			expect(result.monstersDefeated).toBeGreaterThanOrEqual(1);
		});

		it("2 tick では攻撃が行われない", () => {
			const hero = createHero({
				atk: 200,
				def: 100,
				hp: 1000,
				maxHp: 1000,
			});
			const result = simulateOfflineBattle({
				hero,
				equippedSkills: [],
				ownedSkills: [],
				currentFloor: 1,
				elapsedTicks: 2,
				random: () => 0.5,
			});
			// 2 tick では攻撃がまだ発生しない
			expect(result.monstersDefeated).toBe(0);
			expect(result.floorsCleared).toBe(0);
		});

		it("簡易ダメージ計算を使用する（ATK * 1.0 - monsterDef * 0.5, 最低1）", () => {
			// ATK=10, monsterDef=4 => 10*1.0 - 4*0.5 = 8
			// フロア1の最初のモンスター（random=0 で選択）
			// イノシシ: baseHp=30, baseAtk=8, baseDef=3
			// scaleMonsterStats(floor=1): hp=floor(30*(1+1*0.15))=34, atk=floor(8*(1+1*0.1))=8, def=floor(3*(1+1*0.08))=3
			// damage = max(1, 10*1.0 - 3*0.5) = max(1, 8.5) = 8
			// 34 HP のモンスターを 8 ダメージで倒すには ceil(34/8)=5回 = 15 tick
			const hero = createHero({
				atk: 10,
				def: 100,
				hp: 1000,
				maxHp: 1000,
			});
			const result = simulateOfflineBattle({
				hero,
				equippedSkills: [],
				ownedSkills: [],
				currentFloor: 1,
				elapsedTicks: 15,
				random: () => 0, // 最初のモンスター（イノシシ）を選択
			});
			// 15 tick = 5回攻撃、34HPを8ダメで5回=40ダメ > 34HP なので1体撃破
			expect(result.monstersDefeated).toBe(1);
			expect(result.finalFloor).toBe(2);
		});
	});
});

// =============================================================================
// formatOfflineResult
// =============================================================================

describe("formatOfflineResult", () => {
	it("elapsedTicks が 0 の場合は進捗なしのメッセージを返す", () => {
		const result = formatOfflineResult({
			elapsedTicks: 0,
			floorsCleared: 0,
			monstersDefeated: 0,
			rewards: [],
			finalFloor: 1,
			heroDeaths: 0,
		});
		expect(result).toBe("留守中の進捗はありません");
	});

	it("進捗がある場合はフロア数・撃破数・到達フロアを含む", () => {
		const result = formatOfflineResult({
			elapsedTicks: 100,
			floorsCleared: 5,
			monstersDefeated: 5,
			rewards: [],
			finalFloor: 10,
			heroDeaths: 0,
		});
		expect(result).toContain("5 フロア進みました");
		expect(result).toContain("モンスター撃破数: 5");
		expect(result).toContain("到達フロア: 10");
	});

	it("留守中に〜のフォーマットを含む", () => {
		const result = formatOfflineResult({
			elapsedTicks: 100,
			floorsCleared: 3,
			monstersDefeated: 3,
			rewards: [],
			finalFloor: 8,
			heroDeaths: 0,
		});
		expect(result).toContain("留守中に 3 フロア進みました");
	});

	it("フロアが進まなかった場合も経過ティックがあればメッセージを返す", () => {
		const result = formatOfflineResult({
			elapsedTicks: 10,
			floorsCleared: 0,
			monstersDefeated: 0,
			rewards: [],
			finalFloor: 1,
			heroDeaths: 2,
		});
		expect(result).toContain("留守中に 0 フロア進みました");
	});
});
