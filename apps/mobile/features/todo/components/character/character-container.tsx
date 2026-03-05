import { useCharacter } from "../../hooks/use-character";
import { Character } from "./character";

export function CharacterContainer() {
	const { face, level, remaining, animatedStyle } = useCharacter();

	return (
		<Character face={face} level={level} remaining={remaining} animatedStyle={animatedStyle} />
	);
}
