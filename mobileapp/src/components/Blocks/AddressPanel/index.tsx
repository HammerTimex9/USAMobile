import React, { useState } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-qr-code';

const AddressPanel = () => {

	const [copied, setCopied] = useState(false);

	return (
		<View>
			<View>
				<Text >Your Address:</Text>
				<QRCode value='TestAddress' />
			</View>
		</View>
	);
};

export default AddressPanel;
