import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { TextInputProps, StyleProp, TextStyle, TextProperties, ViewStyle } from 'react-native';

// Custom imports:
import FieldContainer from './FieldContainer';

interface IProps extends TextInputProps {
	symbol?:string;
	symbolStyle?:StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
	secureTextEntry?: boolean;
	value?: string;
	// onChange?: (value: string) => void;
}

const TextFieldWithSymbol: React.FC<IProps> = ({ containerStyle, children, ...props }) => {
	const [isFocused, setFocused] = useState(false);
	const handleFocus = () => setFocused(true);
	const handleBlur = () => setFocused(false);
	return (
		<FieldContainer containerStyle={[containerStyle, styles.container]}>
				
				<View style={styles.inputWrapper}>
					<TextInput
					style={[styles.inputStyle]}
					onFocus={handleFocus}
					onBlur={handleBlur}
					{...props}
				/>
				</View>
				<View style={styles.sybmolWrapper}>
					{children}
				</View>
				
		</FieldContainer>

	);
}

export default TextFieldWithSymbol;

const styles = StyleSheet.create({
	container:{
		flexDirection:'row',
		borderRadius: 2,
		borderWidth: 1,
		borderColor: 'gray',
		justifyContent: 'center',
		paddingTop: 0,
		paddingHorizontal: 0
	},
	sybmolWrapper:{
		width:40,
		justifyContent: 'center',
		alignItems:'center',
		backgroundColor:'gray'
	},
	inputWrapper:{
		flex:1,
		padding: 4
	},
	inputStyle: {
		height: 30,
		paddingHorizontal:8
	}
});
