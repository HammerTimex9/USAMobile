import React from "react";
import { StyleSheet, Text, TouchableHighlight } from "react-native";
import { TouchableHighlightProperties, StyleProp, TextStyle, TextProperties, ViewStyle} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';


interface IProps extends TouchableHighlightProperties {
  icon: string;
  disabled?: boolean;
  touchableStyle?:StyleProp<ViewStyle>
  iconStyle?: any
}

const IconButton = ({ icon, disabled, onPress, touchableStyle, iconStyle, ...props }:IProps) => (
    <TouchableHighlight
      onPress={onPress} 
      disabled={disabled}
      style={[styles.container, touchableStyle]}
      {...props}
    >
        <Ionicons style={[styles.defaultIconStyle, iconStyle]} name={icon}/>
    </TouchableHighlight>
)

export default IconButton;

const styles = StyleSheet.create({
  container:{
    display: 'flex',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  defaultIconStyle:{
    fontSize: 25
  }
});




