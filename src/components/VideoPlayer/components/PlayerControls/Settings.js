import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Actionsheet } from 'native-base';
import { action, makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { capitalize, get, isEmpty, map } from 'lodash';

import CustomIcon from '@customIcon';
import SubTitles from '@subTitles';
import ActionSheetComponent from '@actionSheetComponent';
import {
  formatAudioTracksArray,
  formatVideoTracksArray,
} from '@videoPlayer/utils';
import {
  SETTINGS_CONTROLS,
  SETTINGS_CONTROLS_KEY,
} from '@videoPlayer/constants';
import styles from './styles';

@inject('videoStore')
@observer
class Settings extends Component {
  @observable toggleSubtitleSheet = false;
  @observable toggleVideoQuality = false;
  @observable toggleAudioTracksSheet = false;

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  @action
  onChangeSubTitle = () => {
    const { videoStore } = this.props;
    if (videoStore.subTitleTextTracks.length === 2) {
      videoStore.setSelectedTexTrack(
        get(videoStore, 'subTitleTextTracks[1]'),
        videoStore.selectedTextTrack.value !== '',
      );
    } else {
      this.toggleSubtitleSheet = !this.toggleSubtitleSheet;
    }
  };

  @action
  onToggleVideoQualitySheet = () => {
    this.toggleVideoQuality = !this.toggleVideoQuality;
  };

  onChangeVideoQuality = dataObj => {
    const { videoStore } = this.props;
    if (!isEmpty(dataObj)) {
      if (Platform.OS === 'android') {
        videoStore.setSelectedVideoTracks(dataObj);
      } else {
        const bitRate = get(dataObj, 'bitrate');
        videoStore.setBitRate(bitRate);
      }
      this.onToggleVideoQualitySheet();
    }
  };

  @action
  onToggleAudioTracksSheet = value => {
    this.toggleAudioTracksSheet = !this.toggleAudioTracksSheet;
  };

  onChangeAudioTrack = dataObj => {
    const { videoStore } = this.props;
    if (!isEmpty(dataObj)) {
      videoStore.setSelectedAudioTrack(dataObj);
      this.onToggleAudioTracksSheet();
    }
  };

  onPressItem = key => {
    const { toggleSheet = () => {}, videoStore } = this.props;
    toggleSheet(false);
    switch (key) {
      case SETTINGS_CONTROLS_KEY.SUBTITLES:
        this.onChangeSubTitle();
        break;
      case SETTINGS_CONTROLS_KEY.VIDEO_QUALITY:
        videoStore.isShowVideoQuality && this.onToggleVideoQualitySheet();
        break;
      case SETTINGS_CONTROLS_KEY.PLAYBACK_AUDIO:
        videoStore.isShowPlaybackAudio && this.onToggleAudioTracksSheet();
        break;
      case SETTINGS_CONTROLS_KEY.PLAYBACK_SPEED:
        videoStore.changePlaybackRate();
        break;
    }
  };

  renderIcon = iconName => {
    return <CustomIcon name={iconName} style={styles.settingsIcon} />;
  };

  renderControls = (dataObj, index) => {
    if (!isEmpty(dataObj)) {
      const { videoStore } = this.props;
      const { itemKey, isShowIcon } = dataObj;

      if (itemKey === SETTINGS_CONTROLS_KEY.SUBTITLES && isShowIcon) {
        const iconName =
          !isEmpty(videoStore.selectedTextTrack) &&
          videoStore.selectedTextTrack.value !== 'off'
            ? get(dataObj, 'activeIcon')
            : get(dataObj, 'icon');
        return (
          <Actionsheet.Item
            key={index}
            name={itemKey}
            startIcon={this.renderIcon(iconName)}
            onPress={() => this.onPressItem(itemKey)}>
            {capitalize(get(dataObj, 'name'))}
          </Actionsheet.Item>
        );
      } else {
        const iconName = get(dataObj, 'icon');
        return (
          <Actionsheet.Item
            key={index}
            name={itemKey}
            {...(isShowIcon && {
              startIcon: this.renderIcon(iconName),
            })}
            onPress={() => this.onPressItem(itemKey)}>
            {isShowIcon
              ? capitalize(get(dataObj, 'name'))
              : `${videoStore.playBackRate}x \u2022 ${capitalize(
                  get(dataObj, 'name'),
                )}`}
          </Actionsheet.Item>
        );
      }
    }
  };

  render() {
    const { isOpenSheet, videoStore, toggleSheet = () => {} } = this.props;
    return (
      <>
        <Actionsheet
          zIndex={1}
          size={videoStore.isFullScreen ? 'lg' : 'full'}
          isOpen={isOpenSheet}
          onClose={() => toggleSheet(false)}>
          <Actionsheet.Content alignSelf={'center'} maxHeight={'100%'}>
            {map(SETTINGS_CONTROLS, (obj, index) => {
              return this.renderControls(obj, index);
            })}
          </Actionsheet.Content>
        </Actionsheet>
        <SubTitles
          toggleSubtitleSheet={this.toggleSubtitleSheet}
          onToggleSheet={this.onChangeSubTitle}
        />
        <ActionSheetComponent
          isFullScreen={videoStore.isFullScreen}
          isOpenSheet={this.toggleVideoQuality}
          toggleSheet={this.onToggleVideoQualitySheet}
          title={'Select Video Quality'}
          optionData={formatVideoTracksArray(videoStore.videoTracks)}
          filterKey={Platform.OS === 'ios' ? 'bitrate' : 'height'}
          itemKey={'displayName'}
          selectionKey={'value'}
          selectedOption={videoStore.selectedVideoTrack}
          onSelectItem={this.onChangeVideoQuality}
        />

        <ActionSheetComponent
          isFullScreen={videoStore.isFullScreen}
          isOpenSheet={this.toggleAudioTracksSheet}
          toggleSheet={this.onToggleAudioTracksSheet}
          title={'Select Audio'}
          optionData={formatAudioTracksArray(videoStore.audioTracks)}
          filterKey={'title'}
          itemKey={'displayName'}
          selectionKey={'value'}
          selectedOption={videoStore.selectedAudioTrack}
          onSelectItem={this.onChangeAudioTrack}
        />
      </>
    );
  }
}

export default Settings;
