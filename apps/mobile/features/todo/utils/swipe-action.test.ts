import { describe, expect, it } from "vitest";
import { SWIPE_THRESHOLD, type SwipeAction, determineSwipeAction } from "./swipe-action";

describe("swipe-action", () => {
	describe("SWIPE_THRESHOLD", () => {
		it("閾値は 80px", () => {
			expect(SWIPE_THRESHOLD).toBe(80);
		});
	});

	describe("determineSwipeAction", () => {
		it("右スワイプが閾値を超えると complete を返す", () => {
			expect(determineSwipeAction(81)).toBe("complete");
			expect(determineSwipeAction(100)).toBe("complete");
		});

		it("左スワイプが閾値を超えると delete を返す", () => {
			expect(determineSwipeAction(-81)).toBe("delete");
			expect(determineSwipeAction(-100)).toBe("delete");
		});

		it("閾値ちょうどでは null を返す", () => {
			expect(determineSwipeAction(80)).toBeNull();
			expect(determineSwipeAction(-80)).toBeNull();
		});

		it("閾値未満では null を返す", () => {
			expect(determineSwipeAction(0)).toBeNull();
			expect(determineSwipeAction(50)).toBeNull();
			expect(determineSwipeAction(-50)).toBeNull();
		});

		it("カスタム閾値を指定できる", () => {
			expect(determineSwipeAction(41, 40)).toBe("complete");
			expect(determineSwipeAction(-41, 40)).toBe("delete");
			expect(determineSwipeAction(40, 40)).toBeNull();
		});
	});
});
