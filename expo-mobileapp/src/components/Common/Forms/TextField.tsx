import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { TextInputProps, StyleProp, TextStyle, ViewStyle } from 'react-native';

// Custom imports:
import FieldContainer from './FieldContainer';

interface IProps extends TextInputProps {
	label: string;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
	secureTextEntry?: boolean;
	value?: string;
}

const TextField: React.FC<IProps> = ({ label, labelStyle, containerStyle, ...props }) => {
	const [isFocused, setFocused] = useState(false);

	const handleFocus = () => {
		setFocused(true);
		 // This is just to remove warning
		console.log('isFocused:', isFocused);
	};
	
	const handleBlur = () => setFocused(false);

	return (
		<FieldContainer containerStyle={containerStyle}>
			<Text style={labelStyle}>
				{label}
			</Text>
			<TextInput
				style={[styles.inputStyle]}
				onFocus={handleFocus}
				onBlur={handleBlur}
				{...props}
			/>
		</FieldContainer>
	);
}

export default TextField;

const styles = StyleSheet.create({
	inputStyle: {
		borderColor: 'gray',
		borderRadius:2,
		borderWidth: 1,
		padding: 8,
	}
});
