import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { TextFieldWithSymbol } from '../../Common/Forms'
import { IconButton } from '../../Common/Button'

const AmountSelect = ({type}) => {
  const [value, setValue] = useState(0);
  const [amount, setAmount] = useState(0);
  const [usdAmount, setUSDAmount] = useState(0);
  const [isUSDMode, setIsUSDMode] = useState(false);

  const price = 2;
  const tokens = 3;

  useEffect(() => {
    let v = Number(value) || 0;
    if (isUSDMode) {
      setUSDAmount(v);
      setAmount(v / price);
    } else {
      setAmount(v);
      setUSDAmount(v * price);
    }
  }, [isUSDMode, price, value]);

	const onChange = (value) => {
	    const maxAmount = isUSDMode ? price * tokens : tokens
	    if (!value.match(/([^0-9.])|(\.\d*\.)/)) {
	      value = value.match(/^0\d/) ? value.slice(1) : value;
	    }
	    const parsedValue = Number(value);
	    if (Number.isNaN(parsedValue)) {
	      setValue(0) //setter for state
	    } else if (parsedValue > maxAmount) {
	      setValue(maxAmount)
	    } else {
	      setValue(value);
	    }
  };

  const onBlur = () => {
    if (value.toString() === '' || value.toString() === '.') {
      setValue(0);
    }
  };

  const toggleMode = () => {
    if (price) {
      if (isUSDMode) {
        setValue(Number((value/ price).toPrecision(3)));
      } else {
        setValue(Number((value * price).toFixed(2)));
      }
      setIsUSDMode(!isUSDMode);
    }
  };

	return (
		<View style={styles.container}>
			<View style={styles.textFieldWrapper}>
				<TextFieldWithSymbol
					value={value.toString()}
					onChangeText={onChange}>
					<Text style={styles.symbolTextStyle}>{isUSDMode ? 'USD' : 'M'}</Text>
				</TextFieldWithSymbol>
			</View>
			<View style={styles.swapButtonWapper}>
				<IconButton icon="swap-vertical" onPress={toggleMode}/>
			</View>
			<View style={styles.textFieldWrapper}>
				<TextFieldWithSymbol 
					editable={false} 
					value={price ? isUSDMode? `${amount.toPrecision(3)}`
			                : `${usdAmount.toLocaleString('en-US', {
			                    minimumFractionDigits: 2,
			                    maximumFractionDigits: 2,
			                  })}`
			              : 'No Conversion Rate Available'
					}
					onChangeText={(value) => console.log('On Change Wokring', value)}>
					<Text style={styles.symbolTextStyle}>{!isUSDMode ? 'USD' : 'M'}</Text>
				</TextFieldWithSymbol>
			</View>
		</View>
	);
};

export default AmountSelect;

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		alignItems: 'center'
	},
	textFieldWrapper: {
		marginVertical: 4,
	},
	swapButtonWapper: {
		marginVertical: 4
	},
	symbolTextStyle: {
		fontSize: 12,
		fontWeight: 'bold'
	}
});
