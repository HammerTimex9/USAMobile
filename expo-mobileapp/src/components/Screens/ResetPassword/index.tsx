import React, { useState } from "react";
import { View } from "react-native";
// import { useMoralis } from "react-moralis";

import { Button } from '../../Common/Button'
import { TextField } from '../../Common/Forms'
import styles from './styles';

// Interfaces
/* eslint-disable-next-line */
interface IProps {}


const ResetPassword: React.FC<IProps> = ()=>{

  const [email, setEmail] = useState('');
  const [activePassword, setActivePassword] =  useState(false);

  const handleResetClick = () => {
    console.groupCollapsed('handleResetClick');
    console.log('email:', email);
    console.groupEnd();

  }
  return(
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <TextField
              label={'email'}
              value={email}
              onChangeText={(value) => setEmail(value)}
              secureTextEntry
            />
          </View>
        </View>
         <View style={styles.saveBtnWrapper}>
          <Button label="Reset Password" onPress={handleResetClick}/>
        </View>
      </View>
    </View>
  );
}


export default ResetPassword;







