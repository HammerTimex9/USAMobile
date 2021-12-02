import React, {useState} from "react";
import { View, Text, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  useMoralis,
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
} from "react-moralis";
import { useWalletConnect } from "../../../WalletConnect";


import { Button, TextButton } from '../../Common/Button'
import { TextField } from '../../Common/Forms'
import styles from './styles';



// Interfaces
interface IProps { }


const Login: React.FC<IProps> = () => {

  const [email, setEmail] =  useState('');
  const [password, setPassword] =  useState('');
  const navigation = useNavigation<NativeStackNavigationProp<{route: {} }>>();

  const connector = useWalletConnect();
  const {
    authenticate,
    authError,
    isAuthenticating,
    isAuthenticated,
    logout,
    Moralis,
  } = useMoralis();


  const handleCryptoLogin = () => {
   console.log('Crypto Login');
   //@ts-ignore
   authenticate({ connector })
   .then(() => {})
   .catch(() => {});
  };

  const handleLoginClick = () =>{
    console.groupCollapsed('handleLoginClick');
    console.log('UserName:', email);
    console.log('Password:', password);
    console.groupEnd();

    //@ts-ignore
    navigation.replace('Drawer',{});
  }

  const handleSignupButtonClick = (screenName:string) => {
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
              onChange={(value) => setEmail(value)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextField
              label={'Password'}
              value={password}
              secureTextEntry
              onChange={(value) => setPassword(value)}
            />
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
          <TextButton textStyle={{fontWeight: '800', textDecorationLine:'underline'}} label="Register here" onPress={() => handleSignupButtonClick('Signup')} />
        </View>
      </View>
    </View>
  );
}

export default Login;