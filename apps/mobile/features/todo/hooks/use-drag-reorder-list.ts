import { useSharedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

export const ITEM_HEIGHT = 56;
export const ITEM_GAP = 8;
export const ITEM_STEP = ITEM_HEIGHT + ITEM_GAP; // 64

export type DragState = {
	/** ドラッグ中アイテムの元の index。-1 = 非アクティブ */
	activeIndex: SharedValue<number>;
	/** ドラッグ中の translateY 移動量 */
	currentTranslateY: SharedValue<number>;
};

export function useDragReorderList(): DragState {
	const activeIndex = useSharedValue(-1);
	const currentTranslateY = useSharedValue(0);

	return { activeIndex, currentTranslateY };
}
