import { describe, expect, it } from "vitest";
import type { EquipmentDefinition, EquipmentSlot, EquipmentStats, HeroStats } from "../types";
import {
	ALL_EQUIPMENT,
	EQUIPMENT_SLOTS,
	applyEquipmentToHero,
	calculateEquipmentBonus,
	canEquipToSlot,
	getEquipmentByRarity,
	getEquipmentBySlot,
	getEquipmentDefinition,
} from "./equipment";

// =============================================================================
// EQUIPMENT_SLOTS
// =============================================================================

describe("EQUIPMENT_SLOTS", () => {
	it("weapon, armor, accessory の3つのスロットを持つ", () => {
		expect(EQUIPMENT_SLOTS).toEqual(["weapon", "armor", "accessory"]);
	});

	it("長さが3である", () => {
		expect(EQUIPMENT_SLOTS).toHaveLength(3);
	});
});

// =============================================================================
// ALL_EQUIPMENT
// =============================================================================

describe("ALL_EQUIPMENT", () => {
	it("合計12種類の装備が定義されている", () => {
		expect(ALL_EQUIPMENT).toHaveLength(12);
	});

	it("武器が4種類ある", () => {
		const weapons = ALL_EQUIPMENT.filter((e) => e.slot === "weapon");
		expect(weapons).toHaveLength(4);
	});

	it("防具が4種類ある", () => {
		const armors = ALL_EQUIPMENT.filter((e) => e.slot === "armor");
		expect(armors).toHaveLength(4);
	});

	it("アクセサリーが4種類ある", () => {
		const accessories = ALL_EQUIPMENT.filter((e) => e.slot === "accessory");
		expect(accessories).toHaveLength(4);
	});

	it("全てのIDがユニークである", () => {
		const ids = ALL_EQUIPMENT.map((e) => e.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it("各レアリティに3種類ずつある", () => {
		const rarities = ["common", "rare", "epic", "legendary"] as const;
		for (const rarity of rarities) {
			const items = ALL_EQUIPMENT.filter((e) => e.rarity === rarity);
			expect(items).toHaveLength(3);
		}
	});

	it("木の剣の定義が正しい", () => {
		const woodenSword = ALL_EQUIPMENT.find((e) => e.id === "wooden_sword");
		expect(woodenSword).toEqual({
			id: "wooden_sword",
			name: "木の剣",
			emoji: "🗡️",
			slot: "weapon",
			rarity: "common",
			stats: { atk: 3 },
		});
	});

	it("聖剣の定義が正しい", () => {
		const holySword = ALL_EQUIPMENT.find((e) => e.id === "holy_sword");
		expect(holySword).toEqual({
			id: "holy_sword",
			name: "聖剣",
			emoji: "✨",
			slot: "weapon",
			rarity: "legendary",
			stats: { atk: 25, luk: 5, spd: 2 },
		});
	});

	it("竜の鎧の定義が正しい", () => {
		const dragonArmor = ALL_EQUIPMENT.find((e) => e.id === "dragon_armor");
		expect(dragonArmor).toEqual({
			id: "dragon_armor",
			name: "竜の鎧",
			emoji: "🐉",
			slot: "armor",
			rarity: "epic",
			stats: { def: 10, hp: 50 },
		});
	});

	it("神のリングの定義が正しい", () => {
		const divineRing = ALL_EQUIPMENT.find((e) => e.id === "divine_ring");
		expect(divineRing).toEqual({
			id: "divine_ring",
			name: "神のリング",
			emoji: "💍",
			slot: "accessory",
			rarity: "legendary",
			stats: { atk: 5, def: 5, hp: 30, spd: 3, luk: 8 },
		});
	});
});

// =============================================================================
// getEquipmentDefinition
// =============================================================================

describe("getEquipmentDefinition", () => {
	it("存在するIDで装備定義を取得できる", () => {
		const result = getEquipmentDefinition("wooden_sword");
		expect(result).toBeDefined();
		expect(result?.id).toBe("wooden_sword");
		expect(result?.name).toBe("木の剣");
	});

	it("鉄の剣を取得できる", () => {
		const result = getEquipmentDefinition("iron_sword");
		expect(result).toBeDefined();
		expect(result?.slot).toBe("weapon");
		expect(result?.rarity).toBe("rare");
		expect(result?.stats).toEqual({ atk: 8 });
	});

	it("革の鎧を取得できる", () => {
		const result = getEquipmentDefinition("leather_armor");
		expect(result).toBeDefined();
		expect(result?.slot).toBe("armor");
		expect(result?.stats).toEqual({ def: 2, hp: 10 });
	});

	it("幸運のお守りを取得できる", () => {
		const result = getEquipmentDefinition("lucky_charm");
		expect(result).toBeDefined();
		expect(result?.slot).toBe("accessory");
		expect(result?.stats).toEqual({ luk: 3 });
	});

	it("存在しないIDではundefinedを返す", () => {
		const result = getEquipmentDefinition("nonexistent_item");
		expect(result).toBeUndefined();
	});

	it("空文字列ではundefinedを返す", () => {
		const result = getEquipmentDefinition("");
		expect(result).toBeUndefined();
	});
});

// =============================================================================
// getEquipmentBySlot
// =============================================================================

describe("getEquipmentBySlot", () => {
	it("武器スロットの装備を全て取得できる", () => {
		const weapons = getEquipmentBySlot("weapon");
		expect(weapons).toHaveLength(4);
		for (const w of weapons) {
			expect(w.slot).toBe("weapon");
		}
	});

	it("防具スロットの装備を全て取得できる", () => {
		const armors = getEquipmentBySlot("armor");
		expect(armors).toHaveLength(4);
		for (const a of armors) {
			expect(a.slot).toBe("armor");
		}
	});

	it("アクセサリースロットの装備を全て取得できる", () => {
		const accessories = getEquipmentBySlot("accessory");
		expect(accessories).toHaveLength(4);
		for (const acc of accessories) {
			expect(acc.slot).toBe("accessory");
		}
	});

	it("武器スロットに木の剣が含まれる", () => {
		const weapons = getEquipmentBySlot("weapon");
		const ids = weapons.map((w) => w.id);
		expect(ids).toContain("wooden_sword");
		expect(ids).toContain("iron_sword");
		expect(ids).toContain("flame_sword");
		expect(ids).toContain("holy_sword");
	});
});

// =============================================================================
// getEquipmentByRarity
// =============================================================================

describe("getEquipmentByRarity", () => {
	it("commonレアリティの装備を3つ取得できる", () => {
		const commons = getEquipmentByRarity("common");
		expect(commons).toHaveLength(3);
		for (const c of commons) {
			expect(c.rarity).toBe("common");
		}
	});

	it("rareレアリティの装備を3つ取得できる", () => {
		const rares = getEquipmentByRarity("rare");
		expect(rares).toHaveLength(3);
		for (const r of rares) {
			expect(r.rarity).toBe("rare");
		}
	});

	it("epicレアリティの装備を3つ取得できる", () => {
		const epics = getEquipmentByRarity("epic");
		expect(epics).toHaveLength(3);
		for (const e of epics) {
			expect(e.rarity).toBe("epic");
		}
	});

	it("legendaryレアリティの装備を3つ取得できる", () => {
		const legendaries = getEquipmentByRarity("legendary");
		expect(legendaries).toHaveLength(3);
		for (const l of legendaries) {
			expect(l.rarity).toBe("legendary");
		}
	});

	it("commonにはwooden_sword, leather_armor, lucky_charmが含まれる", () => {
		const commons = getEquipmentByRarity("common");
		const ids = commons.map((c) => c.id);
		expect(ids).toContain("wooden_sword");
		expect(ids).toContain("leather_armor");
		expect(ids).toContain("lucky_charm");
	});
});

// =============================================================================
// calculateEquipmentBonus
// =============================================================================

describe("calculateEquipmentBonus", () => {
	it("全スロットnullの場合、全ステータス0を返す", () => {
		const result = calculateEquipmentBonus([null, null, null]);
		expect(result).toEqual({ atk: 0, def: 0, hp: 0, spd: 0, luk: 0 });
	});

	it("武器のみ装備した場合のボーナス", () => {
		const result = calculateEquipmentBonus(["wooden_sword", null, null]);
		expect(result).toEqual({ atk: 3, def: 0, hp: 0, spd: 0, luk: 0 });
	});

	it("防具のみ装備した場合のボーナス", () => {
		const result = calculateEquipmentBonus([null, "leather_armor", null]);
		expect(result).toEqual({ atk: 0, def: 2, hp: 10, spd: 0, luk: 0 });
	});

	it("アクセサリーのみ装備した場合のボーナス", () => {
		const result = calculateEquipmentBonus([null, null, "lucky_charm"]);
		expect(result).toEqual({ atk: 0, def: 0, hp: 0, spd: 0, luk: 3 });
	});

	it("全スロット装備した場合のボーナスが合算される", () => {
		const result = calculateEquipmentBonus(["wooden_sword", "leather_armor", "lucky_charm"]);
		// wooden_sword: atk:3
		// leather_armor: def:2, hp:10
		// lucky_charm: luk:3
		expect(result).toEqual({ atk: 3, def: 2, hp: 10, spd: 0, luk: 3 });
	});

	it("複数のステータスを持つ装備が正しく合算される", () => {
		const result = calculateEquipmentBonus(["holy_sword", "holy_armor", "divine_ring"]);
		// holy_sword: atk:25, luk:5, spd:2
		// holy_armor: def:18, hp:80, spd:1
		// divine_ring: atk:5, def:5, hp:30, spd:3, luk:8
		expect(result).toEqual({
			atk: 25 + 5,
			def: 18 + 5,
			hp: 80 + 30,
			spd: 2 + 1 + 3,
			luk: 5 + 8,
		});
	});

	it("flame_swordとiron_armorとspeed_ringの組み合わせ", () => {
		const result = calculateEquipmentBonus(["flame_sword", "iron_armor", "speed_ring"]);
		// flame_sword: atk:15, luk:3
		// iron_armor: def:5, hp:25
		// speed_ring: spd:3, luk:2
		expect(result).toEqual({
			atk: 15,
			def: 5,
			hp: 25,
			spd: 3,
			luk: 3 + 2,
		});
	});

	it("存在しない装備IDが含まれていても無視して合算する", () => {
		const result = calculateEquipmentBonus(["nonexistent", null, "lucky_charm"]);
		expect(result).toEqual({ atk: 0, def: 0, hp: 0, spd: 0, luk: 3 });
	});
});

// =============================================================================
// applyEquipmentToHero
// =============================================================================

describe("applyEquipmentToHero", () => {
	const baseStats: HeroStats = {
		hp: 100,
		maxHp: 100,
		atk: 10,
		def: 5,
		spd: 3,
		luk: 1,
	};

	it("ボーナスが全て0の場合、ベースステータスがそのまま返る", () => {
		const bonus: EquipmentStats = { atk: 0, def: 0, hp: 0, spd: 0, luk: 0 };
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result).toEqual(baseStats);
	});

	it("ATKボーナスが正しく加算される", () => {
		const bonus: EquipmentStats = { atk: 5, def: 0, hp: 0, spd: 0, luk: 0 };
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result.atk).toBe(15);
	});

	it("DEFボーナスが正しく加算される", () => {
		const bonus: EquipmentStats = { atk: 0, def: 3, hp: 0, spd: 0, luk: 0 };
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result.def).toBe(8);
	});

	it("HPボーナスはmaxHpのみに加算され、hpには加算されない", () => {
		const bonus: EquipmentStats = { atk: 0, def: 0, hp: 20, spd: 0, luk: 0 };
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result.hp).toBe(100);
		expect(result.maxHp).toBe(120);
	});

	it("SPDボーナスが正しく加算される", () => {
		const bonus: EquipmentStats = { atk: 0, def: 0, hp: 0, spd: 4, luk: 0 };
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result.spd).toBe(7);
	});

	it("LUKボーナスが正しく加算される", () => {
		const bonus: EquipmentStats = { atk: 0, def: 0, hp: 0, spd: 0, luk: 10 };
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result.luk).toBe(11);
	});

	it("全てのボーナスが同時に加算される（hpはベース値のまま）", () => {
		const bonus: EquipmentStats = {
			atk: 30,
			def: 23,
			hp: 110,
			spd: 6,
			luk: 13,
		};
		const result = applyEquipmentToHero(baseStats, bonus);
		expect(result).toEqual({
			hp: 100,
			maxHp: 210,
			atk: 40,
			def: 28,
			spd: 9,
			luk: 14,
		});
	});

	it("元のベースステータスを変更しない（イミュータブル）", () => {
		const bonus: EquipmentStats = {
			atk: 5,
			def: 3,
			hp: 10,
			spd: 2,
			luk: 1,
		};
		const originalBase = { ...baseStats };
		applyEquipmentToHero(baseStats, bonus);
		expect(baseStats).toEqual(originalBase);
	});

	it("HPが減っている状態でもhpはベース値のまま、maxHpにのみボーナス加算", () => {
		const damagedStats: HeroStats = {
			hp: 50,
			maxHp: 100,
			atk: 10,
			def: 5,
			spd: 3,
			luk: 1,
		};
		const bonus: EquipmentStats = { atk: 0, def: 0, hp: 20, spd: 0, luk: 0 };
		const result = applyEquipmentToHero(damagedStats, bonus);
		expect(result.hp).toBe(50);
		expect(result.maxHp).toBe(120);
	});
});

// =============================================================================
// canEquipToSlot
// =============================================================================

describe("canEquipToSlot", () => {
	it("武器を武器スロットに装備できる", () => {
		expect(canEquipToSlot("wooden_sword", "weapon")).toBe(true);
	});

	it("防具を防具スロットに装備できる", () => {
		expect(canEquipToSlot("leather_armor", "armor")).toBe(true);
	});

	it("アクセサリーをアクセサリースロットに装備できる", () => {
		expect(canEquipToSlot("lucky_charm", "accessory")).toBe(true);
	});

	it("武器を防具スロットには装備できない", () => {
		expect(canEquipToSlot("wooden_sword", "armor")).toBe(false);
	});

	it("武器をアクセサリースロットには装備できない", () => {
		expect(canEquipToSlot("iron_sword", "accessory")).toBe(false);
	});

	it("防具を武器スロットには装備できない", () => {
		expect(canEquipToSlot("iron_armor", "weapon")).toBe(false);
	});

	it("防具をアクセサリースロットには装備できない", () => {
		expect(canEquipToSlot("dragon_armor", "accessory")).toBe(false);
	});

	it("アクセサリーを武器スロットには装備できない", () => {
		expect(canEquipToSlot("speed_ring", "weapon")).toBe(false);
	});

	it("アクセサリーを防具スロットには装備できない", () => {
		expect(canEquipToSlot("power_amulet", "armor")).toBe(false);
	});

	it("存在しない装備IDの場合はfalseを返す", () => {
		expect(canEquipToSlot("nonexistent", "weapon")).toBe(false);
	});

	it("全ての武器が武器スロットに装備可能", () => {
		const weaponIds = ["wooden_sword", "iron_sword", "flame_sword", "holy_sword"];
		for (const id of weaponIds) {
			expect(canEquipToSlot(id, "weapon")).toBe(true);
		}
	});

	it("全てのlegendary装備が正しいスロットに装備可能", () => {
		expect(canEquipToSlot("holy_sword", "weapon")).toBe(true);
		expect(canEquipToSlot("holy_armor", "armor")).toBe(true);
		expect(canEquipToSlot("divine_ring", "accessory")).toBe(true);
	});
});
