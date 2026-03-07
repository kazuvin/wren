import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/game-store";

/**
 * 1秒ごとにprocessTickを呼び出すフック
 * コンポーネントのマウント時に開始、アンマウント時に停止
 */
export function useBattleTick() {
	const processTick = useGameStore((s) => s.processTick);
	const isDefeated = useGameStore((s) => s.isDefeated);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (isDefeated) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		intervalRef.current = setInterval(() => {
			processTick();
		}, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [processTick, isDefeated]);
}
