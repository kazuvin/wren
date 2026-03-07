import { router } from "expo-router";
import { computeEffectiveStats, useGameStore } from "../../stores/game-store";
import { isBossFloor } from "../../utils/battle-engine";
import { BattleScreen } from "./battle-screen";

export function BattleScreenContainer() {
	const heroBaseStats = useGameStore((s) => s.heroBaseStats);
	const equippedItems = useGameStore((s) => s.equippedItems);
	const monster = useGameStore((s) => s.monster);
	const currentFloor = useGameStore((s) => s.currentFloor);
	const battleLog = useGameStore((s) => s.battleLog);
	const battleLogVersion = useGameStore((s) => s.battleLogVersion);
	const equippedSkills = useGameStore((s) => s.equippedSkills);
	const isDefeated = useGameStore((s) => s.isDefeated);
	const retryBattle = useGameStore((s) => s.retryBattle);

	const heroEffectiveStats = computeEffectiveStats(heroBaseStats, equippedItems);

	return (
		<BattleScreen
			hero={heroBaseStats}
			heroEffectiveStats={heroEffectiveStats}
			monster={monster}
			currentFloor={currentFloor}
			battleLog={battleLog}
			battleLogVersion={battleLogVersion}
			equippedSkills={equippedSkills}
			isBossFloor={isBossFloor(currentFloor)}
			isDefeated={isDefeated}
			onRetry={retryBattle}
			onNavigateSkills={() => router.push("/skills")}
			onNavigateEquipment={() => router.push("/equipment")}
		/>
	);
}
