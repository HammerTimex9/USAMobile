import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { FromSelect, ToSelect, AmountSelect } from '../../Bits';
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
				<View style={styles.toSelectWrapper}>
					<ToSelect />
				</View>
				<View style={styles.amountSelectWrapper}>
					<AmountSelect  type='' />
				</View>
			</View>

		</View>
	);
};

export default SwapPanel;
