import React from 'react';
import {View, Dimensions} from 'react-native';
import {inject, observer} from 'mobx-react';

import VideoPlayer from '@videoPlayer';

import styles from './styles';
import {Button, Text} from 'native-base';

@inject('videoStore')
@observer
class PlayerComponent extends React.PureComponent {
  render() {
    const {videoStore} = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Button onPress={videoStore.openPlayer}>Open Player</Button>
        </View>
        {videoStore.isPlayerVisible && (
          <VideoPlayer
            renderScrollContainer={<Text color={'white'}>Done Bhai Manoj</Text>}
          />
        )}
      </View>
    );
  }
}

export default PlayerComponent;
