import { describe, expect, it } from "vitest";
import {
	colors,
	colorsCSS,
	fontSize,
	fontWeight,
	lineHeight,
	parseNumeric,
	radius,
	spacing,
} from "../src";
import { nestedTokensToCSSProperties, tokensToCSSProperties } from "../src/css";
import { generateThemeCSS } from "../src/tailwind";

describe("tokens", () => {
	it("colors に light/dark の両テーマが定義されている", () => {
		expect(Object.keys(colors.light)).toEqual(Object.keys(colors.dark));
	});

	it("colors.light/dark のキーが 26 個で一致する (26 semantic)", () => {
		expect(Object.keys(colors.light)).toHaveLength(26);
		expect(Object.keys(colors.dark)).toHaveLength(26);
	});

	it("colors の値はすべて文字列", () => {
		for (const value of Object.values(colors.light)) {
			expect(typeof value).toBe("string");
		}
		for (const value of Object.values(colors.dark)) {
			expect(typeof value).toBe("string");
		}
	});

	it("旧トークン名が存在しない", () => {
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
			expect(colors.light).not.toHaveProperty(key);
			expect(colors.dark).not.toHaveProperty(key);
		}
	});

	it("spacing の値はすべて px 単位", () => {
		for (const value of Object.values(spacing)) {
			expect(value).toMatch(/^\d+px$/);
		}
	});

	it("fontSize の値はすべて px 単位", () => {
		for (const value of Object.values(fontSize)) {
			expect(value).toMatch(/^\d+px$/);
		}
	});

	it("radius の値はすべて px 単位", () => {
		for (const value of Object.values(radius)) {
			expect(value).toMatch(/^\d+px$/);
		}
	});

	it("radius に 2xl トークンが定義されている", () => {
		expect(radius["2xl"]).toBe("20px");
	});

	it("lineHeight の値はすべて数値文字列", () => {
		for (const value of Object.values(lineHeight)) {
			expect(Number.parseFloat(value)).not.toBeNaN();
		}
	});

	it("fontWeight の値はすべて数値文字列", () => {
		for (const value of Object.values(fontWeight)) {
			expect(Number.parseInt(value, 10)).not.toBeNaN();
		}
	});
});

describe("colorsCSS", () => {
	it("light/dark の両テーマが定義されている", () => {
		expect(Object.keys(colorsCSS.light)).toEqual(Object.keys(colorsCSS.dark));
	});

	it("light/dark のキーが 26 個", () => {
		expect(Object.keys(colorsCSS.light)).toHaveLength(26);
		expect(Object.keys(colorsCSS.dark)).toHaveLength(26);
	});

	it("colorsCSS の値が oklch() / rgba 形式であること", () => {
		for (const scheme of ["light", "dark"] as const) {
			for (const [key, value] of Object.entries(colorsCSS[scheme])) {
				expect(
					value.startsWith("oklch(") || value.startsWith("rgba("),
					`colorsCSS.${scheme}.${key}: ${value} は oklch() / rgba であるべき`,
				).toBe(true);
			}
		}
	});
});

describe("parseNumeric", () => {
	it("px 値から数値を抽出する", () => {
		expect(parseNumeric("16px")).toBe(16);
	});

	it("小数値を抽出する", () => {
		expect(parseNumeric("1.5")).toBe(1.5);
	});

	it("0px を 0 として抽出する", () => {
		expect(parseNumeric("0px")).toBe(0);
	});

	it("パース不能な値でエラーを投げる", () => {
		expect(() => parseNumeric("abc")).toThrow('Cannot parse numeric value from "abc"');
	});
});

describe("tokensToCSSProperties", () => {
	it("フラットなトークンを CSS カスタムプロパティに変換する", () => {
		const result = tokensToCSSProperties({ sm: "4px", md: "8px" }, "radius");
		expect(result).toBe("\t--radius-sm: 4px;\n\t--radius-md: 8px;");
	});
});

describe("nestedTokensToCSSProperties", () => {
	it("ネストされたトークンをフラットな CSS カスタムプロパティに変換する", () => {
		const result = nestedTokensToCSSProperties({ light: { text: "#000", bg: "#fff" } }, "color");
		expect(result).toBe("\t--color-light-text: #000;\n\t--color-light-bg: #fff;");
	});
});

describe("generateThemeCSS", () => {
	it("@theme ブロックを含む CSS を生成する", () => {
		const css = generateThemeCSS();
		expect(css).toContain("@theme {");
		expect(css).toContain("--spacing-4: 16px;");
		expect(css).toContain("--font-size-base: 16px;");
		expect(css).toContain("--radius-md: 8px;");
		expect(css).toContain("--color-primary:");
	});

	it("ダークモードの @media ブロックを含む", () => {
		const css = generateThemeCSS();
		expect(css).toContain("@media (prefers-color-scheme: dark)");
		expect(css).toContain("--color-background:");
	});

	it("generateThemeCSS() が oklch() 形式で出力されること", () => {
		const css = generateThemeCSS();
		expect(css).toContain("oklch(");
	});

	it("テーマ CSS のカラーキーが kebab-case で出力される", () => {
		const css = generateThemeCSS();
		expect(css).toContain("--color-primary-foreground:");
		expect(css).toContain("--color-card-foreground:");
		expect(css).toContain("--color-muted-foreground:");
		expect(css).not.toContain("--color-primaryForeground:");
		expect(css).not.toContain("--color-cardForeground:");
	});
});
