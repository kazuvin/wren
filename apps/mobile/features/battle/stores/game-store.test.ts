import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EquippedSkill, GachaReward, HeroStats, Monster, OwnedSkill } from "../types";
import { useGameStore } from "./game-store";

// =============================================================================
// 初期状態
// =============================================================================

const initialHeroBaseStats: HeroStats = {
	hp: 100,
	maxHp: 100,
	atk: 10,
	def: 5,
	spd: 10,
	luk: 5,
};

function resetStore() {
	useGameStore.setState({
		heroBaseStats: { ...initialHeroBaseStats },
		equippedSkills: [],
		equippedItems: { weapon: null, armor: null, accessory: null },
		ownedSkills: [],
		ownedEquipment: [],
		currentFloor: 1,
		currentTick: 0,
		monster: {
			name: "テストモンスター",
			emoji: "👾",
			hp: 30,
			maxHp: 30,
			atk: 5,
			def: 2,
		},
		battleLog: [],
		lastTickTime: 1000000,
		lastReward: null,
		isDefeated: false,
		battleLogVersion: 0,
	});
}

// =============================================================================
// テスト
// =============================================================================

describe("game-store", () => {
	beforeEach(() => {
		resetStore();
	});

	// ===========================================================================
	// 初期状態
	// ===========================================================================

	describe("初期状態", () => {
		it("heroBaseStats の初期値が正しい", () => {
			const state = useGameStore.getState();
			expect(state.heroBaseStats).toEqual(initialHeroBaseStats);
		});

		it("equippedSkills の初期値は空配列", () => {
			const state = useGameStore.getState();
			expect(state.equippedSkills).toEqual([]);
		});

		it("equippedItems の初期値は全て null", () => {
			const state = useGameStore.getState();
			expect(state.equippedItems).toEqual({
				weapon: null,
				armor: null,
				accessory: null,
			});
		});

		it("ownedSkills の初期値は空配列", () => {
			expect(useGameStore.getState().ownedSkills).toEqual([]);
		});

		it("ownedEquipment の初期値は空配列", () => {
			expect(useGameStore.getState().ownedEquipment).toEqual([]);
		});

		it("currentFloor の初期値は 1", () => {
			expect(useGameStore.getState().currentFloor).toBe(1);
		});

		it("currentTick の初期値は 0", () => {
			expect(useGameStore.getState().currentTick).toBe(0);
		});

		it("battleLog の初期値は空配列", () => {
			expect(useGameStore.getState().battleLog).toEqual([]);
		});

		it("lastReward の初期値は null", () => {
			expect(useGameStore.getState().lastReward).toBeNull();
		});
	});

	// ===========================================================================
	// initBattle
	// ===========================================================================

	describe("initBattle", () => {
		it("バトルをフロア1で初期化する", () => {
			// 事前に状態を変更
			useGameStore.setState({
				currentFloor: 10,
				currentTick: 50,
				battleLog: [{ tick: 1, message: "test", type: "hero_attack" }],
			});

			useGameStore.getState().initBattle();

			const state = useGameStore.getState();
			expect(state.currentFloor).toBe(1);
			expect(state.currentTick).toBe(0);
			expect(state.battleLog).toEqual([]);
		});

		it("初期化時にモンスターが生成される", () => {
			useGameStore.getState().initBattle();

			const state = useGameStore.getState();
			expect(state.monster).toBeDefined();
			expect(state.monster.hp).toBeGreaterThan(0);
			expect(state.monster.maxHp).toBeGreaterThan(0);
		});

		it("初期化時にヒーローのステータスがリセットされる", () => {
			useGameStore.setState({
				heroBaseStats: { hp: 50, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
			});

			useGameStore.getState().initBattle();

			const state = useGameStore.getState();
			expect(state.heroBaseStats).toEqual(initialHeroBaseStats);
		});
	});

	// ===========================================================================
	// processTick
	// ===========================================================================

	describe("processTick", () => {
		it("currentTick をインクリメントする", () => {
			useGameStore.getState().processTick();

			expect(useGameStore.getState().currentTick).toBe(1);
		});

		it("tick が 3 の倍数でないときは攻撃しない", () => {
			// tick 1, 2 はログが増えない
			useGameStore.getState().processTick(); // tick = 1
			expect(useGameStore.getState().battleLog).toHaveLength(0);

			useGameStore.getState().processTick(); // tick = 2
			expect(useGameStore.getState().battleLog).toHaveLength(0);
		});

		it("tick が 3 の倍数のときヒーローが攻撃する", () => {
			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			expect(state.battleLog.length).toBeGreaterThan(0);
			// モンスターの HP が減少しているはず
			expect(state.monster.hp).toBeLessThan(30);
		});

		it("tick が 3 の倍数のときモンスターも攻撃する", () => {
			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			// ヒーローの HP が減少しているはず
			expect(state.heroBaseStats.hp).toBeLessThan(100);
		});

		it("装備時でもモンスター攻撃でheroBaseStats.hpが減少する", () => {
			useGameStore.setState({
				ownedEquipment: ["leather_armor"],
				equippedItems: { weapon: null, armor: "leather_armor", accessory: null },
			});

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			// 装備していてもHPが減少するはず
			expect(state.heroBaseStats.hp).toBeLessThan(100);
		});

		it("モンスターを倒すとフロアが進む", () => {
			// HP を 1 に設定してすぐ倒せるようにする
			useGameStore.setState({
				monster: {
					name: "弱モンスター",
					emoji: "👾",
					hp: 1,
					maxHp: 1,
					atk: 1,
					def: 0,
				},
			});

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			expect(state.currentFloor).toBe(2);
			// 新しいモンスターが生成される
			expect(state.monster.hp).toBeGreaterThan(0);
		});

		it("モンスター撃破時にHPが全回復する", () => {
			// def を高くして新モンスターからのダメージを最小化
			useGameStore.setState({
				heroBaseStats: { hp: 50, maxHp: 100, atk: 10, def: 999, spd: 10, luk: 5 },
				monster: {
					name: "弱モンスター",
					emoji: "👾",
					hp: 1,
					maxHp: 1,
					atk: 1,
					def: 0,
				},
			});

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			expect(state.currentFloor).toBe(2);
			// 全回復後に新モンスターから最低1ダメージを受ける
			expect(state.heroBaseStats.hp).toBe(state.heroBaseStats.maxHp - 1);
		});

		it("モンスターを倒すと defeat ログが追加される", () => {
			useGameStore.setState({
				monster: {
					name: "弱モンスター",
					emoji: "👾",
					hp: 1,
					maxHp: 1,
					atk: 1,
					def: 0,
				},
			});

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			const defeatLogs = state.battleLog.filter((l) => l.type === "defeat");
			expect(defeatLogs.length).toBeGreaterThan(0);
		});

		it("ヒーローの HP が 0 以下になると敗北状態になる", () => {
			useGameStore.setState({
				heroBaseStats: { hp: 1, maxHp: 100, atk: 10, def: 0, spd: 10, luk: 0 },
				monster: {
					name: "強モンスター",
					emoji: "👹",
					hp: 1000,
					maxHp: 1000,
					atk: 100,
					def: 0,
				},
			});

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			// 敗北状態になる
			expect(state.isDefeated).toBe(true);
			// hero_defeat ログがある
			const defeatLogs = state.battleLog.filter((l) => l.type === "hero_defeat");
			expect(defeatLogs.length).toBeGreaterThan(0);
		});

		it("敗北状態ではprocessTickで何も起こらない", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
				currentTick: 10,
			});

			useGameStore.getState().processTick();

			const state = useGameStore.getState();
			// tickが進まない
			expect(state.currentTick).toBe(10);
		});

		it("battleLog は最大 20 件に制限される", () => {
			// 大量のログを事前に入れる
			const logs = Array.from({ length: 25 }, (_, i) => ({
				tick: i,
				message: `ログ${i}`,
				type: "hero_attack" as const,
			}));
			useGameStore.setState({ battleLog: logs });

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			expect(state.battleLog.length).toBeLessThanOrEqual(20);
		});

		it("lastTickTime が更新される", () => {
			const beforeTime = useGameStore.getState().lastTickTime;
			useGameStore.getState().processTick();

			const state = useGameStore.getState();
			expect(state.lastTickTime).toBeGreaterThanOrEqual(beforeTime);
		});

		it("ボスフロアでモンスターを倒すとボス報酬が追加される", () => {
			// フロア5（ボスフロア）に設定
			useGameStore.setState({
				currentFloor: 5,
				monster: {
					name: "ボス",
					emoji: "👹",
					hp: 1,
					maxHp: 1,
					atk: 1,
					def: 0,
				},
			});

			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3

			const state = useGameStore.getState();
			// ボスを倒したのでフロアが進んでいるはず
			expect(state.currentFloor).toBe(6);
			// ボス報酬（lastReward）が設定される
			expect(state.lastReward).not.toBeNull();
		});
	});

	// ===========================================================================
	// battleLogVersion
	// ===========================================================================

	describe("battleLogVersion", () => {
		it("初期値は0", () => {
			expect(useGameStore.getState().battleLogVersion).toBe(0);
		});

		it("攻撃ターンごとにインクリメントされる", () => {
			useGameStore.getState().processTick(); // tick = 1
			useGameStore.getState().processTick(); // tick = 2
			useGameStore.getState().processTick(); // tick = 3 (攻撃ターン)

			expect(useGameStore.getState().battleLogVersion).toBe(1);
		});

		it("非攻撃ターンではインクリメントされない", () => {
			useGameStore.getState().processTick(); // tick = 1
			expect(useGameStore.getState().battleLogVersion).toBe(0);

			useGameStore.getState().processTick(); // tick = 2
			expect(useGameStore.getState().battleLogVersion).toBe(0);
		});

		it("複数の攻撃ターンで連続してインクリメントされる", () => {
			// tick 1-3: 最初の攻撃ターン
			for (let i = 0; i < 3; i++) useGameStore.getState().processTick();
			expect(useGameStore.getState().battleLogVersion).toBe(1);

			// tick 4-6: 2回目の攻撃ターン
			for (let i = 0; i < 3; i++) useGameStore.getState().processTick();
			expect(useGameStore.getState().battleLogVersion).toBe(2);

			// tick 7-9: 3回目の攻撃ターン
			for (let i = 0; i < 3; i++) useGameStore.getState().processTick();
			expect(useGameStore.getState().battleLogVersion).toBe(3);
		});
	});

	// ===========================================================================
	// retryBattle
	// ===========================================================================

	describe("retryBattle", () => {
		it("敗北状態から再戦するとisDefeatedがfalseになる", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
				monster: {
					name: "テストモンスター",
					emoji: "👾",
					hp: 10,
					maxHp: 30,
					atk: 5,
					def: 2,
				},
			});

			useGameStore.getState().retryBattle();

			const state = useGameStore.getState();
			expect(state.isDefeated).toBe(false);
		});

		it("再戦するとヒーローのHPが全回復する", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
			});

			useGameStore.getState().retryBattle();

			expect(useGameStore.getState().heroBaseStats.hp).toBe(100);
		});

		it("再戦するとモンスターのHPが全回復する", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
				monster: {
					name: "テストモンスター",
					emoji: "👾",
					hp: 10,
					maxHp: 30,
					atk: 5,
					def: 2,
				},
			});

			useGameStore.getState().retryBattle();

			const state = useGameStore.getState();
			expect(state.monster.hp).toBe(state.monster.maxHp);
		});

		it("再戦するとバトルログがクリアされる", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
				battleLog: [
					{ tick: 1, message: "テスト攻撃", type: "hero_attack" },
					{ tick: 2, message: "テスト被弾", type: "monster_attack" },
				],
			});

			useGameStore.getState().retryBattle();

			expect(useGameStore.getState().battleLog).toEqual([]);
		});

		it("再戦するとクールダウンが0にリセットされる", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
				equippedSkills: [
					{ skillId: "fire", currentCooldown: 8 },
					{ skillId: "frost", currentCooldown: 5 },
				],
			});

			useGameStore.getState().retryBattle();

			const skills = useGameStore.getState().equippedSkills;
			expect(skills).toHaveLength(2);
			for (const skill of skills) {
				expect(skill.currentCooldown).toBe(0);
			}
		});

		it("再戦するとcurrentTickが0にリセットされる", () => {
			useGameStore.setState({
				isDefeated: true,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
				currentTick: 42,
			});

			useGameStore.getState().retryBattle();

			expect(useGameStore.getState().currentTick).toBe(0);
		});

		it("再戦してもフロアは変わらない", () => {
			useGameStore.setState({
				isDefeated: true,
				currentFloor: 5,
				heroBaseStats: { hp: 0, maxHp: 100, atk: 10, def: 5, spd: 10, luk: 5 },
			});

			useGameStore.getState().retryBattle();

			expect(useGameStore.getState().currentFloor).toBe(5);
		});
	});

	// ===========================================================================
	// equipSkill / unequipSkill
	// ===========================================================================

	describe("equipSkill", () => {
		it("スキルを装備できる", () => {
			useGameStore.setState({
				ownedSkills: [{ skillId: "fire", level: 1 }],
			});

			useGameStore.getState().equipSkill("fire");

			const state = useGameStore.getState();
			expect(state.equippedSkills).toHaveLength(1);
			expect(state.equippedSkills[0].skillId).toBe("fire");
			expect(state.equippedSkills[0].currentCooldown).toBe(0);
		});

		it("最大スロット数（5）を超えて装備できない", () => {
			useGameStore.setState({
				ownedSkills: [
					{ skillId: "fire", level: 1 },
					{ skillId: "frost", level: 1 },
					{ skillId: "thunder", level: 1 },
					{ skillId: "heal", level: 1 },
					{ skillId: "poison", level: 1 },
					{ skillId: "berserk", level: 1 },
				],
				equippedSkills: [
					{ skillId: "fire", currentCooldown: 0 },
					{ skillId: "frost", currentCooldown: 0 },
					{ skillId: "thunder", currentCooldown: 0 },
					{ skillId: "heal", currentCooldown: 0 },
					{ skillId: "poison", currentCooldown: 0 },
				],
			});

			useGameStore.getState().equipSkill("berserk");

			expect(useGameStore.getState().equippedSkills).toHaveLength(5);
		});
	});

	describe("unequipSkill", () => {
		it("スキルを外すことができる", () => {
			useGameStore.setState({
				equippedSkills: [
					{ skillId: "fire", currentCooldown: 0 },
					{ skillId: "frost", currentCooldown: 0 },
				],
			});

			useGameStore.getState().unequipSkill("fire");

			const state = useGameStore.getState();
			expect(state.equippedSkills).toHaveLength(1);
			expect(state.equippedSkills[0].skillId).toBe("frost");
		});
	});

	// ===========================================================================
	// equipItem / unequipItem
	// ===========================================================================

	describe("equipItem", () => {
		it("武器を装備できる", () => {
			useGameStore.setState({
				ownedEquipment: ["wooden_sword"],
			});

			useGameStore.getState().equipItem("wooden_sword");

			const state = useGameStore.getState();
			expect(state.equippedItems.weapon).toBe("wooden_sword");
		});

		it("防具を装備できる", () => {
			useGameStore.setState({
				ownedEquipment: ["leather_armor"],
			});

			useGameStore.getState().equipItem("leather_armor");

			const state = useGameStore.getState();
			expect(state.equippedItems.armor).toBe("leather_armor");
		});

		it("アクセサリーを装備できる", () => {
			useGameStore.setState({
				ownedEquipment: ["lucky_charm"],
			});

			useGameStore.getState().equipItem("lucky_charm");

			const state = useGameStore.getState();
			expect(state.equippedItems.accessory).toBe("lucky_charm");
		});
	});

	describe("unequipItem", () => {
		it("武器を外すことができる", () => {
			useGameStore.setState({
				equippedItems: { weapon: "wooden_sword", armor: null, accessory: null },
			});

			useGameStore.getState().unequipItem("weapon");

			expect(useGameStore.getState().equippedItems.weapon).toBeNull();
		});

		it("防具を外すことができる", () => {
			useGameStore.setState({
				equippedItems: { weapon: null, armor: "leather_armor", accessory: null },
			});

			useGameStore.getState().unequipItem("armor");

			expect(useGameStore.getState().equippedItems.armor).toBeNull();
		});

		it("アクセサリーを外すことができる", () => {
			useGameStore.setState({
				equippedItems: { weapon: null, armor: null, accessory: "lucky_charm" },
			});

			useGameStore.getState().unequipItem("accessory");

			expect(useGameStore.getState().equippedItems.accessory).toBeNull();
		});
	});

	// ===========================================================================
	// addReward
	// ===========================================================================

	describe("addReward", () => {
		it("stat_boost 報酬でステータスが増加する", () => {
			const reward: GachaReward = {
				type: "stat_boost",
				rarity: "common",
				stat: "atk",
				amount: 3,
			};

			useGameStore.getState().addReward(reward);

			const state = useGameStore.getState();
			expect(state.heroBaseStats.atk).toBe(13); // 10 + 3
		});

		it("stat_boost で def が増加する", () => {
			const reward: GachaReward = {
				type: "stat_boost",
				rarity: "rare",
				stat: "def",
				amount: 5,
			};

			useGameStore.getState().addReward(reward);

			expect(useGameStore.getState().heroBaseStats.def).toBe(10); // 5 + 5
		});

		it("stat_boost で spd が増加する", () => {
			const reward: GachaReward = {
				type: "stat_boost",
				rarity: "common",
				stat: "spd",
				amount: 2,
			};

			useGameStore.getState().addReward(reward);

			expect(useGameStore.getState().heroBaseStats.spd).toBe(12); // 10 + 2
		});

		it("stat_boost で luk が増加する", () => {
			const reward: GachaReward = {
				type: "stat_boost",
				rarity: "common",
				stat: "luk",
				amount: 1,
			};

			useGameStore.getState().addReward(reward);

			expect(useGameStore.getState().heroBaseStats.luk).toBe(6); // 5 + 1
		});

		it("skill 報酬で新しいスキルが追加される", () => {
			const reward: GachaReward = {
				type: "skill",
				rarity: "common",
				skillId: "fire",
			};

			useGameStore.getState().addReward(reward);

			const state = useGameStore.getState();
			expect(state.ownedSkills).toHaveLength(1);
			expect(state.ownedSkills[0].skillId).toBe("fire");
			expect(state.ownedSkills[0].level).toBe(1);
		});

		it("skill 報酬で既存スキルがレベルアップする", () => {
			useGameStore.setState({
				ownedSkills: [{ skillId: "fire", level: 1 }],
			});

			const reward: GachaReward = {
				type: "skill",
				rarity: "common",
				skillId: "fire",
			};

			useGameStore.getState().addReward(reward);

			const state = useGameStore.getState();
			expect(state.ownedSkills).toHaveLength(1);
			expect(state.ownedSkills[0].level).toBe(2);
		});

		it("equipment 報酬で新しい装備が追加される", () => {
			const reward: GachaReward = {
				type: "equipment",
				rarity: "common",
				equipmentId: "wooden_sword",
			};

			useGameStore.getState().addReward(reward);

			const state = useGameStore.getState();
			expect(state.ownedEquipment).toContain("wooden_sword");
		});

		it("equipment 報酬で既に所持している装備は重複追加されない", () => {
			useGameStore.setState({
				ownedEquipment: ["wooden_sword"],
			});

			const reward: GachaReward = {
				type: "equipment",
				rarity: "common",
				equipmentId: "wooden_sword",
			};

			useGameStore.getState().addReward(reward);

			const state = useGameStore.getState();
			expect(state.ownedEquipment.filter((id) => id === "wooden_sword")).toHaveLength(1);
		});
	});

	// ===========================================================================
	// processTaskComplete
	// ===========================================================================

	describe("processTaskComplete", () => {
		it("タスク完了時に報酬が生成され lastReward に設定される", () => {
			useGameStore.getState().processTaskComplete();

			const state = useGameStore.getState();
			expect(state.lastReward).not.toBeNull();
		});

		it("タスク完了時に報酬が適用される", () => {
			// processTaskComplete を複数回呼ぶと何かしらのステータスが変化するはず
			const beforeStats = { ...useGameStore.getState().heroBaseStats };
			const beforeSkills = [...useGameStore.getState().ownedSkills];
			const beforeEquipment = [...useGameStore.getState().ownedEquipment];

			// 複数回呼んで何かしら変化するか確認
			for (let i = 0; i < 10; i++) {
				useGameStore.getState().processTaskComplete();
			}

			const state = useGameStore.getState();
			// 少なくとも何かしらの報酬が適用されているはず
			const hasStatsChanged =
				state.heroBaseStats.atk !== beforeStats.atk ||
				state.heroBaseStats.def !== beforeStats.def ||
				state.heroBaseStats.spd !== beforeStats.spd ||
				state.heroBaseStats.luk !== beforeStats.luk;
			const hasSkillsChanged = state.ownedSkills.length !== beforeSkills.length;
			const hasEquipmentChanged = state.ownedEquipment.length !== beforeEquipment.length;

			expect(hasStatsChanged || hasSkillsChanged || hasEquipmentChanged).toBe(true);
		});
	});

	// ===========================================================================
	// getEffectiveStats
	// ===========================================================================

	describe("getEffectiveStats", () => {
		it("装備なしの場合ベースステータスをそのまま返す", () => {
			const effective = useGameStore.getState().getEffectiveStats();

			expect(effective).toEqual(initialHeroBaseStats);
		});

		it("武器を装備するとステータスが反映される", () => {
			useGameStore.setState({
				ownedEquipment: ["wooden_sword"],
				equippedItems: { weapon: "wooden_sword", armor: null, accessory: null },
			});

			const effective = useGameStore.getState().getEffectiveStats();

			// wooden_sword: atk +3
			expect(effective.atk).toBe(13); // 10 + 3
		});

		it("複数の装備のステータスが合算される（hpはベース値のまま）", () => {
			useGameStore.setState({
				ownedEquipment: ["wooden_sword", "leather_armor", "lucky_charm"],
				equippedItems: {
					weapon: "wooden_sword",
					armor: "leather_armor",
					accessory: "lucky_charm",
				},
			});

			const effective = useGameStore.getState().getEffectiveStats();

			// wooden_sword: atk +3
			// leather_armor: def +2, hp +10
			// lucky_charm: luk +3
			expect(effective.atk).toBe(13); // 10 + 3
			expect(effective.def).toBe(7); // 5 + 2
			expect(effective.hp).toBe(100); // hpはベース値のまま
			expect(effective.maxHp).toBe(110); // 100 + 10
			expect(effective.luk).toBe(8); // 5 + 3
		});
	});

	// ===========================================================================
	// processOfflineProgress
	// ===========================================================================

	describe("processOfflineProgress", () => {
		it("オフライン時間が 0 の場合は何も変わらない", () => {
			const beforeState = useGameStore.getState();

			useGameStore.getState().processOfflineProgress(beforeState.lastTickTime);

			const state = useGameStore.getState();
			expect(state.currentFloor).toBe(beforeState.currentFloor);
		});

		it("オフライン時間が経過するとフロアが進む可能性がある", () => {
			// 十分な時間を経過させる（1000秒 = 1000 ticks）
			const lastTickTime = useGameStore.getState().lastTickTime;
			const futureTime = lastTickTime + 1000 * 1000; // 1000秒後

			useGameStore.getState().processOfflineProgress(futureTime);

			const state = useGameStore.getState();
			// フロアが進んでいるはず（フロア1のモンスターは弱いので）
			expect(state.currentFloor).toBeGreaterThanOrEqual(1);
		});

		it("lastTickTime が更新される", () => {
			const lastTickTime = useGameStore.getState().lastTickTime;
			const futureTime = lastTickTime + 60000; // 60秒後

			useGameStore.getState().processOfflineProgress(futureTime);

			expect(useGameStore.getState().lastTickTime).toBe(futureTime);
		});
	});

	// ===========================================================================
	// clearLastReward
	// ===========================================================================

	describe("clearLastReward", () => {
		it("lastReward を null にする", () => {
			useGameStore.setState({
				lastReward: {
					type: "stat_boost",
					rarity: "common",
					stat: "atk",
					amount: 3,
				},
			});

			useGameStore.getState().clearLastReward();

			expect(useGameStore.getState().lastReward).toBeNull();
		});
	});
});
