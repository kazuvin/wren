import { clampChroma, formatHex } from "culori";

export type OKLCH = { l: number; c: number; h: number };

export function oklchToHex(oklch: OKLCH): string {
	const clamped = clampChroma({ mode: "oklch", l: oklch.l, c: oklch.c, h: oklch.h }, "oklch");
	return formatHex(clamped);
}

export function oklchToCSS(oklch: OKLCH): string {
	const l = +oklch.l.toFixed(4);
	const c = +oklch.c.toFixed(4);
	const h = +oklch.h.toFixed(1);
	return `oklch(${l} ${c} ${h})`;
}
