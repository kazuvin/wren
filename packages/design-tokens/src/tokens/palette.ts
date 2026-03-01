import { type OKLCH, oklchToCSS, oklchToHex } from "./oklch";

export type PaletteTokens = {
	background: string;
	surface: string;
	surfaceRaised: string;
	card: string;
	cardForeground: string;
	text: string;
	textMuted: string;
	textOnPrimary: string;
	primary: string;
	primaryMuted: string;
	accent: string;
	accentMuted: string;
	destructive: string;
	destructiveMuted: string;
	success: string;
	successMuted: string;
	warning: string;
	warningMuted: string;
	info: string;
	infoMuted: string;
	border: string;
	borderMuted: string;
	icon: string;
	iconMuted: string;
	overlay: string;
};

// ソースオブトゥルース: oklch(L, C, H)
// 現行 HSL 値から culori で正確に変換した値
const lightOKLCH: Record<keyof PaletteTokens, OKLCH | null> = {
	// Base
	background: { l: 0.968, c: 0.0023, h: 303.6 },
	surface: { l: 0.926, c: 0.0077, h: 303.5 },
	surfaceRaised: { l: 1, c: 0, h: 0 },
	card: { l: 1, c: 0, h: 0 },
	cardForeground: { l: 0.292, c: 0.0137, h: 302.9 },
	// Text
	text: { l: 0.292, c: 0.0137, h: 302.9 },
	textMuted: { l: 0.544, c: 0.03, h: 302.8 },
	textOnPrimary: null,
	// Primary (ニアブラック — モノトーン UI)
	primary: { l: 0.26, c: 0.0147, h: 302.8 },
	primaryMuted: { l: 0.961, c: 0.0018, h: 303.6 },
	// Accent (蛍石パープル)
	accent: { l: 0.774, c: 0.09, h: 301.9 },
	accentMuted: { l: 0.946, c: 0.0128, h: 303.4 },
	// Status
	destructive: { l: 0.576, c: 0.196, h: 25.9 },
	destructiveMuted: { l: 0.955, c: 0.011, h: 17.3 },
	success: { l: 0.601, c: 0.1226, h: 158.5 },
	successMuted: { l: 0.954, c: 0.0153, h: 166.5 },
	warning: { l: 0.733, c: 0.1531, h: 72.2 },
	warningMuted: { l: 0.962, c: 0.0142, h: 81.5 },
	info: { l: 0.576, c: 0.1578, h: 257.5 },
	infoMuted: { l: 0.949, c: 0.0111, h: 256.7 },
	// UI
	border: { l: 0.886, c: 0.0101, h: 303.5 },
	borderMuted: { l: 0.936, c: 0.0046, h: 303.6 },
	icon: { l: 0.544, c: 0.03, h: 302.8 },
	iconMuted: { l: 0.705, c: 0.0165, h: 303.3 },
	overlay: null,
};

function buildPalette(
	source: Record<keyof PaletteTokens, OKLCH | null>,
	convert: (oklch: OKLCH) => string,
): PaletteTokens {
	const result = {} as Record<keyof PaletteTokens, string>;
	for (const key of Object.keys(source) as (keyof PaletteTokens)[]) {
		if (key === "textOnPrimary") {
			result[key] = "#FFFFFF";
		} else if (key === "overlay") {
			result[key] = "rgba(0, 0, 0, 0.4)";
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

// ステータス色キー
const statusKeys = new Set<keyof PaletteTokens>(["destructive", "success", "warning", "info"]);

// Muted 系キー
const mutedKeys = new Set<keyof PaletteTokens>([
	"accentMuted",
	"destructiveMuted",
	"successMuted",
	"warningMuted",
	"infoMuted",
]);

function generateDarkOKLCH(): Record<keyof PaletteTokens, OKLCH | null> {
	const dark = {} as Record<keyof PaletteTokens, OKLCH | null>;

	for (const key of Object.keys(lightOKLCH) as (keyof PaletteTokens)[]) {
		const oklch = lightOKLCH[key];

		if (key === "textOnPrimary" || key === "overlay") {
			dark[key] = null;
			continue;
		}
		if (!oklch) {
			dark[key] = null;
			continue;
		}

		if (key === "background") {
			dark[key] = { l: 0.15, c: oklch.c, h: oklch.h };
		} else if (key === "surface") {
			dark[key] = { l: 0.2, c: oklch.c * 0.5, h: oklch.h };
		} else if (key === "surfaceRaised") {
			dark[key] = { l: 0.22, c: 0.005, h: 303 };
		} else if (key === "card") {
			dark[key] = { l: 0.22, c: 0.005, h: 303 };
		} else if (key === "cardForeground" || key === "text") {
			dark[key] = { l: 0.93, c: oklch.c * 0.5, h: oklch.h };
		} else if (key === "textMuted" || key === "icon") {
			dark[key] = { l: 0.6, c: oklch.c * 0.6, h: oklch.h };
		} else if (key === "iconMuted") {
			dark[key] = { l: 0.42, c: oklch.c * 0.5, h: oklch.h };
		} else if (key === "primary") {
			dark[key] = { l: 0.9, c: oklch.c, h: oklch.h };
		} else if (key === "primaryMuted") {
			dark[key] = { l: 0.22, c: oklch.c, h: oklch.h };
		} else if (key === "accent") {
			dark[key] = { l: 0.72, c: oklch.c, h: oklch.h };
		} else if (statusKeys.has(key)) {
			dark[key] = { l: Math.min(oklch.l + 0.08, 1), c: oklch.c, h: oklch.h };
		} else if (mutedKeys.has(key)) {
			dark[key] = { l: 0.22, c: oklch.c * 0.5, h: oklch.h };
		} else if (key === "border") {
			dark[key] = { l: 0.28, c: oklch.c * 0.4, h: oklch.h };
		} else if (key === "borderMuted") {
			dark[key] = { l: 0.22, c: oklch.c * 0.4, h: oklch.h };
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
			if (key === "textOnPrimary") {
				result[key] = "#FFFFFF";
			} else if (key === "overlay") {
				result[key] = "rgba(0, 0, 0, 0.7)";
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
