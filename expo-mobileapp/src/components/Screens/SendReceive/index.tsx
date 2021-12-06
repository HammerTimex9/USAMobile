import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect } from '@react-navigation/native';


import { useExperts } from '../../../contexts/expertsContext';

import AddressPanel from '../../Blocks/AddressPanel';
import SendPanel from '../../Blocks/SendPanel';
import ButtonsBar from './ButtonsBar';
import ExpertStage from '../ExpertStage';

import styles from './styles';

/* eslint-disable-next-line */
interface IProps { } // Interfaces

const SendReceive: React.FC<IProps> = () => {
  const { setActionMode, setDialog } = useExperts();
  const [localMode, setLocalMode] = useState('none');

  useFocusEffect(
    React.useCallback(() => {
      setActionMode('send');
      setDialog('Would you like to send or receive cryptocurrency?');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const toggleButton = (value) => {
    console.log(value);
    if (value == 1) {
      setLocalMode('send');
      setActionMode('send');
      setDialog('Select a currency to send.');
    } else {
      setLocalMode('receive');
      setActionMode('receive');
      setDialog(
        'Copy your address for pasting or ' +
        'select amount to request to generate a QR code.'
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pageHeadingWrapper}>
        <Text> Send/Receive</Text>
      </View>
      <View style={styles.expertBoxWrapper}>
        <ExpertStage />
      </View>
      <View style={styles.buttonsBarWrapper}>
        <ButtonsBar onSelect={toggleButton} />
      </View>
      <View style={styles.bodyWrapper}>
        {
          localMode === 'send' &&
          <View style={styles.sendPanelWrapper}>
            <SendPanel />
          </View>
        }
        {
          localMode === 'receive' &&
          <View style={styles.addressPanelWrapper}>
            <AddressPanel />
          </View>
        }



      </View>

    </ScrollView>
  );
}


export default SendReceive;





