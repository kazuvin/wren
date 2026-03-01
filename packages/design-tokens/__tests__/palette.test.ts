import { describe, expect, it } from "vitest";
import {
	type PaletteTokens,
	generateDarkPalette,
	lightPalette,
	lightPaletteCSS,
} from "../src/tokens/palette";

describe("lightPalette (HEX)", () => {
	it("26 個のトークンを持つ", () => {
		expect(Object.keys(lightPalette)).toHaveLength(26);
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
			"foreground",
			"card",
			"cardForeground",
			"popover",
			"popoverForeground",
			"primary",
			"primaryForeground",
			"secondary",
			"secondaryForeground",
			"muted",
			"mutedForeground",
			"accent",
			"accentForeground",
			"destructive",
			"destructiveForeground",
			"success",
			"successForeground",
			"warning",
			"warningForeground",
			"info",
			"infoForeground",
			"border",
			"input",
			"ring",
			"overlay",
		];
		for (const key of requiredKeys) {
			expect(lightPalette).toHaveProperty(key);
		}
	});

	it("primary は蛍石パープル (中明度)", () => {
		const hex = lightPalette.primary;
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		// L=0.55, C=0.16 の蛍石パープルは中明度で b > r > g
		expect(b).toBeGreaterThan(g);
		const avg = (r + g + b) / 3;
		expect(avg).toBeGreaterThan(60);
		expect(avg).toBeLessThan(180);
	});

	it("accent はピンク", () => {
		const hex = lightPalette.accent;
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		// H=350 のピンクは r が大きい
		expect(r).toBeGreaterThan(g);
	});

	it("ring は primary と同じ値", () => {
		expect(lightPalette.ring).toBe(lightPalette.primary);
	});

	it("overlay は rgba 形式", () => {
		expect(lightPalette.overlay).toMatch(/^rgba\(/);
	});

	it("旧トークンが存在しない", () => {
		const oldKeys = [
			"surface",
			"surfaceRaised",
			"text",
			"textMuted",
			"textOnPrimary",
			"primaryMuted",
			"accentMuted",
			"destructiveMuted",
			"successMuted",
			"warningMuted",
			"infoMuted",
			"borderMuted",
			"icon",
			"iconMuted",
		];
		for (const key of oldKeys) {
			expect(lightPalette).not.toHaveProperty(key);
		}
	});
});

describe("lightPaletteCSS (oklch)", () => {
	it("26 個のトークンを持つ", () => {
		expect(Object.keys(lightPaletteCSS)).toHaveLength(26);
	});

	it("すべての値が oklch() / rgba 形式", () => {
		for (const [key, value] of Object.entries(lightPaletteCSS)) {
			expect(
				value.startsWith("oklch(") || value.startsWith("rgba("),
				`${key}: ${value} は oklch() / rgba であるべき`,
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

	it("hex: 26 個のトークンを持つ", () => {
		expect(Object.keys(dark.hex)).toHaveLength(26);
	});

	it("css: 26 個のトークンを持つ", () => {
		expect(Object.keys(dark.css)).toHaveLength(26);
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

	it("hex: foreground は明るい色になる", () => {
		const r = Number.parseInt(dark.hex.foreground.slice(1, 3), 16);
		const g = Number.parseInt(dark.hex.foreground.slice(3, 5), 16);
		const b = Number.parseInt(dark.hex.foreground.slice(5, 7), 16);
		expect(r).toBeGreaterThan(200);
		expect(g).toBeGreaterThan(200);
		expect(b).toBeGreaterThan(200);
	});

	it("hex: overlay は alpha が大きくなる (0.4→0.7)", () => {
		expect(dark.hex.overlay).toMatch(/^rgba\(0,\s*0,\s*0,\s*0\.7\)$/);
	});

	it("hex: primary はダークモードで明るくなる", () => {
		const lightR = Number.parseInt(lightPalette.primary.slice(1, 3), 16);
		const darkR = Number.parseInt(dark.hex.primary.slice(1, 3), 16);
		expect(darkR).toBeGreaterThan(lightR);
	});

	it("hex: すべての値が # で始まるか rgba 形式", () => {
		for (const [key, value] of Object.entries(dark.hex)) {
			expect(
				value.startsWith("#") || value.startsWith("rgba("),
				`${key}: ${value} は HEX か rgba であるべき`,
			).toBe(true);
		}
	});

	it("css: すべての値が oklch() / rgba 形式", () => {
		for (const [key, value] of Object.entries(dark.css)) {
			expect(
				value.startsWith("oklch(") || value.startsWith("rgba("),
				`${key}: ${value} は oklch() / rgba であるべき`,
			).toBe(true);
		}
	});
});
