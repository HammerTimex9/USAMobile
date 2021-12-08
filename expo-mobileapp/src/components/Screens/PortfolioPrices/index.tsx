import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

import { useExperts } from '../../../contexts/expertsContext';

import ExpertStage from '../ExpertStage';
import styles from './styles';

/* eslint-disable-next-line */
interface IProps { } // Interfaces


const PortfolioPrices: React.FC<IProps> = () => {
  const { setActionMode, setDialog } = useExperts();


  useFocusEffect(
    React.useCallback(() => {
      setActionMode('portfolio');
      setDialog('Select a currency to view transaction histories.');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <View style={styles.pageHeadingWrapper}>
          <Text> Portfolio Screen</Text>
        </View>
        <View style={styles.expertBoxWrapper}>
          <ExpertStage />
        </View>
      </View>
    </View>
  );
}


export default PortfolioPrices;





