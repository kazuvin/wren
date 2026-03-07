import { describe, expect, it } from "vitest";
import { calculateItemOffset, calculateTargetIndex } from "./drag-position";

const ITEM_STEP = 64;

describe("calculateTargetIndex", () => {
	it("移動量 0 なら元の index を返す", () => {
		expect(calculateTargetIndex(2, 0, ITEM_STEP, 5)).toBe(2);
	});

	it("1 アイテム分下にドラッグすると index + 1 を返す", () => {
		expect(calculateTargetIndex(0, ITEM_STEP, ITEM_STEP, 5)).toBe(1);
	});

	it("1 アイテム分上にドラッグすると index - 1 を返す", () => {
		expect(calculateTargetIndex(2, -ITEM_STEP, ITEM_STEP, 5)).toBe(1);
	});

	it("半分以上移動すると切り上げで次の index に移る", () => {
		expect(calculateTargetIndex(0, ITEM_STEP * 0.6, ITEM_STEP, 5)).toBe(1);
	});

	it("半分未満の移動では元の index のまま", () => {
		expect(calculateTargetIndex(0, ITEM_STEP * 0.4, ITEM_STEP, 5)).toBe(0);
	});

	it("上端 (0) より下にはクランプされる", () => {
		expect(calculateTargetIndex(0, -ITEM_STEP * 3, ITEM_STEP, 5)).toBe(0);
	});

	it("下端 (totalCount - 1) より上にはクランプされる", () => {
		expect(calculateTargetIndex(3, ITEM_STEP * 5, ITEM_STEP, 5)).toBe(4);
	});

	it("複数アイテム分の移動を正しく計算する", () => {
		expect(calculateTargetIndex(1, ITEM_STEP * 3, ITEM_STEP, 5)).toBe(4);
	});
});

describe("calculateItemOffset", () => {
	it("ドラッグ中のアイテム自身は offset 0", () => {
		expect(calculateItemOffset(2, 2, 3, ITEM_STEP)).toBe(0);
	});

	it("ドラッグ範囲外のアイテムは offset 0", () => {
		// originalIndex=1, currentIndex=3 → 範囲は 1..3
		// itemIndex=0 は範囲外
		expect(calculateItemOffset(0, 1, 3, ITEM_STEP)).toBe(0);
	});

	it("下方向ドラッグ: 範囲内のアイテムは -ITEM_STEP シフト", () => {
		// originalIndex=1, currentIndex=3 → index 2, 3 は上にずれる
		expect(calculateItemOffset(2, 1, 3, ITEM_STEP)).toBe(-ITEM_STEP);
		expect(calculateItemOffset(3, 1, 3, ITEM_STEP)).toBe(-ITEM_STEP);
	});

	it("上方向ドラッグ: 範囲内のアイテムは +ITEM_STEP シフト", () => {
		// originalIndex=3, currentIndex=1 → index 1, 2 は下にずれる
		expect(calculateItemOffset(1, 3, 1, ITEM_STEP)).toBe(ITEM_STEP);
		expect(calculateItemOffset(2, 3, 1, ITEM_STEP)).toBe(ITEM_STEP);
	});

	it("ドラッグが元の位置に戻ると全アイテムが offset 0", () => {
		expect(calculateItemOffset(0, 2, 2, ITEM_STEP)).toBe(0);
		expect(calculateItemOffset(1, 2, 2, ITEM_STEP)).toBe(0);
		expect(calculateItemOffset(3, 2, 2, ITEM_STEP)).toBe(0);
	});
});
