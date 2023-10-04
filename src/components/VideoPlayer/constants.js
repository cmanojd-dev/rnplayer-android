import { Dimensions, Platform } from 'react-native';
import { isTablet, hasNotch, hasDynamicIsland } from 'react-native-device-info';
import { moderateScaling } from '@utils/styleHelper';

const touchSize = moderateScaling(10);
export const ICON_HIT_SLOP = {
  top: touchSize,
  bottom: touchSize,
  left: touchSize,
  right: touchSize,
};

export const useNativeDriver = Platform.OS === 'ios';

export const interpolateFloorValue = 300;
export const extrapolate = 'clamp';

export const SKIP_SEC = 30;

export const isTab = isTablet();
export const hasNotchTop = hasNotch();
export const dynamicIsland = hasDynamicIsland();

export const videoScale = 0.5;

export const prioritizesVideoDevices = true;
export const preloadTime = 120;

export const appPadding = moderateScaling(20);
export const iphoneXTopPadding = appPadding + touchSize;

export const { width: screenWidth, height: screenHeight } =
  Dimensions.get('screen');

export const videoWidth = screenWidth;
export const videoHeight = screenWidth * 0.5625;

export const xEndRange =
  (screenWidth * videoScale) / 2 - (isTab ? -appPadding : appPadding);

export const MUSIC_CONTROLS = 'MUSIC_CONTROLS';
export const NOTIFICATION_CONTROLS = {
  REMOTE_PLAY: 'remote_play',
  REMOTE_PAUSE: 'remote_pause',
  REMOTE_SKIP_FORWARD: 'remote_skip_forward',
  REMOTE_SEEK: 'REMOTE_SEEK',
  REMOTE_SKIP_BACKWARD: 'remote_skip_backward',
  REMOTE_SKIP_NEXT: 'remote_skip_next',
  REMOTE_SKIP_PREV: 'remote_skip_prev',
};

export const SETTINGS_CONTROLS_KEY = {
  VIDEO_QUALITY: 'VIDEO_QUALITY',
  PLAYBACK_AUDIO: 'PLAYBACK_AUDIO',
  SUBTITLES: 'SUBTITLES',
  PLAYBACK_SPEED: 'PLAYBACK_SPEED',
};

export const SETTINGS_CONTROLS = [
  {
    name: 'Video Quality',
    icon: 'video',
    activeIcon: 'video',
    itemKey: SETTINGS_CONTROLS_KEY.VIDEO_QUALITY,
    isShowIcon: true,
  },
  {
    name: 'Playback Audio',
    icon: 'unmute',
    activeIcon: 'unmute',
    itemKey: SETTINGS_CONTROLS_KEY.PLAYBACK_AUDIO,
    isShowIcon: true,
  },
  {
    name: 'Subtitles',
    icon: 'cc-inactive',
    activeIcon: 'cc-active',
    itemKey: SETTINGS_CONTROLS_KEY.SUBTITLES,
    isShowIcon: true,
  },
  {
    name: 'Playback Speed',
    icon: '',
    activeIcon: '',
    itemKey: SETTINGS_CONTROLS_KEY.PLAYBACK_SPEED,
    isShowIcon: false,
  },
];
