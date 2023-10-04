import React from 'react';
import {Platform, Pressable} from 'react-native';
import {HStack, Text, VStack, View, Actionsheet} from 'native-base';
import {action, makeObservable, observable} from 'mobx';
import {inject, observer} from 'mobx-react';

import {get, head, isEmpty, isNumber} from 'lodash';

// import AirPlayButton from 'react-native-airplay-button';
// import GoogleCast, {
//   CastButton,
//   CastContext,
//   CastState,
//   MediaPlayerState,
//   SessionManager,
// } from 'react-native-google-cast';

import SeekBar from '@seekBar';
import ButtonIcon from '@buttonIcon';
import AnimatedHideView from '@animatedHideView';

import {
  ICON_HIT_SLOP,
  prioritizesVideoDevices,
  MUSIC_CONTROLS,
  NOTIFICATION_CONTROLS,
  SKIP_SEC,
} from '@videoPlayer/constants';
import {formatTime, toTitleCase, formatCastMediaList} from '@videoPlayer/utils';

import styles from './styles';
import {EventRegister} from 'react-native-event-listeners';
import {
  updateProgress,
  setMusicPlay,
  setNowPlayingAudioData,
  destroyAudioControls,
} from '@videoPlayer/musicUtils';
import Settings from './Settings';

let isCastPlaying = true;

@inject('videoStore')
@observer
class PlayerControls extends React.PureComponent {
  // @observable manager = new SessionManager();
  @observable currentPlayingMedia = {};
  @observable toggleSettingsSheet = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      client: undefined,
    };
  }

  componentDidMount() {
    // this.castCustomListener();
    this.musicControlListener = EventRegister.addEventListener(
      MUSIC_CONTROLS,
      async data => {
        if (!isEmpty(data)) {
          const {toggle, state, doPlus = false} = data;
          const {videoStore} = this.props;

          if (state === NOTIFICATION_CONTROLS.REMOTE_SEEK) {
            if (data.position) {
              const position = parseInt(data.position, 10);
              this.onSeekComplete(position);
            }
          } else if (videoStore.isChromeCast && Platform.OS === 'ios') {
            this.handleMusicControls(data);
          } else if (
            state === NOTIFICATION_CONTROLS.REMOTE_SKIP_NEXT ||
            state === NOTIFICATION_CONTROLS.REMOTE_SKIP_PREV
          ) {
            videoStore.onChangeVideo(
              state === NOTIFICATION_CONTROLS.REMOTE_SKIP_NEXT,
            );
          } else {
            if (toggle) {
              videoStore.setPlayingState(
                state === NOTIFICATION_CONTROLS.REMOTE_PLAY,
              );
            } else {
              videoStore.onSkipVideoSeconds(doPlus);
            }
          }
        }
      },
    );
  }

  handleMusicControls = async data => {
    const {toggle, state, doPlus = false} = data;
    const {videoStore} = this.props;
    const {client} = this.state;

    if (videoStore.isChromeCast && !isEmpty(client)) {
      const streamPosition = await client.getStreamPosition();
      switch (state) {
        case NOTIFICATION_CONTROLS.REMOTE_PLAY:
          toggle && (await client.play());
          break;

        case NOTIFICATION_CONTROLS.REMOTE_PAUSE:
          toggle && (await client.pause());
          break;

        case NOTIFICATION_CONTROLS.REMOTE_SKIP_NEXT:
          await client.queueNext();
          break;

        case NOTIFICATION_CONTROLS.REMOTE_SKIP_PREV:
          await client.queuePrev();
          break;

        case NOTIFICATION_CONTROLS.REMOTE_SKIP_FORWARD:
        case NOTIFICATION_CONTROLS.REMOTE_SKIP_BACKWARD:
          const duration = doPlus
            ? parseInt(streamPosition + SKIP_SEC, 10)
            : parseInt(streamPosition - SKIP_SEC, 10);
          duration > 0 && this.onSeekComplete(duration);
          break;

        default:
          break;
      }
    }
  };

  componentWillUnmount() {
    // this.stopCast();
    this.startedListener && this.startedListener.remove();
    // this.castStateListener && this.castStateListener.remove();
    this.endedListener && this.endedListener.remove();
    this.startFailedListener && this.startFailedListener.remove();
    this.suspendedListener && this.suspendedListener.remove();
    if (this.musicControlListener) {
      EventRegister.removeEventListener(this.musicControlListener);
    }
  }

  // stopCast = async () => {
  //   try {
  //     this.manager && (await this.manager.endCurrentSession(true));
  //     this.state.client &&
  //       this.state.client.stop &&
  //       (await this.state.client.stop());
  //   } catch (error) {}
  // };

  // castCustomListener = () => {
  //   const {videoStore} = this.props;
  //   this.castStateListener = CastContext.onCastStateChanged(castState => {
  //     videoStore.changeCastState(castState);
  //     if (
  //       castState === CastState.CONNECTING ||
  //       castState === CastState.CONNECTED
  //     ) {
  //       videoStore.setPlayingState(false);
  //       videoStore.setChromeCastState(true);
  //       if (castState === CastState.CONNECTED) {
  //         // setTimeout(() => {
  //         //   this.openCastControls();
  //         // }, 4000);
  //       }
  //     } else {
  //       videoStore.setChromeCastState(false);
  //     }
  //   });
  //   this.startedListener = this.manager.onSessionStarted(session => {
  //     this.setState({client: session.client}, () => {
  //       this.setCastVideo();
  //     });
  //   });
  //   this.endedListener = this.manager.onSessionEnded(() => {
  //     this.resetVideoPlayer(videoStore.currentPosition);
  //   });
  //   this.startFailedListener = this.manager.onSessionStartFailed(() => {
  //     this.resetVideoPlayer();
  //   });
  //   this.suspendedListener = this.manager.onSessionSuspended(() => {
  //     this.resetVideoPlayer();
  //   });
  // };

  // openCastDialog = () => {
  //   GoogleCast.showCastDialog();
  // };

  // openCastControls = () => {
  //   GoogleCast.showExpandedControls();
  // };

  @action
  updateNowPlayingWithCast = dataObj => {
    const {videoStore} = this.props;
    if (!isEmpty(dataObj)) {
      // const castPlayerState = get(
      //   dataObj,
      //   'playerState',
      //   // MediaPlayerState.IDLE,
      // );
      // videoStore.changeMediaPlayerState(castPlayerState);
      // if (
      //   castPlayerState === MediaPlayerState.PLAYING &&
      //   Platform.OS === 'ios'
      // ) {
      //   const mediaInfo = get(dataObj, 'mediaInfo');
      //   if (
      //     !isEmpty(mediaInfo) &&
      //     (isEmpty(this.currentPlayingMedia) ||
      //       this.currentPlayingMedia.mediaInfo.contentId !==
      //         mediaInfo.contentId)
      //   ) {
      //     destroyAudioControls();
      //     const id = get(dataObj, 'mediaInfo.contentId');
      //     videoStore.setCurrentPlayingIndex(id);
      //     this.currentPlayingMedia = dataObj;
      //     setNowPlayingAudioData({
      //       title: get(dataObj, 'mediaInfo.metadata.title'),
      //       artwork: get(dataObj, 'mediaInfo.metadata.images[0].url'),
      //       artist: '',
      //       album: '',
      //       genre: 'Video',
      //       duration: get(dataObj, 'mediaInfo.streamDuration', 0),
      //       description: '',
      //       colorized: true,
      //       date: new Date().toString(),
      //       elapsedTime: get(dataObj, 'streamPosition'),
      //     });
      //   }
      // }
    }
  };

  // onCastMediaProgressUpdated = position => {
  //   const {videoStore} = this.props;
  //   if (Platform.OS === 'ios') {
  //     if (
  //       videoStore.castMediaStatus === MediaPlayerState.PAUSED &&
  //       isCastPlaying
  //     ) {
  //       setMusicPlay(position);
  //       isCastPlaying = false;
  //     } else {
  //       isCastPlaying = true;
  //     }
  //     updateProgress(
  //       position,
  //       videoStore.castMediaStatus !== MediaPlayerState.PAUSED,
  //     );
  //   }
  //   videoStore.setVideoPlayingProgress(position, false);
  // };

  // setCastVideo = () => {
  //   try {
  //     const {videoStore} = this.props;
  //     if (this.state.client) {
  //       // ? Commented due to simplify and use same logic for both cases playlist videos & single video
  //       // const videoData = Array.isArray(videoStore.videoData) && videoStore.videoData.length > 1 ? videoStore.videoData : videoStore.videoDetails;

  //       const myCastMedia = formatCastMediaList(
  //         videoStore.videoData,
  //         videoStore.currentPlayingVideoIndex,
  //         videoStore.currentPosition,
  //       );
  //       if (!isEmpty(myCastMedia)) {
  //         this.state.client.loadMedia(myCastMedia);
  //       }
  //       this.state.client.onMediaPlaybackStarted(() => {
  //         videoStore.setPlayingState(false);
  //         videoStore.setChromeCastState(true);
  //         if (Platform.OS === 'ios') {
  //           setMusicPlay(videoStore.currentPosition);
  //         }
  //       });
  //       this.state.client.onMediaStatusUpdated(mediaStatus => {
  //         if (!isEmpty(mediaStatus)) {
  //           this.updateNowPlayingWithCast(mediaStatus);
  //         }
  //       });
  //       this.state.client.onMediaProgressUpdated(async streamPosition => {
  //         if (isNumber(streamPosition)) {
  //           this.onCastMediaProgressUpdated(streamPosition);
  //         }
  //       }, 1);
  //       this.state.client.onMediaPlaybackEnded(data => {
  //         if (data) {
  //           this.resetVideoPlayer();
  //         }
  //       });
  //     }
  //   } catch (error) {}
  // };

  @action
  resetVideoPlayer = (progress = 0) => {
    const {videoStore} = this.props;
    this.manager && this.manager.endCurrentSession(true);
    this.state.client && this.state.client.stop && this.state.client.stop();
    this.currentPlayingMedia = {};
    this.setState({client: undefined}, () => {
      destroyAudioControls();
      videoStore.onExternalPlaybackEnd(progress);
      setNowPlayingAudioData({
        title: get(videoStore, 'videoDetails.title'),
        artwork: get(videoStore, 'videoDetails.thumbnail'),
        artist: '',
        album: '',
        genre: 'Video',
        duration: get(videoStore, 'currentVideoDuration', 0),
        description: '',
        colorized: true,
        date: new Date().toString(),
        elapsedTime: get(videoStore, 'currentPosition'),
      });
    });
  };

  onSeekStart = () => {
    const {videoStore} = this.props;
    videoStore.onVideoSeekStart();
    videoStore.setControlVisibilityValue(true);
  };

  onSeekComplete = async seconds => {
    const {videoStore} = this.props;
    const {client} = this.state;
    const position = Array.isArray(seconds) ? head(seconds) : seconds;
    if (videoStore.isChromeCast && !isEmpty(client) && Platform.OS === 'ios') {
      await client.seek({position});
    } else {
      videoStore.onVideoSeekComplete(position);
      videoStore.setPlayerControls(true);
    }
  };

  onToggleControls = () => {
    const {videoStore, onScreenTouch} = this.props;
    const value = !videoStore.controlsVisible;
    onScreenTouch();
    videoStore.setPlayerControls(value);
  };

  onTapPrevButton = () => {
    const {videoStore} = this.props;
    if (!videoStore.isDisablePrev) {
      videoStore.onChangeVideo(false);
    }
  };

  onTapNextButton = () => {
    const {videoStore} = this.props;
    if (!videoStore.isDisableNext) {
      videoStore.onChangeVideo(true);
    }
  };

  @action
  ontoggleSettingsSheet = value => {
    this.toggleSettingsSheet = value;
  };

  render() {
    const {
      videoStore,
      playerState,
      minimizeVideoAnimation = () => {},
      onToggleFullScreen = () => {},
    } = this.props;
    let position = formatTime(Math.floor(playerState.currentPosition));
    position = position.includes('-') ? '00:00' : position;

    const duration = formatTime(
      Math.floor(playerState.currentVideoDuration) < 0
        ? 0
        : Math.floor(playerState.currentVideoDuration),
    );
    // const CastButtonCustom = () => (
    //   <Pressable
    //     // onPress={this.openCastDialog}
    //     style={styles.iconButton}>
    //     <CastButton
    //       pointerEvents={'none'}
    //       // eslint-disable-next-line react-native/no-inline-styles
    //       style={{
    //         ...styles.castIcon,
    //         tintColor: 'white',
    //       }}
    //     />
    //   </Pressable>
    // );
    // const AirPlayButtonCustom = () => (
    //   <AirPlayButton
    //     activeTintColor={'white'}
    //     tintColor={'grey'}
    //     prioritizesVideoDevices={prioritizesVideoDevices}
    //     style={[styles.iconButton, styles.airplayBtn]}
    //   />
    // );
    const pointerEvents = videoStore.controlsVisible ? 'auto' : 'none';
    return (
      <AnimatedHideView
        visible={videoStore.controlsVisible}
        onPress={this.onToggleControls}
        style={styles.controlsOverlayContainer}>
        {videoStore.isAirplay || videoStore.isChromeCast ? (
          <View
            justifyContent={'center'}
            style={[styles.controlsOverlayContainer]}>
            <View alignItems={'center'} alignSelf={'center'}>
              {videoStore.isAirplay ? (
                <>
                  <Text marginBottom={2} color={'white'}>
                    Connected on AirPlay
                  </Text>
                  {/* <AirPlayButtonCustom /> */}
                </>
              ) : (
                <>
                  <Text marginBottom={2} color={'white'}>
                    {/* {videoStore.castState === CastState.CONNECTED
                      ? 'Connected on Chromecast'
                      : toTitleCase(videoStore.castState)} */}
                  </Text>
                  {/* {videoStore.castState === CastState.CONNECTED ? (
                    <Text
                      marginBottom={4}
                      // onPress={this.openCastControls}
                      color={'white'}>
                      Click to open cast controls
                    </Text>
                  ) : null} */}
                  {/* <CastButtonCustom /> */}
                </>
              )}
            </View>
          </View>
        ) : (
          <VStack
            flexDirection={'column'}
            style={[
              styles.controlsInnerContainer,
              videoStore.isFullScreen && styles.fullScreenSurroundSpace,
            ]}>
            <HStack
              pointerEvents={pointerEvents}
              style={styles.topControlContainer}
              flexDirection={'row'}>
              {!videoStore.isFullScreen ? (
                <ButtonIcon
                  hitSlop={ICON_HIT_SLOP}
                  style={styles.downButton}
                  iconStyle={styles.iconStyleResize}
                  iconName={'left-arrow'}
                  onPress={minimizeVideoAnimation}
                />
              ) : (
                <View style={styles.downButton} />
              )}
              <HStack>
                {/* {videoStore.isFullScreen && (
                  <ButtonIcon
                    style={styles.shrinkButton}
                    iconStyle={styles.iconStyle}
                    iconName={
                      videoStore.videoResizeMode === 'contain'
                        ? 'enlarge'
                        : 'shrink'
                    }
                    onPress={videoStore.toggleResizeMode}
                  />
                )} */}
                <ButtonIcon
                  style={styles.iconButton}
                  iconStyle={styles.iconStyle}
                  iconName={videoStore.muted ? 'mute' : 'unmute'}
                  onPress={videoStore.toggleVolume}
                />
              </HStack>
            </HStack>
            <HStack
              pointerEvents={pointerEvents}
              style={styles.playerControlsContainer}
              flexDirection={'row'}>
              {videoStore.isShowNextPrev && (
                <ButtonIcon
                  hitSlop={ICON_HIT_SLOP}
                  style={styles.nextPrevButton}
                  iconStyle={[
                    styles.jumpIcon,
                    videoStore.isDisablePrev && styles.disableIcon,
                  ]}
                  iconName={'skip-backward'}
                  onPress={this.onTapPrevButton}
                />
              )}
              <ButtonIcon
                hitSlop={ICON_HIT_SLOP}
                style={styles.iconButton}
                iconStyle={styles.jumpIcon}
                iconName={'backward-30'}
                onPress={() => videoStore.onSkipVideoSeconds(false)}
              />
              <ButtonIcon
                style={styles.iconButton}
                iconStyle={styles.playIcon}
                iconName={videoStore.isPlaying ? 'pause' : 'play'}
                onPress={() =>
                  videoStore.setPlayingState(
                    !videoStore.isPlaying,
                    playerState.currentPosition,
                  )
                }
              />
              <ButtonIcon
                hitSlop={ICON_HIT_SLOP}
                style={styles.iconButton}
                iconStyle={styles.jumpIcon}
                iconName={'forward-30'}
                onPress={() => videoStore.onSkipVideoSeconds(true)}
              />
              {videoStore.isShowNextPrev && (
                <ButtonIcon
                  hitSlop={ICON_HIT_SLOP}
                  style={styles.nextPrevButton}
                  iconStyle={[
                    styles.jumpIcon,
                    videoStore.isDisableNext && styles.disableIcon,
                  ]}
                  iconName={'skip-forward'}
                  onPress={this.onTapNextButton}
                />
              )}
            </HStack>
            <View pointerEvents={pointerEvents} style={styles.bottomContainer}>
              <SeekBar
                currentTime={playerState.currentPosition}
                videoDuration={playerState.currentVideoDuration}
                onSeekStart={this.onSeekStart}
                onSeekComplete={this.onSeekComplete}
                sliderStyle={styles.sliderStyle}
                isFullScreen={videoStore.isFullScreen}
              />
              <HStack style={styles.bottomControlContainer}>
                <Text style={styles.progressText}>
                  {`${position} / ${duration}`}
                </Text>
                <HStack>
                  {/* <CastButtonCustom /> */}
                  {/* {Platform.OS === 'ios' && !videoStore.isChromeCast && (
                    <AirPlayButtonCustom />
                  )} */}
                  <ButtonIcon
                    style={styles.iconButton}
                    iconStyle={styles.iconStyle}
                    iconName={'settings'}
                    onPress={() => this.ontoggleSettingsSheet(true)}
                  />
                  {/* <ButtonIcon
                    style={styles.iconButton}
                    iconStyle={styles.audioIcon}
                    iconName={'unmute'}
                    onPress={this.onToggleAudioTracksSheet}
                  /> */}
                  {/* <ButtonIcon
                    style={styles.iconButton}
                    iconStyle={styles.bitRateIcon}
                    iconName={'video'}
                    onPress={this.onToggleVideoQualitySheet}
                  />  */}
                  <ButtonIcon
                    style={styles.playbackSpeedButton}
                    text={`${videoStore.playBackRate}x`}
                    textStyle={styles.playbackText}
                    onPress={videoStore.changePlaybackRate}
                  />
                  <ButtonIcon
                    style={[styles.iconButton, styles.leftMargin]}
                    iconStyle={styles.iconStyle}
                    iconName={
                      !isEmpty(videoStore.selectedTextTrack) &&
                      videoStore.selectedTextTrack.value !== 'off'
                        ? 'cc-active'
                        : 'cc-inactive'
                    }
                    onPress={this.onChangeSubTitle}
                  />
                  {/* <ButtonIcon
                    style={[styles.iconButton, styles.leftMargin]}
                    iconStyle={styles.iconStyle}
                    iconName={videoStore.isFullScreen ? 'minimize' : 'maximize'}
                    onPress={onToggleFullScreen}
                  /> */}
                </HStack>
              </HStack>
              <Settings
                isOpenSheet={this.toggleSettingsSheet}
                toggleSheet={this.ontoggleSettingsSheet}
              />
            </View>
          </VStack>
        )}
      </AnimatedHideView>
    );
  }
}

export default PlayerControls;
