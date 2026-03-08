import * as Haptics from "expo-haptics";
import { Gesture, type GestureType } from "react-native-gesture-handler";
import {
	type SharedValue,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { SWIPE_THRESHOLD, determineSwipeAction } from "../utils/swipe-action";

type UseSwipeActionParams = {
	onSwipeRight: () => void;
	onSwipeLeft: () => void;
};

type UseSwipeActionReturn = {
	swipeGesture: GestureType;
	translateX: SharedValue<number>;
	itemAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
};

function triggerHaptic() {
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function useSwipeAction({
	onSwipeRight,
	onSwipeLeft,
}: UseSwipeActionParams): UseSwipeActionReturn {
	const translateX = useSharedValue(0);
	const hasTriggeredHaptic = useSharedValue(false);

	const swipeGesture = Gesture.Pan()
		.activeOffsetX([-20, 20])
		.failOffsetY([-10, 10])
		.onUpdate((e) => {
			translateX.value = e.translationX;

			const action = determineSwipeAction(e.translationX);
			if (action !== null && !hasTriggeredHaptic.value) {
				hasTriggeredHaptic.value = true;
				runOnJS(triggerHaptic)();
			} else if (action === null && hasTriggeredHaptic.value) {
				hasTriggeredHaptic.value = false;
			}
		})
		.onEnd((e) => {
			const action = determineSwipeAction(e.translationX);

			if (action === "complete") {
				translateX.value = withTiming(0, { duration: 200 });
				runOnJS(onSwipeRight)();
			} else if (action === "delete") {
				translateX.value = withTiming(-400, { duration: 150 }, () => {
					translateX.value = 0;
				});
				runOnJS(onSwipeLeft)();
			} else {
				translateX.value = withTiming(0, { duration: 200 });
			}

			hasTriggeredHaptic.value = false;
		});

	const itemAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return { swipeGesture, translateX, itemAnimatedStyle };
}
