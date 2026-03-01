import { ThemedText } from "@/components/shared/themed-text";
import { ThemedView } from "@/components/shared/themed-view";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
	return (
		<ThemedView style={styles.container}>
			<View style={styles.content}>
				<ThemedText type="title">Welcome to Wren</ThemedText>
				<ThemedText type="subtitle">Your app starts here</ThemedText>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 8,
	},
});
