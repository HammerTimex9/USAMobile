import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

import { useExperts } from '../../../contexts/expertsContext';

import SwapPanel from '../../Blocks/SwapPanel';
import ExpertStage from '../ExpertStage';

import styles from './styles';

/* eslint-disable-next-line */
interface IProps { } // Interfaces


const SwapTrade: React.FC<IProps> = () => {
  const { setActionMode, setDialog } = useExperts();
  useFocusEffect(
    React.useCallback(() => {
      setActionMode('swap');
      setDialog('Select a token to convert.');
      // eslint-disable-next-line react-hooks/exhaustive-deps
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





