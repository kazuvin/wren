import { useGameStore } from "../../stores/game-store";
import { GachaNotification } from "./gacha-notification";

export function GachaNotificationContainer() {
	const lastReward = useGameStore((s) => s.lastReward);
	const clearLastReward = useGameStore((s) => s.clearLastReward);

	return <GachaNotification reward={lastReward} onDismiss={clearLastReward} />;
}
