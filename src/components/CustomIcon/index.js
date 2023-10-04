import React from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from '@theme/selection.json';

const IconMoonIcons = createIconSetFromIcoMoon(
  icoMoonConfig,
  'icomoon',
  'icomoon.ttf',
);

const CustomIcon = props => {
  const { style = {}, name, color = 'white' } = props;
  return <IconMoonIcons style={style} name={name} color={color} {...props} />;
};

export default CustomIcon;
