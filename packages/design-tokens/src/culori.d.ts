declare module "culori" {
	interface Oklch {
		mode: "oklch";
		l: number;
		c: number;
		h?: number;
	}

	function clampChroma<T extends { mode: string }>(color: T, mode: string): T;
	function formatHex(color: unknown): string;
}
