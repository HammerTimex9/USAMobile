import React from "react";
import { View, Text } from "react-native";

/* eslint-disable-next-line */
interface IProps { } // Interfaces

const Home: React.FC<IProps> = ()=>{
  return(
    <View>
      <Text>This is Our Home Screen Template, We will use this to create each screen.</Text>
    </View>
  );
}

export default Home;