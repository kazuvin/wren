import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { SWIPE_THRESHOLD } from "../../utils/swipe-action";

type SwipeableRowProps = {
	translateX: SharedValue<number>;
	children: ReactNode;
};

export function SwipeableRow({ translateX, children }: SwipeableRowProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const leftActionStyle = useAnimatedStyle(() => ({
		opacity: Math.min(translateX.value / SWIPE_THRESHOLD, 1),
	}));

	const rightActionStyle = useAnimatedStyle(() => ({
		opacity: Math.min(-translateX.value / SWIPE_THRESHOLD, 1),
	}));

	return (
		<View style={styles.wrapper}>
			<Animated.View
				style={[
					styles.actionBackground,
					styles.leftAction,
					{ backgroundColor: theme.primary },
					leftActionStyle,
				]}
			>
				<Text style={styles.actionIcon}>✓</Text>
			</Animated.View>

			<Animated.View
				style={[
					styles.actionBackground,
					styles.rightAction,
					{ backgroundColor: theme.destructive },
					rightActionStyle,
				]}
			>
				<Text style={styles.actionIcon}>🗑</Text>
			</Animated.View>

			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "relative",
		overflow: "hidden",
		borderRadius: parseNumeric(radius.xl),
	},
	actionBackground: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		borderRadius: parseNumeric(radius.xl),
		paddingHorizontal: parseNumeric(spacing[6]),
	},
	leftAction: {
		alignItems: "flex-start",
	},
	rightAction: {
		alignItems: "flex-end",
	},
	actionIcon: {
		fontSize: 20,
		color: "white",
		fontWeight: "bold",
	},
});
