import {StyleSheet, Dimensions} from 'react-native';

// const windowHeight = Dimensions.get('window').height;
// const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
    backgroundColor: 'yellow',
  },
});

export default styles;
