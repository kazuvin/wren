import { colors, fontSize, parseNumeric, radius, spacing } from "@wren/design-tokens";
import { StyleSheet, TextInput, type TextInputProps, useColorScheme } from "react-native";
import { textBase } from "../../../constants/theme";

export type TextAreaProps = Omit<TextInputProps, "style" | "multiline"> & {
	style?: TextInputProps["style"];
	rows?: number;
};

export function TextArea({ editable = true, rows = 3, style, ...props }: TextAreaProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const minHeight = rows * parseNumeric(fontSize.base) * 1.5;

	return (
		<TextInput
			accessibilityRole="none"
			role="textbox"
			multiline
			editable={editable}
			aria-disabled={!editable}
			placeholderTextColor={theme.mutedForeground}
			textAlignVertical="top"
			style={[
				styles.base,
				{ backgroundColor: theme.secondary, color: theme.foreground, minHeight },
				!editable && styles.disabled,
				style,
			]}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	base: {
		...textBase,
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[4]),
		fontSize: parseNumeric(fontSize.base),
	},
	disabled: {
		opacity: 0.5,
	},
});
