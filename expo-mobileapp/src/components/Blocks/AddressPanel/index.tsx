import React, { useState } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-qr-code';

import styles from './styles';


const AddressPanel = () => {

	const [copied, setCopied] = useState(false);

	return (
		<View style={styles.container}>
			<View style={styles.qrcodeWapper}>
				<Text >Your Address:</Text>
				<QRCode value='TestAddress' />
			</View>
		</View>
	);
};

export default AddressPanel;
