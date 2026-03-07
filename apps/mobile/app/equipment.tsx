import { EquipmentManagementContainer } from "@/features/battle";
import { colors } from "@wren/design-tokens";
import { StyleSheet, View, useColorScheme } from "react-native";

export default function EquipmentScreen() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<EquipmentManagementContainer />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
