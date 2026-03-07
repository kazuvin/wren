import { describe, expect, it } from "vitest";
import { getEquipmentByRarity } from "./equipment";
import {
	BOSS_RARITY_PROBABILITIES,
	RARITY_PROBABILITIES,
	generateBossReward,
	generateReward,
	generateStatBoost,
	getRarityColor,
	getRarityLabel,
	rollRarity,
} from "./gacha";
import { getSkillsByRarity } from "./skill";

// =============================================================================
// RARITY_PROBABILITIES 定数
// =============================================================================
describe("RARITY_PROBABILITIES", () => {
	it("通常ガチャの確率テーブルが正しい", () => {
		expect(RARITY_PROBABILITIES).toEqual({
			common: 0.6,
			rare: 0.25,
			epic: 0.12,
			legendary: 0.03,
		});
	});

	it("確率の合計が1.0になる", () => {
		const total =
			RARITY_PROBABILITIES.common +
			RARITY_PROBABILITIES.rare +
			RARITY_PROBABILITIES.epic +
			RARITY_PROBABILITIES.legendary;
		expect(total).toBeCloseTo(1.0);
	});
});

// =============================================================================
// BOSS_RARITY_PROBABILITIES 定数
// =============================================================================
describe("BOSS_RARITY_PROBABILITIES", () => {
	it("ボスガチャの確率テーブルが正しい", () => {
		expect(BOSS_RARITY_PROBABILITIES).toEqual({
			rare: 0.5,
			epic: 0.35,
			legendary: 0.15,
		});
	});

	it("確率の合計が1.0になる", () => {
		const total =
			BOSS_RARITY_PROBABILITIES.rare +
			BOSS_RARITY_PROBABILITIES.epic +
			BOSS_RARITY_PROBABILITIES.legendary;
		expect(total).toBeCloseTo(1.0);
	});
});

// =============================================================================
// rollRarity
// =============================================================================
describe("rollRarity", () => {
	it("0.0でcommonを返す", () => {
		expect(rollRarity(() => 0.0)).toBe("common");
	});

	it("0.59でcommonを返す（60%の境界内）", () => {
		expect(rollRarity(() => 0.59)).toBe("common");
	});

	it("0.60でrareを返す（commonの境界を超えた直後）", () => {
		expect(rollRarity(() => 0.6)).toBe("rare");
	});

	it("0.84でrareを返す（rare境界内）", () => {
		expect(rollRarity(() => 0.84)).toBe("rare");
	});

	it("0.85でepicを返す（rare境界を超えた直後）", () => {
		expect(rollRarity(() => 0.85)).toBe("epic");
	});

	it("0.96でepicを返す（epic境界内）", () => {
		expect(rollRarity(() => 0.96)).toBe("epic");
	});

	it("0.97でlegendaryを返す（epic境界を超えた直後）", () => {
		expect(rollRarity(() => 0.97)).toBe("legendary");
	});

	it("0.99でlegendaryを返す", () => {
		expect(rollRarity(() => 0.99)).toBe("legendary");
	});

	it("random引数なしで呼び出してもエラーにならない", () => {
		const result = rollRarity();
		expect(["common", "rare", "epic", "legendary"]).toContain(result);
	});
});

// =============================================================================
// generateStatBoost
// =============================================================================
describe("generateStatBoost", () => {
	describe("common レアリティ", () => {
		it("type が stat_boost である", () => {
			const result = generateStatBoost("common", () => 0.0);
			expect(result.type).toBe("stat_boost");
		});

		it("rarity が common である", () => {
			const result = generateStatBoost("common", () => 0.0);
			expect(result.rarity).toBe("common");
		});

		it("stat が atk/def/spd/luk のいずれかである", () => {
			const result = generateStatBoost("common", () => 0.0);
			expect(["atk", "def", "spd", "luk"]).toContain(result.stat);
		});

		it("random=0.0 で atk を選択する（4つのうち最初）", () => {
			const result = generateStatBoost("common", () => 0.0);
			expect(result.stat).toBe("atk");
		});

		it("random=0.25 で def を選択する", () => {
			const result = generateStatBoost("common", () => 0.25);
			expect(result.stat).toBe("def");
		});

		it("random=0.5 で spd を選択する", () => {
			const result = generateStatBoost("common", () => 0.5);
			expect(result.stat).toBe("spd");
		});

		it("random=0.75 で luk を選択する", () => {
			const result = generateStatBoost("common", () => 0.75);
			expect(result.stat).toBe("luk");
		});

		it("amount が 1~3 の範囲内である", () => {
			// random=0.0 -> 最小値
			const min = generateStatBoost("common", () => 0.0);
			expect(min.amount).toBe(1);

			// random=0.99 -> 最大値
			const max = generateStatBoost("common", () => 0.99);
			expect(max.amount).toBe(3);
		});
	});

	describe("rare レアリティ", () => {
		it("amount が 5~10 の範囲内である", () => {
			const min = generateStatBoost("rare", () => 0.0);
			expect(min.amount).toBe(5);

			const max = generateStatBoost("rare", () => 0.99);
			expect(max.amount).toBe(10);
		});

		it("rarity が rare である", () => {
			const result = generateStatBoost("rare", () => 0.0);
			expect(result.rarity).toBe("rare");
		});
	});

	describe("epic レアリティ", () => {
		it("amount が 10~15 の範囲内である", () => {
			const min = generateStatBoost("epic", () => 0.0);
			expect(min.amount).toBe(10);

			const max = generateStatBoost("epic", () => 0.99);
			expect(max.amount).toBe(15);
		});

		it("rarity が epic である", () => {
			const result = generateStatBoost("epic", () => 0.0);
			expect(result.rarity).toBe("epic");
		});
	});

	it("random引数なしで呼び出してもエラーにならない", () => {
		const result = generateStatBoost("common");
		expect(result.type).toBe("stat_boost");
		expect(result.amount).toBeGreaterThanOrEqual(1);
		expect(result.amount).toBeLessThanOrEqual(3);
	});
});

// =============================================================================
// generateReward
// =============================================================================
describe("generateReward", () => {
	describe("common レアリティの報酬", () => {
		it("common では必ず stat_boost が返る", () => {
			// random=0.0 -> rarity=common, 以降もすべて0.0
			const result = generateReward(() => 0.0);
			expect(result.type).toBe("stat_boost");
			expect(result.rarity).toBe("common");
		});
	});

	describe("rare レアリティの報酬", () => {
		it("rare + sub=0.0 で stat_boost が返る（40%範囲内）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				// 1回目: rarity判定 -> 0.6 = rare
				if (callCount === 1) return 0.6;
				// 2回目以降: サブ判定 + stat生成 -> 0.0
				return 0.0;
			});
			expect(result.type).toBe("stat_boost");
			expect(result.rarity).toBe("rare");
		});

		it("rare + sub=0.4 で skill が返る（40%~70%範囲 = skill 30%）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.6; // rare
				if (callCount === 2) return 0.4; // sub -> skill
				return 0.0; // skill selection
			});
			expect(result.type).toBe("skill");
			expect(result.rarity).toBe("rare");
		});

		it("rare + sub=0.7 で equipment が返る（70%~100%範囲 = equipment 30%）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.6; // rare
				if (callCount === 2) return 0.7; // sub -> equipment
				return 0.0; // equipment selection
			});
			expect(result.type).toBe("equipment");
			expect(result.rarity).toBe("rare");
		});

		it("rare skill が実在するスキルIDを返す", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.6; // rare
				if (callCount === 2) return 0.4; // sub -> skill
				return 0.0; // first rare skill
			});
			if (result.type === "skill") {
				const rareSkills = getSkillsByRarity("rare");
				const rareSkillIds = rareSkills.map((s) => s.id);
				expect(rareSkillIds).toContain(result.skillId);
			}
		});

		it("rare equipment が実在する装備IDを返す", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.6; // rare
				if (callCount === 2) return 0.7; // sub -> equipment
				return 0.0; // first rare equipment
			});
			if (result.type === "equipment") {
				const rareEquipment = getEquipmentByRarity("rare");
				const rareEquipmentIds = rareEquipment.map((e) => e.id);
				expect(rareEquipmentIds).toContain(result.equipmentId);
			}
		});
	});

	describe("epic レアリティの報酬", () => {
		it("epic + sub=0.0 で stat_boost が返る（20%範囲内）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.85; // epic
				if (callCount === 2) return 0.0; // sub -> stat_boost
				return 0.0;
			});
			expect(result.type).toBe("stat_boost");
			expect(result.rarity).toBe("epic");
		});

		it("epic + sub=0.2 で skill が返る（20%~60%範囲 = skill 40%）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.85; // epic
				if (callCount === 2) return 0.2; // sub -> skill
				return 0.0;
			});
			expect(result.type).toBe("skill");
			expect(result.rarity).toBe("epic");
		});

		it("epic + sub=0.6 で equipment が返る（60%~100%範囲 = equipment 40%）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.85; // epic
				if (callCount === 2) return 0.6; // sub -> equipment
				return 0.0;
			});
			expect(result.type).toBe("equipment");
			expect(result.rarity).toBe("epic");
		});
	});

	describe("legendary レアリティの報酬", () => {
		it("legendary + sub=0.0 で skill が返る（50%範囲内）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.97; // legendary
				if (callCount === 2) return 0.0; // sub -> skill
				return 0.0;
			});
			expect(result.type).toBe("skill");
			expect(result.rarity).toBe("legendary");
		});

		it("legendary + sub=0.5 で equipment が返る（50%~100%範囲 = equipment 50%）", () => {
			let callCount = 0;
			const result = generateReward(() => {
				callCount++;
				if (callCount === 1) return 0.97; // legendary
				if (callCount === 2) return 0.5; // sub -> equipment
				return 0.0;
			});
			expect(result.type).toBe("equipment");
			expect(result.rarity).toBe("legendary");
		});

		it("legendary では stat_boost は出ない", () => {
			// sub の全範囲でスキルか装備のみ
			for (let subVal = 0; subVal < 1.0; subVal += 0.1) {
				let callCount = 0;
				const sv = subVal;
				const result = generateReward(() => {
					callCount++;
					if (callCount === 1) return 0.97; // legendary
					if (callCount === 2) return sv; // sub
					return 0.0;
				});
				expect(result.type).not.toBe("stat_boost");
			}
		});
	});

	it("random引数なしで呼び出してもエラーにならない", () => {
		const result = generateReward();
		expect(["stat_boost", "skill", "equipment"]).toContain(result.type);
		expect(["common", "rare", "epic", "legendary"]).toContain(result.rarity);
	});
});

// =============================================================================
// generateBossReward
// =============================================================================
describe("generateBossReward", () => {
	it("common は出ない（レア以上保証）", () => {
		// random=0.0 -> rare (ボス確率テーブル)
		const result = generateBossReward(() => 0.0);
		expect(result.rarity).not.toBe("common");
	});

	it("random=0.0 で rare を返す", () => {
		const result = generateBossReward(() => 0.0);
		expect(result.rarity).toBe("rare");
	});

	it("random=0.49 で rare を返す（50%境界内）", () => {
		let callCount = 0;
		const result = generateBossReward(() => {
			callCount++;
			if (callCount === 1) return 0.49;
			return 0.0;
		});
		expect(result.rarity).toBe("rare");
	});

	it("random=0.5 で epic を返す（rare境界を超えた直後）", () => {
		let callCount = 0;
		const result = generateBossReward(() => {
			callCount++;
			if (callCount === 1) return 0.5;
			return 0.0;
		});
		expect(result.rarity).toBe("epic");
	});

	it("random=0.84 で epic を返す（epic境界内）", () => {
		let callCount = 0;
		const result = generateBossReward(() => {
			callCount++;
			if (callCount === 1) return 0.84;
			return 0.0;
		});
		expect(result.rarity).toBe("epic");
	});

	it("random=0.85 で legendary を返す（epic境界を超えた直後）", () => {
		let callCount = 0;
		const result = generateBossReward(() => {
			callCount++;
			if (callCount === 1) return 0.85;
			return 0.0;
		});
		expect(result.rarity).toBe("legendary");
	});

	it("random=0.99 で legendary を返す", () => {
		let callCount = 0;
		const result = generateBossReward(() => {
			callCount++;
			if (callCount === 1) return 0.99;
			return 0.0;
		});
		expect(result.rarity).toBe("legendary");
	});

	it("ボス報酬で返される報酬型は正しい", () => {
		const result = generateBossReward(() => 0.0);
		expect(["stat_boost", "skill", "equipment"]).toContain(result.type);
	});

	it("random引数なしで呼び出してもエラーにならない", () => {
		const result = generateBossReward();
		expect(["rare", "epic", "legendary"]).toContain(result.rarity);
	});
});

// =============================================================================
// getRarityColor
// =============================================================================
describe("getRarityColor", () => {
	it("common はグレー (#9CA3AF) を返す", () => {
		expect(getRarityColor("common")).toBe("#9CA3AF");
	});

	it("rare はブルー (#3B82F6) を返す", () => {
		expect(getRarityColor("rare")).toBe("#3B82F6");
	});

	it("epic はパープル (#A855F7) を返す", () => {
		expect(getRarityColor("epic")).toBe("#A855F7");
	});

	it("legendary はゴールド (#F59E0B) を返す", () => {
		expect(getRarityColor("legendary")).toBe("#F59E0B");
	});
});

// =============================================================================
// getRarityLabel
// =============================================================================
describe("getRarityLabel", () => {
	it("common は 'コモン' を返す", () => {
		expect(getRarityLabel("common")).toBe("コモン");
	});

	it("rare は 'レア' を返す", () => {
		expect(getRarityLabel("rare")).toBe("レア");
	});

	it("epic は 'エピック' を返す", () => {
		expect(getRarityLabel("epic")).toBe("エピック");
	});

	it("legendary は 'レジェンダリー' を返す", () => {
		expect(getRarityLabel("legendary")).toBe("レジェンダリー");
	});
});
