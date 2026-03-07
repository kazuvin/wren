import { computeEffectiveStats, useGameStore } from "../../stores/game-store";
import { HeroStatsDisplay } from "./hero-stats";

export function HeroStatsContainer() {
	const heroBaseStats = useGameStore((s) => s.heroBaseStats);
	const equippedItems = useGameStore((s) => s.equippedItems);
	const currentFloor = useGameStore((s) => s.currentFloor);

	const effectiveStats = computeEffectiveStats(heroBaseStats, equippedItems);

	return (
		<HeroStatsDisplay
			baseStats={heroBaseStats}
			effectiveStats={effectiveStats}
			currentFloor={currentFloor}
		/>
	);
}
