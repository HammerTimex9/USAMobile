import { useFocusEffect } from '@react-navigation/native';
import React from "react";
import { Text, View } from "react-native";

import { useExperts } from '../../../contexts/expertsContext';
import SwapPanel from '../../Blocks/SwapPanel';
import ExpertStage from '../ExpertStage';

import styles from './styles';

// eslint-disable-next-line @typescript-eslint/ban-types
type IProps = { }; // Interfaces


const SwapTrade: React.FC<IProps> = () => {
  const { setActionMode, setDialog } = useExperts();
  useFocusEffect(
    React.useCallback(() => {
      setActionMode('swap');
      setDialog('Select a from token first, then enter an amount to start a trade.');
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <View style={styles.pageHeadingWrapper}>
          <Text>Swap and Trade</Text>
        </View>
        <View style={styles.expertBoxWrapper}>
          <ExpertStage />
        </View>
        <View style={styles.swapPanelWrapper}>
          <SwapPanel />
        </View>
      </View>
    </View>
  );
}


export default SwapTrade;





