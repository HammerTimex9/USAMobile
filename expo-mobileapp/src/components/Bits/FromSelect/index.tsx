import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from "react-native";

const FromSelect = () => {
	const [selectedValue, setSelectedValue] = useState('');
	const [isOpen, setOpen] = useState(false);

	const onSelectItem = (value) =>{
		setOpen(!isOpen);
		setSelectedValue(value);
	}


	return (
		<View style={styles.container}>
			<Modal
				animationType="slide"
				transparent={true}
				visible={isOpen}
				onRequestClose={() => {
					setOpen(!isOpen);
				}}
			>
				<View style={styles.modalContent}>
					<View style={styles.modalView}>
						<TouchableOpacity
							style={styles.itemWrapper}
							onPress={()=>onSelectItem('Item1')}
						>
							<Text style={styles.itemText}>Item 1</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.itemWrapper}
							onPress={()=>onSelectItem('Item2')}
						>
							<Text style={styles.itemText}>Item 2</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.itemWrapper}
							onPress={()=>onSelectItem('Item3')}
						>
							<Text style={styles.itemText}>Item 3</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			<TouchableOpacity
				style={[styles.labelWrapper]}
				onPress={() => setOpen(true)}
			>
				<Text style={styles.labelStyle}>Select a token to act with</Text>
			</TouchableOpacity>
		</View>
	);
};

export default FromSelect;

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		justifyContent: "center",
	},
	modalContent: {
		flex: 1,
		justifyContent: 'center',
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},

	labelWrapper: {
		borderColor: '#6B7280',
		borderWidth: 1,
		padding: 10,
		backgroundColor: 'transparent',

	},
	labelStyle: {
		color: '#6B7280',
		fontWeight: "bold",
		textAlign: "left"
	},
	itemWrapper: {
		borderColor: '#6B7280',
		borderBottomWidth: 1,
		paddingHorizontal: 8,
		paddingVertical: 12
	},
	itemText: {}
});
