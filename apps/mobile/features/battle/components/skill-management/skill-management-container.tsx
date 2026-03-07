import { useGameStore } from "../../stores/game-store";
import { SkillManagement } from "./skill-management";

export function SkillManagementContainer() {
	const ownedSkills = useGameStore((s) => s.ownedSkills);
	const equippedSkills = useGameStore((s) => s.equippedSkills);
	const equipSkill = useGameStore((s) => s.equipSkill);
	const unequipSkill = useGameStore((s) => s.unequipSkill);

	return (
		<SkillManagement
			ownedSkills={ownedSkills}
			equippedSkills={equippedSkills}
			onEquip={equipSkill}
			onUnequip={unequipSkill}
		/>
	);
}
