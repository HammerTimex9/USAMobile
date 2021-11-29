import React from "react";
import { View, Text } from "react-native";

import styles from './styles';

const ExpertStage = () => {

  return (
    <View style={styles.container}>
      <View style={styles.expertCardWrapper}>
        <View style={styles.textWrapper}>
          <Text>Expert Stage Component</Text>
        </View>
        <View style={styles.iconWrapper}>
        </View>
      </View>

    </View>
  );
};

export default ExpertStage;