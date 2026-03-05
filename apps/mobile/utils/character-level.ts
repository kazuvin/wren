export type CharacterLevel = {
	level: number;
	name: string;
	requiredForNext: number | null;
};

const LEVELS: { threshold: number; name: string; scale: number }[] = [
	{ threshold: 0, name: "たまご", scale: 0.6 },
	{ threshold: 3, name: "こども", scale: 0.8 },
	{ threshold: 7, name: "おとな", scale: 1.0 },
	{ threshold: 15, name: "マスター", scale: 1.2 },
];

export function getCharacterLevel(completedCount: number): CharacterLevel {
	let currentIndex = 0;
	for (let i = LEVELS.length - 1; i >= 0; i--) {
		if (completedCount >= LEVELS[i].threshold) {
			currentIndex = i;
			break;
		}
	}

	const nextLevel = LEVELS[currentIndex + 1];
	return {
		level: currentIndex + 1,
		name: LEVELS[currentIndex].name,
		requiredForNext: nextLevel ? nextLevel.threshold : null,
	};
}

export function getCharacterScale(completedCount: number): number {
	for (let i = LEVELS.length - 1; i >= 0; i--) {
		if (completedCount >= LEVELS[i].threshold) {
			return LEVELS[i].scale;
		}
	}
	return LEVELS[0].scale;
}
