import {Dimensions, PixelRatio, Platform} from 'react-native';
import {
  getBuildNumber,
  getUniqueId,
  getVersion,
  hasNotch,
  isTablet,
} from 'react-native-device-info';
import {getStatusBarHeight as getNewStatusBarHeight} from 'react-native-status-bar-height';
import {SOFT_MENU_BAR_HEIGHT, STATUS_BAR_HEIGHT} from './ExtraDimensions';

const {width, height} = Dimensions.get('window');
const ScreenViewSize = Dimensions.get('screen');

class DeviceInfo {
  static uniqueId = getUniqueId();
  static appVersion = getVersion();
  static buildNumber = getBuildNumber();

  static isTablet = isTablet();

  static notch = hasNotch();

  static platform = Platform.OS;
  static isIphone = Platform.OS === 'ios';
  static isAndroid = Platform.OS === 'android';

  static OSVersion = Platform.Version;

  static windowSize = {width, height};
  static screenSize = {
    width: ScreenViewSize.width,
    height: ScreenViewSize.height,
  };

  static windowSizeWithPixelRatio = {
    width: width * PixelRatio.get(),
    height: height * PixelRatio.get(),
  };

  static screenSizeWithPixelRatio = {
    width: ScreenViewSize.width * PixelRatio.get(),
    height: ScreenViewSize.height * PixelRatio.get(),
  };

  static guidelineBaseWidth = 320;
  static guidelineBaseHeight = 568;

  static getNewStatusBarHeight = getNewStatusBarHeight();

  static softBarHeight = SOFT_MENU_BAR_HEIGHT;
  static statusBarHeight = STATUS_BAR_HEIGHT;

  static isIphone5 = !!(
    Platform.OS === 'ios' &&
    height === this.guidelineBaseHeight &&
    width === this.guidelineBaseWidth
  );

  static isSmallDevice =
    height <= this.guidelineBaseHeight && width <= this.guidelineBaseWidth;
}

export default DeviceInfo;
