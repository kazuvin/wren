import { useGameStore } from "../../stores/game-store";
import { EquipmentManagement } from "./equipment-management";

export function EquipmentManagementContainer() {
	const equippedItems = useGameStore((s) => s.equippedItems);
	const ownedEquipment = useGameStore((s) => s.ownedEquipment);
	const equipItem = useGameStore((s) => s.equipItem);
	const unequipItem = useGameStore((s) => s.unequipItem);

	return (
		<EquipmentManagement
			equippedItems={equippedItems}
			ownedEquipment={ownedEquipment}
			onEquip={equipItem}
			onUnequip={unequipItem}
		/>
	);
}
