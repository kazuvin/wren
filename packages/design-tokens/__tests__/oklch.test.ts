import { describe, expect, it } from "vitest";
import { type OKLCH, oklchToCSS, oklchToHex } from "../src/tokens/oklch";

describe("oklchToHex", () => {
	it("白 (l=1, c=0, h=0) → #ffffff", () => {
		expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe("#ffffff");
	});

	it("黒 (l=0, c=0, h=0) → #000000", () => {
		expect(oklchToHex({ l: 0, c: 0, h: 0 })).toBe("#000000");
	});

	it("蛍石パープルが紫系 HEX になること", () => {
		const hex = oklchToHex({ l: 0.55, c: 0.15, h: 290 });
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		expect(r).toBeGreaterThan(g);
		expect(b).toBeGreaterThan(g);
		expect(hex).toMatch(/^#[0-9a-f]{6}$/);
	});

	it("gamut 外の色がクランプされて有効な HEX を返すこと", () => {
		const hex = oklchToHex({ l: 0.5, c: 0.4, h: 150 });
		expect(hex).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe("oklchToCSS", () => {
	it("oklch() 形式の文字列を返す", () => {
		const css = oklchToCSS({ l: 0.96, c: 0.008, h: 290 });
		expect(css).toBe("oklch(0.96 0.008 290)");
	});

	it("l=0, c=0 の場合も正しい形式", () => {
		const css = oklchToCSS({ l: 0, c: 0, h: 0 });
		expect(css).toBe("oklch(0 0 0)");
	});
});
