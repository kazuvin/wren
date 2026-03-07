import { useEffect, useRef } from "react";
import { useTodoStore } from "../../todo/stores/todo-store";
import { getCompletedCount } from "../../todo/stores/todo-store";
import { useGameStore } from "../stores/game-store";

/**
 * タスク完了数を監視し、増えたらガチャを発動するフック
 */
export function useTaskReward() {
	const todos = useTodoStore((s) => s.todos);
	const processTaskComplete = useGameStore((s) => s.processTaskComplete);
	const prevCountRef = useRef(getCompletedCount(todos));

	useEffect(() => {
		const currentCount = getCompletedCount(todos);
		if (currentCount > prevCountRef.current) {
			processTaskComplete();
		}
		prevCountRef.current = currentCount;
	}, [todos, processTaskComplete]);
}
