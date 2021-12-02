import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { Button } from '../../Common/Button';

const ButtonSegments = ({onSelect}) => {
	const [selection, setSelection] = useState(0);
	return (
			<View style={styles.container}>
				<Button
					label="Send"
					touchableStyle={[styles.button, styles.sendButton, selection === 1 ? { backgroundColor: "#6B7280", } : null]}
					textStyle={[styles.btnText, selection === 1 ? { color: "white" } : null]}
					onPress={() => {setSelection(1);onSelect(1)}}
				/>
				<Button
					label="Receive"
					touchableStyle={[styles.button, styles.receiveButton, selection === 2 ? { backgroundColor: "#6B7280", borderTopLeftRadius:0 } : null]}
					textStyle={[styles.btnText, selection === 2 ? { color: "white" } : null]}
					onPress={() => {setSelection(2);onSelect(2)}}
				/>
			</View>
	);
}

export default ButtonSegments;

const styles = StyleSheet.create({
	container: {
		display:'flex',
		flexDirection: 'row',
		alignItems: "center"
	},
	button:{
		flex: 1,
		borderRadius:0,
		backgroundColor:'transparent',
		borderColor: '#6B7280',
		borderWidth: 1
	},
	sendButton: {},
	receiveButton:{},
	btnText: {
		textAlign: 'center',
		paddingVertical: 16,
		fontSize: 14,
		color: '#6B7280'
	}
});
