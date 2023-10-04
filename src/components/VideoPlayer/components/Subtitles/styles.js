import { StyleSheet } from 'react-native';
import { moderateScaling } from '@utils/styleHelper';

const styles = StyleSheet.create({
  titleText: {
    fontSize: moderateScaling(14),
    lineHeight: moderateScaling(17),
    color: 'black',
  },
  iconStyle: {
    color: '#163031',
    fontSize: moderateScaling(20),
  },
});

export default styles;
