import { type OKLCH, oklchToCSS, oklchToHex } from "./oklch";

export type PaletteTokens = {
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
	popover: string;
	popoverForeground: string;
	primary: string;
	primaryForeground: string;
	secondary: string;
	secondaryForeground: string;
	muted: string;
	mutedForeground: string;
	accent: string;
	accentForeground: string;
	destructive: string;
	destructiveForeground: string;
	success: string;
	successForeground: string;
	warning: string;
	warningForeground: string;
	info: string;
	infoForeground: string;
	border: string;
	input: string;
	ring: string;
	overlay: string;
};

// ソースオブトゥルース: oklch(L, C, H)
// セマンティックカラーは L=0.55, C=0.16 で統一、foreground は L=0.97, C=0.01
const lightOKLCH: Record<keyof PaletteTokens, OKLCH | null> = {
	// Base
	background: { l: 0.97, c: 0.003, h: 300 },
	foreground: { l: 0.25, c: 0.01, h: 300 },
	card: { l: 1.0, c: 0, h: 0 },
	cardForeground: { l: 0.25, c: 0.01, h: 300 },
	popover: { l: 1.0, c: 0, h: 0 },
	popoverForeground: { l: 0.25, c: 0.01, h: 300 },
	// Primary (蛍石パープル)
	primary: { l: 0.55, c: 0.16, h: 302 },
	primaryForeground: { l: 0.97, c: 0.01, h: 302 },
	// Secondary
	secondary: { l: 0.93, c: 0.005, h: 300 },
	secondaryForeground: { l: 0.35, c: 0.015, h: 300 },
	// Muted
	muted: { l: 0.94, c: 0.005, h: 300 },
	mutedForeground: { l: 0.55, c: 0.02, h: 300 },
	// Accent (ピンク)
	accent: { l: 0.55, c: 0.16, h: 350 },
	accentForeground: { l: 0.97, c: 0.01, h: 350 },
	// Destructive (赤)
	destructive: { l: 0.55, c: 0.16, h: 25 },
	destructiveForeground: { l: 0.97, c: 0.01, h: 25 },
	// Success (緑)
	success: { l: 0.55, c: 0.16, h: 158 },
	successForeground: { l: 0.97, c: 0.01, h: 158 },
	// Warning (アンバー)
	warning: { l: 0.55, c: 0.16, h: 72 },
	warningForeground: { l: 0.97, c: 0.01, h: 72 },
	// Info (ブルー)
	info: { l: 0.55, c: 0.16, h: 257 },
	infoForeground: { l: 0.97, c: 0.01, h: 257 },
	// UI
	border: { l: 0.89, c: 0.006, h: 300 },
	input: { l: 0.89, c: 0.006, h: 300 },
	ring: null, // primary と同値
	overlay: null,
};

function buildPalette(
	source: Record<keyof PaletteTokens, OKLCH | null>,
	convert: (oklch: OKLCH) => string,
): PaletteTokens {
	const result = {} as Record<keyof PaletteTokens, string>;
	for (const key of Object.keys(source) as (keyof PaletteTokens)[]) {
		if (key === "overlay") {
			result[key] = "rgba(0, 0, 0, 0.4)";
		} else if (key === "ring") {
			// ring は primary と同値
			const primaryOklch = source.primary;
			if (primaryOklch) result[key] = convert(primaryOklch);
		} else {
			const oklch = source[key];
			if (oklch) result[key] = convert(oklch);
		}
	}
	return result as PaletteTokens;
}

// HEX 出力 (RN 向け)
export const lightPalette: PaletteTokens = buildPalette(lightOKLCH, oklchToHex);

// CSS 出力 (Tailwind 向け)
export const lightPaletteCSS: PaletteTokens = buildPalette(lightOKLCH, oklchToCSS);

// セマンティックカラーのベースキー (foreground ペアを持つ)
const semanticBaseKeys = new Set<keyof PaletteTokens>([
	"primary",
	"accent",
	"destructive",
	"success",
	"warning",
	"info",
]);

// セマンティックカラーの foreground キー
const semanticForegroundKeys = new Set<keyof PaletteTokens>([
	"primaryForeground",
	"accentForeground",
	"destructiveForeground",
	"successForeground",
	"warningForeground",
	"infoForeground",
]);

function generateDarkOKLCH(): Record<keyof PaletteTokens, OKLCH | null> {
	const dark = {} as Record<keyof PaletteTokens, OKLCH | null>;

	for (const key of Object.keys(lightOKLCH) as (keyof PaletteTokens)[]) {
		const oklch = lightOKLCH[key];

		if (key === "overlay" || key === "ring") {
			dark[key] = null;
			continue;
		}
		if (!oklch) {
			dark[key] = null;
			continue;
		}

		if (key === "background") {
			dark[key] = { l: 0.15, c: oklch.c, h: oklch.h };
		} else if (key === "foreground") {
			dark[key] = { l: 0.93, c: oklch.c * 0.5, h: oklch.h };
		} else if (key === "card" || key === "popover") {
			dark[key] = { l: 0.18, c: 0.005, h: 300 };
		} else if (key === "cardForeground" || key === "popoverForeground") {
			dark[key] = { l: 0.93, c: oklch.c * 0.5, h: oklch.h };
		} else if (semanticBaseKeys.has(key)) {
			dark[key] = { l: 0.65, c: oklch.c, h: oklch.h };
		} else if (semanticForegroundKeys.has(key)) {
			dark[key] = { l: 0.15, c: 0.01, h: oklch.h };
		} else if (key === "secondary" || key === "muted") {
			dark[key] = { l: 0.22, c: oklch.c, h: oklch.h };
		} else if (key === "secondaryForeground") {
			dark[key] = { l: 0.85, c: oklch.c, h: oklch.h };
		} else if (key === "mutedForeground") {
			dark[key] = { l: 0.6, c: oklch.c, h: oklch.h };
		} else if (key === "border" || key === "input") {
			dark[key] = { l: 0.28, c: oklch.c, h: oklch.h };
		} else {
			dark[key] = oklch;
		}
	}

	return dark;
}

export function generateDarkPalette(): {
	hex: PaletteTokens;
	css: PaletteTokens;
} {
	const darkSource = generateDarkOKLCH();

	const buildDark = (convert: (oklch: OKLCH) => string): PaletteTokens => {
		const result = {} as Record<keyof PaletteTokens, string>;
		for (const key of Object.keys(darkSource) as (keyof PaletteTokens)[]) {
			if (key === "overlay") {
				result[key] = "rgba(0, 0, 0, 0.7)";
			} else if (key === "ring") {
				const primaryOklch = darkSource.primary;
				if (primaryOklch) result[key] = convert(primaryOklch);
			} else {
				const oklch = darkSource[key];
				if (oklch) result[key] = convert(oklch);
			}
		}
		return result as PaletteTokens;
	};

	return {
		hex: buildDark(oklchToHex),
		css: buildDark(oklchToCSS),
	};
}
