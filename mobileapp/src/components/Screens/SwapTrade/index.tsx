import React from "react";
import { View, Text } from "react-native";
import SwapPanel from '../../Blocks/SwapPanel';
import ExpertStage from '../ExpertStage';

import styles  from './styles';
// Interfaces
interface IProps { }


const SwapTrade: React.FC<IProps> = () => {
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





