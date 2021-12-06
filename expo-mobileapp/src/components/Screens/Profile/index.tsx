import React, { useState }  from "react";
import { View, Text } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useMoralis } from "react-moralis";
import { Button, TextButton } from '../../Common/Button'
import { TextField } from '../../Common/Forms'
import styles from './styles';


/* eslint-disable-next-line */
interface IProps { } // Interfaces


const Profile: React.FC<IProps> = ()=>{

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [activeProfile, setActiveProfile] =  useState(false);
  const { setUserData, user } = useMoralis();

  useFocusEffect(
    React.useCallback(() => {
        putUserDetails();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  const putUserDetails =()=>{
    console.log('user:', user);
    setUsername(user.get('username'));
    setEmail(user.get('email'));
  }

  const handleSaveClick = () => {
    console.groupCollapsed('handleSaveClick');
    console.log('Username:', username);
    console.log('Email:', email);
    console.groupEnd();

     setUserData({userName: username, email:email})
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
              label={'UserName'}
              value={username}
              onChangeText={(value) => setUsername(value)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextField
              label={'Email'}
              value={email}
              onChangeText={(value) => setEmail(value)}
            />
          </View>
        </View>
         <View style={styles.saveBtnWrapper}>
          <Button label="Save" onPress={handleSaveClick}  />
        </View>
      </View>
    </View>
  );
}


export default Profile;





