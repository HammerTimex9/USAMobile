import React, {useState} from "react";
import { View, Text, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMoralis } from "react-moralis";
import { useWalletConnect } from "../../../WalletConnect";
import { Button, TextButton } from '../../Common/Button'
import { TextField } from '../../Common/Forms'
import styles from './styles';

/* eslint-disable-next-line */
interface IProps { } // Interfaces


const Login: React.FC<IProps> = () => {

  const [email, setEmail] =  useState('');
  const [password, setPassword] =  useState('');
  const [activeLogin, setActiveLogin] =  useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<{route: {} }>>();

  const connector = useWalletConnect();
  const { authenticate, isAuthenticated, login } = useMoralis();


  const handleCryptoLogin = () => {
   console.log('Crypto Login');
   //@ts-ignore
   authenticate({ connector })
   .then((res) => { console.log(res)})
   .catch((error) => {console.log(error)});
  };

  const handleLoginClick = () =>{
    console.groupCollapsed('handleLoginClick');
    console.log('UserName:', email);
    console.log('Password:', password);
    console.groupEnd();

    login(email, password === '' ? undefined : password, {
      usePost: true,
    })
    .then(result=>{
      console.log('LoginSuccess:', result);
    },error=>{
       console.log('LoginError:', error);
    })
    .catch(error=>{
      console.log('LoginCatchError:', error);
    });
    
  }

  const handleSignupButtonClick = (screenName:string) => {
    //@ts-ignore
    navigation.navigate(screenName);
  }

  const handleResetButtonClick = (screenName:string) => {
    //@ts-ignore
    navigation.navigate(screenName);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image style={styles.logo} source={require('../../../media/logo.png')} />
      </View>
      <View style={styles.bodyWrapper}>
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <TextField
              label={'Email'}
              value={email}
              onChangeText={(value) => setEmail(value)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextField
              label={'Password'}
              value={password}
              secureTextEntry
              onChangeText={(value) => setPassword(value)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextButton label="Reset Password?" onPress={() => handleResetButtonClick('Reset')} />
          </View>
        </View>
         <View style={styles.loginBtnWrapper}>
          <Button label="Log In" onPress={handleLoginClick} />
        </View>
        <View style={styles.loginBtnWrapper}>
          <Button label="UseMetaMask" onPress={handleCryptoLogin} />
        </View>

        <View style={styles.formBottomTextWrapper}>
          <Text> You don't have an account yet?</Text>
          <TextButton textStyle={styles.textStyle} label="Register here" onPress={() => handleSignupButtonClick('Signup')} />
        </View>
      </View>
    </View>
  );
}

export default Login;