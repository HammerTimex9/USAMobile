import React, { useState } from "react";
import { View } from "react-native";
import { useMoralis } from "react-moralis";

import { Button } from '../../Common/Button'
import { TextField } from '../../Common/Forms'
import styles from './styles';

// Interfaces
/* eslint-disable-next-line */
interface IProps {}


const ChangePassword: React.FC<IProps> = ()=>{

  const [password, setPassword] = useState('');
  const [activePassword, setActivePassword] =  useState(false);
  const { setUserData } = useMoralis();

  const handleSaveClick = () => {
    console.groupCollapsed('handleSaveClick');
    console.log('Password:', password);
    console.groupEnd();

     setUserData({password:password})
      .then(result => {
        console.log('UpdateSuccess:', result);
      }, error => {
        console.log('UpdateError:', error);
      })
      .catch(error => {
        console.log('UpdateCatchError:', error);
      });
    
  }
  return(
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <TextField
              label={'New Password'}
              value={password}
              onChangeText={(value) => setPassword(value)}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextField
              label={'Confirm Password'}
              secureTextEntry
            />
          </View>
        </View>
         <View style={styles.saveBtnWrapper}>
          <Button label="Save" onPress={handleSaveClick}/>
        </View>
      </View>
    </View>
  );
}


export default ChangePassword;





