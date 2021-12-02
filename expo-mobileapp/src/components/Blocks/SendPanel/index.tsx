import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { FromSelect, ToSelect, AmountSelect } from '../../Bits';
import { Button } from '../../Common/Button';

import styles from './styles';

const SendPanel = () => {

	const [copied, setCopied] = useState(false);

	return (
		<View style={styles.container}>
			<View style={styles.bodyWrapper}>
				<View style={styles.labelWrapper}>
					<Text >Send Money</Text>
				</View>
				<View style={styles.fromSelectWrapper}>
					<FromSelect />
				</View>
				<View style={styles.amountSelectWrapper}>
					<AmountSelect type='send' />
				</View>
			</View>
			<View style={styles.buttonWrapper}>
				<Button
					label="Send Money"
					onPress={() => console.log('Send Money Clicked....')}
				/>
			</View>

		</View>
	);
};

export default SendPanel;
