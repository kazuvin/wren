import * as Haptics from "expo-haptics";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { calculateItemOffset, calculateTargetIndex } from "../utils/drag-position";
import { type DragState, ITEM_STEP } from "./use-drag-reorder-list";

type UseDragReorderItemParams = {
	index: number;
	totalCount: number;
	dragState: DragState;
	onReorder: (fromIndex: number, toIndex: number) => void;
};

function triggerHaptic() {
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function useDragReorderItem({
	index,
	totalCount,
	dragState,
	onReorder,
}: UseDragReorderItemParams) {
	const { activeIndex, currentTranslateY } = dragState;
	const lastTargetIndex = useSharedValue(index);

	const panGesture = Gesture.Pan()
		.activeOffsetY([-10, 10])
		.onStart(() => {
			activeIndex.value = index;
			currentTranslateY.value = 0;
			lastTargetIndex.value = index;
		})
		.onUpdate((e) => {
			currentTranslateY.value = e.translationY;

			const newTarget = calculateTargetIndex(index, e.translationY, ITEM_STEP, totalCount);
			if (newTarget !== lastTargetIndex.value) {
				lastTargetIndex.value = newTarget;
				runOnJS(triggerHaptic)();
			}
		})
		.onEnd(() => {
			const targetIndex = calculateTargetIndex(
				index,
				currentTranslateY.value,
				ITEM_STEP,
				totalCount,
			);
			const snapY = (targetIndex - index) * ITEM_STEP;

			currentTranslateY.value = withTiming(snapY, { duration: 200 }, (finished) => {
				if (finished) {
					// リセットを先にしてから onReorder を呼ぶ
					// (onReorder が React 再レンダリングを引き起こすため)
					activeIndex.value = -1;
					currentTranslateY.value = 0;
					if (targetIndex !== index) {
						runOnJS(onReorder)(index, targetIndex);
					}
				}
			});
		});

	const animatedStyle = useAnimatedStyle(() => {
		const isDragging = activeIndex.value === index;

		if (isDragging) {
			return {
				transform: [{ translateY: currentTranslateY.value }],
				zIndex: 100,
				opacity: 0.9,
			};
		}

		// 非ドラッグアイテム: ドラッグ中なら位置を計算してアニメーション
		if (activeIndex.value >= 0) {
			const draggedCurrentIndex = calculateTargetIndex(
				activeIndex.value,
				currentTranslateY.value,
				ITEM_STEP,
				totalCount,
			);
			const offset = calculateItemOffset(index, activeIndex.value, draggedCurrentIndex, ITEM_STEP);

			return {
				transform: [{ translateY: withTiming(offset, { duration: 200 }) }],
				zIndex: 0,
				opacity: 1,
			};
		}

		return {
			transform: [{ translateY: 0 }],
			zIndex: 0,
			opacity: 1,
		};
	});

	return { panGesture, animatedStyle };
}
