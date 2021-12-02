import React from "react";
import { Image, View, Text } from "react-native";
import { useExperts } from '../../../contexts/expertsContext';

const LibertyFox = require('../../../media/characters/LibertyFox.png');
const SamEagle = require('../../../media/characters/SamEagle.png');
const Benicorn = require('../../../media/characters/Benicorn.png');

import styles from './styles';

const Icons = {
  '': SamEagle,
  idle: SamEagle,
  portfolio: SamEagle,
  chart: SamEagle,
  trade: Benicorn,
  swap: Benicorn,
  buy: LibertyFox,
  sell: LibertyFox,
  send: LibertyFox,
  receive: LibertyFox,
  gallery: LibertyFox,
};

const ExpertStage = () => {
  const { expertsOn, actionMode, dialog } = useExperts();
  const icon = Icons[actionMode];

  if (expertsOn === true) {
    return (
      <View style={styles.container}>
        <View style={styles.expertCardWrapper}>
          <View style={styles.textWrapper}>
            <Text>{dialog}</Text>
          </View>
          <View style={styles.iconWrapper}>
            <Image style={styles.icon} source={icon} />
          </View>
        </View>

      </View>
    );
  } else {
    return null;
  }
};

export default ExpertStage;