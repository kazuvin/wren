import { describe, expect, it } from "vitest";
import { type CharacterLevel, getCharacterLevel, getCharacterScale } from "./character-level";

describe("character-level", () => {
	describe("getCharacterLevel", () => {
		it("完了 0 件でレベル 1", () => {
			expect(getCharacterLevel(0)).toEqual<CharacterLevel>({
				level: 1,
				name: "たまご",
				requiredForNext: 3,
			});
		});

		it("完了 3 件でレベル 2", () => {
			expect(getCharacterLevel(3)).toEqual<CharacterLevel>({
				level: 2,
				name: "こども",
				requiredForNext: 7,
			});
		});

		it("完了 7 件でレベル 3", () => {
			expect(getCharacterLevel(7)).toEqual<CharacterLevel>({
				level: 3,
				name: "おとな",
				requiredForNext: 15,
			});
		});

		it("完了 15 件でレベル 4（最大）", () => {
			expect(getCharacterLevel(15)).toEqual<CharacterLevel>({
				level: 4,
				name: "マスター",
				requiredForNext: null,
			});
		});

		it("完了 100 件でもレベル 4", () => {
			expect(getCharacterLevel(100).level).toBe(4);
		});
	});

	describe("getCharacterScale", () => {
		it("レベル 1 は 0.6 倍", () => {
			expect(getCharacterScale(0)).toBe(0.6);
		});

		it("レベル 2 は 0.8 倍", () => {
			expect(getCharacterScale(3)).toBe(0.8);
		});

		it("レベル 3 は 1.0 倍", () => {
			expect(getCharacterScale(7)).toBe(1.0);
		});

		it("レベル 4 は 1.2 倍", () => {
			expect(getCharacterScale(15)).toBe(1.2);
		});
	});
});
