import DeviceInfo from '@utils/DeviceInfo';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const { height, width } = DeviceInfo.screenSize;

export function moderateScaling(val, factor = 0.4) {
  return moderateScale(val, factor);
}

export function verticalScaling(val, factor = 0.4) {
  return verticalScale(val, factor);
}

export function getScreenActualWidth() {
  return height > width ? width : height;
}

export function getScreenActualHeight() {
  return height > width ? height : width;
}

export function calculateImageHeight(
  actualWidth = getScreenActualWidth(),
  actualHeight = getScreenActualHeight(),
) {
  // actualWidth = width found in figma
  // actualheight = height found in figma
  // TODO: this function calculates dynamic height responsive for any device for any platform based on ratio
  const aspectRatio = actualHeight / actualWidth;
  return actualWidth * aspectRatio;
}
