export const SWIPE_THRESHOLD = 80;

export type SwipeAction = "complete" | "delete" | null;

export function determineSwipeAction(
	translateX: number,
	threshold: number = SWIPE_THRESHOLD,
): SwipeAction {
	if (translateX > threshold) return "complete";
	if (translateX < -threshold) return "delete";
	return null;
}
