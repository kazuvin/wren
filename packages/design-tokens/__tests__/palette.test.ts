import { describe, expect, it } from "vitest";
import {
	type PaletteTokens,
	generateDarkPalette,
	lightPalette,
	lightPaletteCSS,
} from "../src/tokens/palette";

describe("lightPalette (HEX)", () => {
	it("25 個のトークンを持つ", () => {
		expect(Object.keys(lightPalette)).toHaveLength(25);
	});

	it("すべての値が # で始まるか rgba 形式", () => {
		for (const [key, value] of Object.entries(lightPalette)) {
			expect(
				value.startsWith("#") || value.startsWith("rgba("),
				`${key}: ${value} は HEX か rgba であるべき`,
			).toBe(true);
		}
	});

	it("必須トークンがすべて存在する", () => {
		const requiredKeys: (keyof PaletteTokens)[] = [
			"background",
			"surface",
			"surfaceRaised",
			"text",
			"textMuted",
			"textOnPrimary",
			"primary",
			"primaryMuted",
			"accent",
			"accentMuted",
			"destructive",
			"destructiveMuted",
			"success",
			"successMuted",
			"warning",
			"warningMuted",
			"info",
			"infoMuted",
			"border",
			"borderMuted",
			"icon",
			"iconMuted",
			"overlay",
		];
		for (const key of requiredKeys) {
			expect(lightPalette).toHaveProperty(key);
		}
	});

	it("primary はニアブラック", () => {
		const r = Number.parseInt(lightPalette.primary.slice(1, 3), 16);
		const g = Number.parseInt(lightPalette.primary.slice(3, 5), 16);
		const b = Number.parseInt(lightPalette.primary.slice(5, 7), 16);
		const avg = (r + g + b) / 3;
		expect(avg).toBeLessThan(60);
	});

	it("accent はパステルパープル", () => {
		const hex = lightPalette.accent;
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		expect(r).toBeGreaterThan(g);
		expect(b).toBeGreaterThan(g);
	});

	it("textOnPrimary は白固定", () => {
		expect(lightPalette.textOnPrimary).toBe("#FFFFFF");
	});

	it("overlay は rgba 形式", () => {
		expect(lightPalette.overlay).toMatch(/^rgba\(/);
	});
});

describe("lightPaletteCSS (oklch)", () => {
	it("25 個のトークンを持つ", () => {
		expect(Object.keys(lightPaletteCSS)).toHaveLength(25);
	});

	it("すべての値が oklch() / rgba / #FFFFFF 形式", () => {
		for (const [key, value] of Object.entries(lightPaletteCSS)) {
			expect(
				value.startsWith("oklch(") || value.startsWith("rgba(") || value === "#FFFFFF",
				`${key}: ${value} は oklch() / rgba / #FFFFFF であるべき`,
			).toBe(true);
		}
	});
});

describe("generateDarkPalette", () => {
	const dark = generateDarkPalette();

	it("hex と css の両方を返す", () => {
		expect(dark).toHaveProperty("hex");
		expect(dark).toHaveProperty("css");
	});

	it("hex: 25 個のトークンを持つ", () => {
		expect(Object.keys(dark.hex)).toHaveLength(25);
	});

	it("css: 25 個のトークンを持つ", () => {
		expect(Object.keys(dark.css)).toHaveLength(25);
	});

	it("hex: Light と同じキーを持つ", () => {
		expect(Object.keys(dark.hex).sort()).toEqual(Object.keys(lightPalette).sort());
	});

	it("hex: background は暗い色になる", () => {
		const r = Number.parseInt(dark.hex.background.slice(1, 3), 16);
		const g = Number.parseInt(dark.hex.background.slice(3, 5), 16);
		const b = Number.parseInt(dark.hex.background.slice(5, 7), 16);
		expect(r).toBeLessThan(50);
		expect(g).toBeLessThan(50);
		expect(b).toBeLessThan(50);
	});

	it("hex: text は明るい色になる", () => {
		const r = Number.parseInt(dark.hex.text.slice(1, 3), 16);
		const g = Number.parseInt(dark.hex.text.slice(3, 5), 16);
		const b = Number.parseInt(dark.hex.text.slice(5, 7), 16);
		expect(r).toBeGreaterThan(200);
		expect(g).toBeGreaterThan(200);
		expect(b).toBeGreaterThan(200);
	});

	it("hex: textOnPrimary は白のまま固定", () => {
		expect(dark.hex.textOnPrimary).toBe("#FFFFFF");
	});

	it("hex: overlay は alpha が大きくなる (0.4→0.7)", () => {
		expect(dark.hex.overlay).toMatch(/^rgba\(0,\s*0,\s*0,\s*0\.7\)$/);
	});

	it("hex: primary は明るい色になる", () => {
		const r = Number.parseInt(dark.hex.primary.slice(1, 3), 16);
		const g = Number.parseInt(dark.hex.primary.slice(3, 5), 16);
		const b = Number.parseInt(dark.hex.primary.slice(5, 7), 16);
		expect(r).toBeGreaterThan(180);
		expect(g).toBeGreaterThan(180);
		expect(b).toBeGreaterThan(180);
	});

	it("hex: すべての値が # で始まるか rgba 形式", () => {
		for (const [key, value] of Object.entries(dark.hex)) {
			expect(
				value.startsWith("#") || value.startsWith("rgba("),
				`${key}: ${value} は HEX か rgba であるべき`,
			).toBe(true);
		}
	});

	it("css: すべての値が oklch() / rgba / #FFFFFF 形式", () => {
		for (const [key, value] of Object.entries(dark.css)) {
			expect(
				value.startsWith("oklch(") || value.startsWith("rgba(") || value === "#FFFFFF",
				`${key}: ${value} は oklch() / rgba / #FFFFFF であるべき`,
			).toBe(true);
		}
	});
});
