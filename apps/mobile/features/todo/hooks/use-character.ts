import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { getCompletedCount, useTodoStore } from "../stores/todo-store";
import { getCharacterLevel, getCharacterScale } from "../utils/character-level";

const CHARACTER_FACES = ["🥚", "🐣", "🐥", "🐔"];

export function useCharacter() {
	const completedCount = useTodoStore((s) => getCompletedCount(s.todos));
	const level = getCharacterLevel(completedCount);
	const targetScale = getCharacterScale(completedCount);
	const scale = useSharedValue(targetScale);

	useEffect(() => {
		scale.value = withTiming(targetScale, { duration: 500 });
	}, [targetScale, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const face = CHARACTER_FACES[level.level - 1];
	const remaining = level.requiredForNext !== null ? level.requiredForNext - completedCount : null;

	return { face, level, remaining, animatedStyle };
}
