import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import CustomIcon from '@customIcon';

const ButtonIcon = props => {
  const {
    style = {},
    iconName,
    iconStyle = {},
    text,
    textStyle,
    disabled = false,
    activeOpacity = 0.8,
    onPress = () => {
      /* TODO document why this arrow function is empty */
    },
  } = props;

  if (text && iconName) {
    return (
      <TouchableOpacity
        {...props}
        onPress={onPress}
        style={style}
        disabled={disabled}
        activeOpacity={activeOpacity}>
        <Text style={textStyle}>{text}</Text>
        <CustomIcon name={iconName} style={iconStyle} />
      </TouchableOpacity>
    );
  } else if (iconName) {
    return (
      <TouchableOpacity
        {...props}
        onPress={onPress}
        style={style}
        disabled={disabled}
        activeOpacity={activeOpacity}>
        <CustomIcon name={iconName} style={iconStyle} />
      </TouchableOpacity>
    );
  } else {
    return (
      <TouchableOpacity
        {...props}
        onPress={onPress}
        style={style}
        disabled={disabled}
        activeOpacity={activeOpacity}>
        <Text style={textStyle}>{text}</Text>
      </TouchableOpacity>
    );
  }
};

export default ButtonIcon;
