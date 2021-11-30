import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import AddressPanel from '../../Blocks/AddressPanel';
import SendPanel from '../../Blocks/SendPanel';
import ButtonsBar from './ButtonsBar';
import ExpertStage from '../ExpertStage';

import styles from './styles';

// Interfaces
interface IProps {}

const SendReceive: React.FC<IProps> = ()=>{
  const [localMode, setLocalMode] = useState('none');
  
  const toggleButton = (value) =>{
    console.log(value);
    if(value==1){
      setLocalMode('send');
    }else{
      setLocalMode('receive');
    }
  }

  return(
    <View style={styles.container}>
      <View style={styles.pageHeadingWrapper}>
          <Text> Send/Receive</Text>
      </View>
      <View style={styles.expertBoxWrapper}>
          <ExpertStage />
        </View>
      <View style={styles.buttonsBarWrapper}>
        <ButtonsBar onSelect={toggleButton}/>
      </View>
      <View style={styles.bodyWrapper}>
      {
        localMode === 'send' && 
        <View style={styles.sendPanelWrapper}>
          <SendPanel/>
        </View>
      }
      {
        localMode === 'receive' &&
        <View style={styles.addressPanelWrapper}>
          <AddressPanel/>
        </View>
      }
        
        
        
      </View>
      
    </View>
  );
}


export default SendReceive;





