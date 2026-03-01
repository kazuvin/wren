import { generateDarkPalette, lightPalette, lightPaletteCSS } from "./palette";

const darkPalette = generateDarkPalette();

// RN 向け (HEX)
export const colors = {
	light: { ...lightPalette },
	dark: { ...darkPalette.hex },
} as const;

// CSS 向け (oklch)
export const colorsCSS = {
	light: { ...lightPaletteCSS },
	dark: { ...darkPalette.css },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
