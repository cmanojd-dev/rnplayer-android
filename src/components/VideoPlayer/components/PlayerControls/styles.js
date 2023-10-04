import { Platform, StatusBar, StyleSheet } from 'react-native';
import { moderateScaling } from '@utils/styleHelper';

const styles = StyleSheet.create({
  controlsOverlayContainer: {
    flex: 1,
  },
  controlsInnerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0A80',
  },
  fullScreenSurroundSpace: {
    ...Platform.select({
      ios: {
        paddingHorizontal: moderateScaling(20),
      },
      android: {
        paddingHorizontal: StatusBar.currentHeight,
      },
    }),
  },
  airplayBtn: {
    width: moderateScaling(35),
    height: moderateScaling(30),
    marginRight: moderateScaling(3),
  },
  topControlContainer: {
    paddingHorizontal: moderateScaling(16),
    paddingTop: moderateScaling(10),
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  nextPrevButton: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginHorizontal: moderateScaling(10),
  },
  downButton: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    transform: [{ rotate: '270deg' }],
  },
  iconStyle: {
    fontSize: moderateScaling(22),
    color: '#FFFFFF',
  },
  iconStyleResize: {
    fontSize: moderateScaling(17),
    color: '#FFFFFF',
  },
  bitRateIcon: {
    fontSize: moderateScaling(22),
    color: '#FFFFFF',
    ...Platform.select({
      android: {
        marginHorizontal: moderateScaling(4),
      },
    }),
  },
  playbackSpeedButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScaling(5),
    paddingVertical: moderateScaling(2),
  },
  playbackText: {
    // fontFamily: fontType.sofiaBold,
    fontSize: moderateScaling(13),
    lineHeight: moderateScaling(17),
    color: '#FFFFFF',
  },
  playerControlsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    // width: moderateScaling(250),
    zIndex: 1,
  },
  jumpIcon: {
    fontSize: moderateScaling(30),
    color: 'white',
  },
  playIcon: {
    fontSize: moderateScaling(40),
    color: 'white',
    paddingHorizontal: moderateScaling(15),
    marginLeft: moderateScaling(5),
  },
  castIcon: {
    width: moderateScaling(25),
    height: moderateScaling(25),
    ...Platform.select({
      android: {
        marginRight: moderateScaling(9),
      },
    }),
  },
  seekBarContainer: {
    alignSelf: 'flex-end',
  },
  progressText: {
    // fontFamily: fontType.sofiaRegular,
    fontSize: moderateScaling(12),
    lineHeight: moderateScaling(15),
    color: 'white',
  },
  bottomContainer: {
    width: '100%',
    alignSelf: 'flex-end',
    zIndex: 1,
  },
  bottomControlContainer: {
    paddingHorizontal: moderateScaling(16),
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: moderateScaling(5),
    zIndex: 1,
  },
  sliderStyle: {
    paddingHorizontal: moderateScaling(16),
  },
  leftMargin: {
    marginLeft: moderateScaling(10),
  },
  audioIcon: {
    fontSize: moderateScaling(22),
    color: '#FFFFFF',
    marginRight: moderateScaling(4),
  },
  disableIcon: {
    fontSize: moderateScaling(30),
    color: '#FFFFFF66',
  },
  settingsIcon: {
    fontSize: moderateScaling(21),
    color: '#000000',
  },
  shrinkButton: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginRight: moderateScaling(10),
  },
});

export default styles;
