import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const ITEM_HEIGHT = 56;

type UseDragReorderParams = {
	index: number;
	totalCount: number;
	onReorder: (fromIndex: number, toIndex: number) => void;
};

export function useDragReorder({ index, totalCount, onReorder }: UseDragReorderParams) {
	const translateY = useSharedValue(0);
	const isActive = useSharedValue(false);
	const zIndex = useSharedValue(0);

	const panGesture = Gesture.Pan()
		.activeOffsetY([-10, 10])
		.onStart(() => {
			isActive.value = true;
			zIndex.value = 100;
		})
		.onUpdate((e) => {
			translateY.value = e.translationY;
		})
		.onEnd(() => {
			const movedPositions = Math.round(translateY.value / ITEM_HEIGHT);
			const newIndex = Math.max(0, Math.min(totalCount - 1, index + movedPositions));

			if (newIndex !== index) {
				runOnJS(onReorder)(index, newIndex);
			}

			translateY.value = withTiming(0, { duration: 200 });
			isActive.value = false;
			zIndex.value = 0;
		});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		zIndex: zIndex.value,
		opacity: isActive.value ? 0.9 : 1,
	}));

	return { panGesture, animatedStyle };
}
