import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

import { useExperts } from '../../../contexts/expertsContext';

import ExpertStage from '../ExpertStage';
import styles from './styles';


// Interfaces
interface IProps { }


const BuySell: React.FC<IProps> = () => {
  const { setActionMode, setDialog } = useExperts();
  useFocusEffect(
    React.useCallback(() => {
      setActionMode('buy');
      setDialog('Place an order to buy cryptocurrency.');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <View style={styles.pageHeadingWrapper}>
          <Text> Buy and Sell</Text>
        </View>
        <View style={styles.expertBoxWrapper}>
          <ExpertStage />
        </View>
      </View>
    </View>
  );
}


export default BuySell;

