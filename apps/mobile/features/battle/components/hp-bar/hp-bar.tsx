import { colors, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../../constants/theme";

type HPBarProps = {
	current: number;
	max: number;
	color?: string;
	height?: number;
};

export function HPBar({ current, max, color, height = 8 }: HPBarProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const fillColor = color ?? theme.success;
	const ratio = max > 0 ? Math.max(0, Math.min(current / max, 1)) : 0;

	const anim = useRef(new Animated.Value(ratio)).current;

	useEffect(() => {
		Animated.timing(anim, {
			toValue: ratio,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [ratio, anim]);

	const borderRadiusValue = parseNumeric(radius.full);

	const animatedWidth = anim.interpolate({
		inputRange: [0, 1],
		outputRange: ["0%", "100%"],
	});

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.barBackground,
					{
						backgroundColor: theme.muted,
						height,
						borderRadius: borderRadiusValue,
					},
				]}
			>
				<Animated.View
					style={{
						width: animatedWidth,
						height,
						backgroundColor: fillColor,
						borderRadius: borderRadiusValue,
					}}
				/>
			</View>
			<Text style={[styles.hpText, { color: theme.mutedForeground }]}>
				{current}/{max}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: parseNumeric(spacing[1]),
	},
	barBackground: {
		overflow: "hidden",
	},
	hpText: {
		...textBase,
		fontSize: 10,
		textAlign: "center",
	},
});
