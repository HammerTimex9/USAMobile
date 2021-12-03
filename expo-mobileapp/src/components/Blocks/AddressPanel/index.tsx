import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import QRCode from 'react-qr-code';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMoralis } from "react-moralis";

import { useExperts } from '../../../contexts/expertsContext';
import { TextFieldWithSymbol } from '../../Common/Forms'
import { IconButton } from '../../Common/Button'

import styles from './styles';


const AddressPanel = () => {
	const { Moralis, isAuthenticated } = useMoralis();
	const { setDialog } = useExperts();
	const [data, setData] = useState('0x0');
	const user = Moralis.User.current();
	const ethAddress = user?.attributes.ethAddress;
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setDialog(
				'Your wallet address has been copied to the clipboard.  ' +
				'Paste your address as the destination ' +
				'in the market withdraw or send entry, ' +
				'then carefully check the address before sending!  ' +
				'Malware can change your destination address in the clipboard!'
			);
			setCopied(false);
		} else {
			if (isAuthenticated) {
				setData('ethereum:' + user?.attributes['ethAddress'] + '?chainID:137');
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [copied]);


	/**
	* Handle Copy Button Click here to Copy on ClicpBoard.
	*/
	const _handleClickedOnCopy = () => {
		Clipboard.setString(data);
		setCopied(true);
	}

	return (
		<View style={styles.container}>
			<View style={styles.qrcodeWapper}>
				<Text >Your Address:</Text>
				<QRCode value={ethAddress} />
			</View>
			<View style={styles.copyWrapper}>
				<TouchableOpacity style={styles.buttonWrapper} onPress={_handleClickedOnCopy}>
					<TextFieldWithSymbol
						editable={false}
						value={ethAddress}
						onChangeText={(value) => console.log('On Change Wokring', value)}>
						<Ionicons style={styles.copyIcon} name='copy' />
					</TextFieldWithSymbol>
				</TouchableOpacity>
			</View>

		</View>
	);
};

export default AddressPanel;
