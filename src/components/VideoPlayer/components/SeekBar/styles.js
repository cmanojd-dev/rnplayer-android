import { Platform, StyleSheet } from 'react-native';
import { moderateScaling } from '@utils/styleHelper';

const height = moderateScaling(5);
const defaultThumbSize = moderateScaling(12);
const thumbSize = defaultThumbSize + moderateScaling(5);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: moderateScaling(16),
    marginRight: moderateScaling(16),
    alignItems: 'stretch',
    justifyContent: 'center',
    zIndex: 1,
    marginBottom: moderateScaling(10),
  },
  slider: {
    width: '95%',
    marginBottom: moderateScaling(5),
  },
  track: {
    height: height,
    backgroundColor: '#47505F80',
    borderRadius: 10,
  },
  thumb: {
    ...Platform.select({
      android: {
        width: thumbSize,
        height: thumbSize,
        borderRadius: thumbSize / 2,
      },
      ios: {
        width: defaultThumbSize,
        height: defaultThumbSize,
        borderRadius: defaultThumbSize / 2,
      },
    }),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    shadowOpacity: 0.5,
  },
  thumbTouch: {
    width: moderateScaling(22),
    height: moderateScaling(22),
  },
});

export default styles;
