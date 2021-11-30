import React from "react";
import { View, Text } from "react-native";
import ExpertStage from '../ExpertStage';
import styles from './styles';


// Interfaces
interface IProps {}


const BuySell: React.FC<IProps> = ()=>{
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

