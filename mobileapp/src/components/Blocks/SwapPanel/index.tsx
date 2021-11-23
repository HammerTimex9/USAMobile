import React, { useState } from 'react';
import { View, Text } from 'react-native';
import FromSelect from '../../Bits/FromSelect';
import styles from './styles';

const SwapPanel = () => {

	return (
		<View style={styles.container}>
			<View style={styles.bodyWrapper}>
				<View style={styles.labelWrapper}>
					<Text >Swap Panel</Text>
				</View>
				<View style={styles.fromSelectWrapper}>
					<FromSelect />
				</View>
			</View>

		</View>
	);
};

export default SwapPanel;
