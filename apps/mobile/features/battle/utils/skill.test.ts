import { describe, expect, it } from "vitest";
import type { EquippedSkill, OwnedSkill } from "../types";
import {
	ALL_SKILLS,
	MAX_SKILL_SLOTS,
	addOrLevelUpSkill,
	canEquipSkill,
	equipSkill,
	getSkillDefinition,
	getSkillDefinitionMap,
	getSkillsByRarity,
	levelUpSkill,
	unequipSkill,
} from "./skill";

// =============================================================================
// ALL_SKILLS 定数
// =============================================================================
describe("ALL_SKILLS", () => {
	it("スキルが10個定義されている", () => {
		expect(ALL_SKILLS).toHaveLength(10);
	});

	it("全スキルが必須プロパティを持つ", () => {
		for (const skill of ALL_SKILLS) {
			expect(skill).toHaveProperty("id");
			expect(skill).toHaveProperty("name");
			expect(skill).toHaveProperty("emoji");
			expect(skill).toHaveProperty("description");
			expect(skill).toHaveProperty("baseDamageMultiplier");
			expect(skill).toHaveProperty("baseCooldown");
			expect(skill).toHaveProperty("rarity");
			expect(skill).toHaveProperty("category");
		}
	});

	it("全スキルのIDがユニークである", () => {
		const ids = ALL_SKILLS.map((s) => s.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("ファイアの定義が正しい", () => {
		const fire = ALL_SKILLS.find((s) => s.id === "fire");
		expect(fire).toEqual({
			id: "fire",
			name: "ファイア",
			emoji: "\u{1F525}",
			description: "炎の魔法で攻撃",
			baseDamageMultiplier: 1.8,
			baseCooldown: 5,
			rarity: "common",
			category: "attack",
		});
	});

	it("神の一撃の定義が正しい", () => {
		const divine = ALL_SKILLS.find((s) => s.id === "divine");
		expect(divine).toEqual({
			id: "divine",
			name: "神の一撃",
			emoji: "\u2728",
			description: "超高倍率の一撃",
			baseDamageMultiplier: 5.0,
			baseCooldown: 25,
			rarity: "legendary",
			category: "attack",
		});
	});
});

// =============================================================================
// MAX_SKILL_SLOTS 定数
// =============================================================================
describe("MAX_SKILL_SLOTS", () => {
	it("最大スロット数は5", () => {
		expect(MAX_SKILL_SLOTS).toBe(5);
	});
});

// =============================================================================
// getSkillDefinition
// =============================================================================
describe("getSkillDefinition", () => {
	it("存在するスキルIDで定義を取得できる", () => {
		const result = getSkillDefinition("fire");
		expect(result).toBeDefined();
		expect(result?.id).toBe("fire");
		expect(result?.name).toBe("ファイア");
	});

	it("存在しないスキルIDではundefinedを返す", () => {
		const result = getSkillDefinition("nonexistent");
		expect(result).toBeUndefined();
	});

	it("全てのスキルIDで取得できる", () => {
		const ids = [
			"fire",
			"frost",
			"thunder",
			"heal",
			"poison",
			"berserk",
			"precision",
			"drain",
			"divine",
			"shield",
		];
		for (const id of ids) {
			expect(getSkillDefinition(id)).toBeDefined();
		}
	});
});

// =============================================================================
// getSkillDefinitionMap
// =============================================================================
describe("getSkillDefinitionMap", () => {
	it("Mapを返す", () => {
		const map = getSkillDefinitionMap();
		expect(map).toBeInstanceOf(Map);
	});

	it("全スキル分のエントリがある", () => {
		const map = getSkillDefinitionMap();
		expect(map.size).toBe(10);
	});

	it("Mapからスキルを取得できる", () => {
		const map = getSkillDefinitionMap();
		const thunder = map.get("thunder");
		expect(thunder).toBeDefined();
		expect(thunder?.name).toBe("サンダー");
		expect(thunder?.baseDamageMultiplier).toBe(2.5);
	});

	it("存在しないキーではundefinedを返す", () => {
		const map = getSkillDefinitionMap();
		expect(map.get("nonexistent")).toBeUndefined();
	});
});

// =============================================================================
// getSkillsByRarity
// =============================================================================
describe("getSkillsByRarity", () => {
	it("commonのスキルを取得できる", () => {
		const common = getSkillsByRarity("common");
		expect(common.length).toBeGreaterThan(0);
		for (const skill of common) {
			expect(skill.rarity).toBe("common");
		}
	});

	it("commonスキルはfire, shieldの2つ", () => {
		const common = getSkillsByRarity("common");
		expect(common).toHaveLength(2);
		const ids = common.map((s) => s.id);
		expect(ids).toContain("fire");
		expect(ids).toContain("shield");
	});

	it("rareスキルはfrost, heal, poison, precisionの4つ", () => {
		const rare = getSkillsByRarity("rare");
		expect(rare).toHaveLength(4);
		const ids = rare.map((s) => s.id);
		expect(ids).toContain("frost");
		expect(ids).toContain("heal");
		expect(ids).toContain("poison");
		expect(ids).toContain("precision");
	});

	it("epicスキルはthunder, berserk, drainの3つ", () => {
		const epic = getSkillsByRarity("epic");
		expect(epic).toHaveLength(3);
		const ids = epic.map((s) => s.id);
		expect(ids).toContain("thunder");
		expect(ids).toContain("berserk");
		expect(ids).toContain("drain");
	});

	it("legendaryスキルはdivineの1つ", () => {
		const legendary = getSkillsByRarity("legendary");
		expect(legendary).toHaveLength(1);
		expect(legendary[0].id).toBe("divine");
	});
});

// =============================================================================
// levelUpSkill
// =============================================================================
describe("levelUpSkill", () => {
	it("レベルが1上がる", () => {
		const owned: OwnedSkill = { skillId: "fire", level: 1 };
		const result = levelUpSkill(owned);
		expect(result.level).toBe(2);
	});

	it("元のオブジェクトは変更されない（イミュータブル）", () => {
		const owned: OwnedSkill = { skillId: "fire", level: 3 };
		const result = levelUpSkill(owned);
		expect(owned.level).toBe(3);
		expect(result.level).toBe(4);
	});

	it("skillIdは変わらない", () => {
		const owned: OwnedSkill = { skillId: "thunder", level: 5 };
		const result = levelUpSkill(owned);
		expect(result.skillId).toBe("thunder");
	});
});

// =============================================================================
// addOrLevelUpSkill
// =============================================================================
describe("addOrLevelUpSkill", () => {
	it("所持していないスキルをレベル1で追加する", () => {
		const ownedSkills: OwnedSkill[] = [];
		const result = addOrLevelUpSkill(ownedSkills, "fire");
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({ skillId: "fire", level: 1 });
	});

	it("既に所持しているスキルのレベルを上げる", () => {
		const ownedSkills: OwnedSkill[] = [{ skillId: "fire", level: 2 }];
		const result = addOrLevelUpSkill(ownedSkills, "fire");
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({ skillId: "fire", level: 3 });
	});

	it("他のスキルに影響を与えない", () => {
		const ownedSkills: OwnedSkill[] = [
			{ skillId: "fire", level: 1 },
			{ skillId: "frost", level: 2 },
		];
		const result = addOrLevelUpSkill(ownedSkills, "fire");
		expect(result).toHaveLength(2);
		expect(result.find((s) => s.skillId === "fire")?.level).toBe(2);
		expect(result.find((s) => s.skillId === "frost")?.level).toBe(2);
	});

	it("元の配列は変更されない（イミュータブル）", () => {
		const ownedSkills: OwnedSkill[] = [{ skillId: "fire", level: 1 }];
		const result = addOrLevelUpSkill(ownedSkills, "fire");
		expect(ownedSkills[0].level).toBe(1);
		expect(result[0].level).toBe(2);
		expect(result).not.toBe(ownedSkills);
	});

	it("新規スキルを追加しても元の配列は変更されない", () => {
		const ownedSkills: OwnedSkill[] = [{ skillId: "fire", level: 1 }];
		const result = addOrLevelUpSkill(ownedSkills, "thunder");
		expect(ownedSkills).toHaveLength(1);
		expect(result).toHaveLength(2);
	});
});

// =============================================================================
// canEquipSkill
// =============================================================================
describe("canEquipSkill", () => {
	it("空のスロットに装備可能", () => {
		const equipped: EquippedSkill[] = [];
		expect(canEquipSkill(equipped, 5)).toBe(true);
	});

	it("スロットが上限未満なら装備可能", () => {
		const equipped: EquippedSkill[] = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "frost", currentCooldown: 0 },
		];
		expect(canEquipSkill(equipped, 5)).toBe(true);
	});

	it("スロットが上限に達していたら装備不可", () => {
		const equipped: EquippedSkill[] = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "frost", currentCooldown: 0 },
			{ skillId: "thunder", currentCooldown: 0 },
			{ skillId: "heal", currentCooldown: 0 },
			{ skillId: "poison", currentCooldown: 0 },
		];
		expect(canEquipSkill(equipped, 5)).toBe(false);
	});

	it("maxSlotsを変更してもチェックが正しい", () => {
		const equipped: EquippedSkill[] = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "frost", currentCooldown: 0 },
		];
		expect(canEquipSkill(equipped, 3)).toBe(true);
		expect(canEquipSkill(equipped, 2)).toBe(false);
	});
});

// =============================================================================
// equipSkill
// =============================================================================
describe("equipSkill", () => {
	it("スキルを装備できる", () => {
		const equipped: EquippedSkill[] = [];
		const result = equipSkill(equipped, "fire", 12);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({ skillId: "fire", currentCooldown: 0 });
	});

	it("装備時のcurrentCooldownは0", () => {
		const result = equipSkill([], "thunder", 20);
		expect(result[0].currentCooldown).toBe(0);
	});

	it("既存の装備に追加される", () => {
		const equipped: EquippedSkill[] = [{ skillId: "fire", currentCooldown: 5 }];
		const result = equipSkill(equipped, "frost", 15);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ skillId: "fire", currentCooldown: 5 });
		expect(result[1]).toEqual({ skillId: "frost", currentCooldown: 0 });
	});

	it("5スロット上限に達している場合は追加されない", () => {
		const equipped: EquippedSkill[] = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "frost", currentCooldown: 0 },
			{ skillId: "thunder", currentCooldown: 0 },
			{ skillId: "heal", currentCooldown: 0 },
			{ skillId: "poison", currentCooldown: 0 },
		];
		const result = equipSkill(equipped, "berserk", 30);
		expect(result).toHaveLength(5);
		expect(result.find((s) => s.skillId === "berserk")).toBeUndefined();
	});

	it("元の配列は変更されない（イミュータブル）", () => {
		const equipped: EquippedSkill[] = [{ skillId: "fire", currentCooldown: 0 }];
		const result = equipSkill(equipped, "frost", 15);
		expect(equipped).toHaveLength(1);
		expect(result).toHaveLength(2);
		expect(result).not.toBe(equipped);
	});
});

// =============================================================================
// unequipSkill
// =============================================================================
describe("unequipSkill", () => {
	it("指定したスキルを装備から外せる", () => {
		const equipped: EquippedSkill[] = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "frost", currentCooldown: 5 },
		];
		const result = unequipSkill(equipped, "fire");
		expect(result).toHaveLength(1);
		expect(result[0].skillId).toBe("frost");
	});

	it("存在しないスキルIDの場合は変化なし", () => {
		const equipped: EquippedSkill[] = [{ skillId: "fire", currentCooldown: 0 }];
		const result = unequipSkill(equipped, "nonexistent");
		expect(result).toHaveLength(1);
		expect(result[0].skillId).toBe("fire");
	});

	it("全てのスキルを外せる", () => {
		const equipped: EquippedSkill[] = [{ skillId: "fire", currentCooldown: 0 }];
		const result = unequipSkill(equipped, "fire");
		expect(result).toHaveLength(0);
	});

	it("元の配列は変更されない（イミュータブル）", () => {
		const equipped: EquippedSkill[] = [
			{ skillId: "fire", currentCooldown: 0 },
			{ skillId: "frost", currentCooldown: 0 },
		];
		const result = unequipSkill(equipped, "fire");
		expect(equipped).toHaveLength(2);
		expect(result).toHaveLength(1);
		expect(result).not.toBe(equipped);
	});
});
