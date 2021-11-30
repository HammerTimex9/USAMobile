import React from "react";
import { Image, View, Text } from "react-native";

import styles from './styles';

const ExpertStage = () => {

  return (
    <View style={styles.container}>
      <View style={styles.expertCardWrapper}>
        <View style={styles.textWrapper}>
          <Text>Expert Stage Component</Text>
        </View>
        <View style={styles.iconWrapper}>
          <Image style={styles.icon} source={require('../../../media/characters/Benicorn.png')} />
        </View>
      </View>

    </View>
  );
};

export default ExpertStage;