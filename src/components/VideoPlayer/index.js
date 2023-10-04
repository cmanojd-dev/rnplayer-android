/* eslint-disable no-shadow */
import React from 'react';
import {
  Animated,
  DeviceEventEmitter,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import {action, makeObservable, observable, toJS} from 'mobx';
import {inject, observer} from 'mobx-react';
import {get, isEmpty} from 'lodash';
// import {getStatusBarHeight} from 'react-native-iphone-x-helper';

import Video, {TextTrackType} from 'react-native-video';
import VideoResizeMode from 'react-native-video/VideoResizeMode';
import Orientation, {
  OrientationLocker,
  LANDSCAPE,
} from 'react-native-orientation-locker';
// import ImmersiveMode from 'react-native-immersive-mode';
// import AndroidPip from 'react-native-android-pip';

// import { HomeIndicator } from 'react-native-home-indicator';

import PlayerControls from '@playerControls';

import {
  screenWidth,
  screenHeight,
  appPadding,
  videoScale,
  isTab,
  xEndRange,
  videoWidth,
  videoHeight,
  dynamicIsland,
  hasNotchTop,
  iphoneXTopPadding,
  interpolateFloorValue,
  extrapolate,
  useNativeDriver,
} from './constants';

import styles from './styles';
// import {
//   destroyAudioControls,
//   musicControlsInit,
//   setNowPlayingAudioData,
//   updateProgress,
// } from './musicUtils';

const {width, height} = {width: screenWidth, height: screenHeight};

@inject('videoStore')
@observer
class VideoPlayer extends React.PureComponent {
  @observable playerState = {
    isLoading: true,
    widthX: videoWidth,
    heightX: videoHeight,
    currentVideoDuration: 0,
    currentPosition: 0,
  };
  @observable enableCloseAnimation = false;
  @observable panResponder = null;

  constructor(props) {
    super(props);
    makeObservable(this);
    const {videoStore} = this.props;

    this._y = 0;
    this.heightAnimation = new Animated.Value(0);
    this.heightAnimation.addListener(({value}) => {
      this._y = value;
    });

    this._x = 0;
    this.closeAnimation = new Animated.Value(0);
    this.closeAnimation.addListener(({value}) => {
      this._x = value;
    });

    videoStore.setVideoDetails();

    if (videoStore.disallowPlayerMinimization) {
      return;
    }
    this.setCloseAnimationStatus(true);

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const {videoStore} = this.props;
        const {dx, dy} = gestureState;
        if (videoStore.isFullScreen) {
          return false;
        } else {
          if (
            videoStore.isMinimized &&
            (gestureState.dx > 2 || gestureState.dx < -2) &&
            (gestureState.dy > 14 || gestureState.dy < -14)
          ) {
            this.setCloseAnimationStatus(false);
            return true;
          } else if (
            videoStore.isMinimized &&
            (gestureState.dx > 2 || gestureState.dx < -2)
          ) {
            this.setCloseAnimationStatus(true);
            return true;
          }
        }
        return dx > 10 || dx < -10 || dy > 10 || dy < -10;
      },
      onPanResponderMove: (e, gestureState) => {
        this.enableCloseAnimation
          ? Animated.event(
              [
                null,
                {
                  dx: this.closeAnimation,
                },
              ],
              {useNativeDriver: false},
            )(e, gestureState)
          : Animated.event(
              [
                null,
                {
                  dy: this.heightAnimation,
                },
              ],
              {useNativeDriver: false},
            )(e, gestureState);
      },
      onPanResponderRelease: (e, gestureState) => {
        const {videoStore} = this.props;
        if (this.enableCloseAnimation) {
          if (gestureState.dx < 100 && gestureState.dx > -100) {
            Animated.timing(this.closeAnimation, {
              toValue: 0,
              duration: 300,
              useNativeDriver,
            }).start();
          } else {
            videoStore.setPlayerVisible(false);
          }
          this.setCloseAnimationStatus(false);
          return;
        } else if (gestureState.dy > 100) {
          this.minimizeVideoAnimation();
          this.heightAnimation.setOffset(300);
        } else {
          this.heightAnimation.setOffset(0);
          this.maximizeVideoAnimation();
        }
      },
    });
  }

  @action
  setCloseAnimationStatus = value => {
    this.enableCloseAnimation = value;
  };

  componentDidMount() {
    const {videoStore} = this.props;
    // musicControlsInit();
    videoStore.setVideoWidth(videoWidth);
    videoStore.setVideoHeight(videoHeight);
    videoStore.setFullScreenFlag(false);
    this.setCloseAnimationStatus(false);
    // this.setStatusBarListener();
    // Orientation.addDeviceOrientationListener(this.orientationDidChange);
    OrientationLocker.lockToLandscape;
    // if (Platform.OS === 'android') {
    //   this.setPipHandler();
    //   AndroidPip.enableAutoPipSwitch();
    //   AndroidPip.configureAspectRatio(16, 9);
    // }
  }

  setPipHandler = () => {
    this.pipListener = DeviceEventEmitter.addListener(
      'PIP_MODE_CHANGE',
      event => {
        if (!isEmpty(event)) {
          const {videoStore} = this.props;
          const isEnabled = get(event, 'isEnabled');
          const isStopPlaying = get(event, 'isStopPlaying');
          videoStore.setIsPipEnabled(Boolean(isEnabled));
          this.togglePipMode(Boolean(isStopPlaying));
        }
      },
    );
  };

  @action
  togglePipMode = isStopPlaying => {
    const {videoStore} = this.props;
    if (videoStore.isPipEnabled) {
      Orientation.lockToPortrait();
      this.playerState.heightX = '100%';
      this.playerState.widthX = '100%';
    } else {
      this.setVideoNormalScreen();
      videoStore.setPlayingState(!isStopPlaying);
    }
  };

  componentWillUnmount() {
    this.setCloseAnimationStatus(false);
    this.panResponder = null;
    // this.pipListener && this.pipListener.remove();
    this.closeAnimation && this.closeAnimation.removeAllListeners();
    this.heightAnimation && this.heightAnimation.removeAllListeners();
    this.resetAnimation();
    this.removeStatusBarListener();
    Orientation.removeDeviceOrientationListener(this.orientationDidChange);
    // if (Platform.OS === 'android') {
    //   AndroidPip.disableAutoPipSwitch();
    // }
    // destroyAudioControls();
  }

  resetAnimation = () => {
    this._y = 0;
    this.heightAnimation = new Animated.Value(0);
    this.heightAnimation.addListener(({value}) => {
      this._y = value;
    });

    this._x = 0;
    this.closeAnimation = new Animated.Value(0);
    this.closeAnimation.addListener(({value}) => {
      this._x = value;
    });
  };

  minimizeVideoAnimation = () => {
    const {videoStore} = this.props;
    if (videoStore.isFullScreen) {
      return false;
    }

    Animated.timing(this.heightAnimation, {
      toValue: 300,
      duration: 200,
      useNativeDriver,
    }).start(() => {
      videoStore.minimizeVideoPlayer();
      this.heightAnimation.setOffset(300);
    });
  };

  maximizeVideoAnimation = () => {
    const {videoStore} = this.props;
    Animated.timing(this.heightAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver,
    }).start(() => {
      this.heightAnimation.setOffset(0);
      videoStore.maximizeVideoPlayer();
    });
  };

  onVideoViewLayoutChange = event => {
    const {videoStore} = this.props;
    if (videoStore.isMinimized) {
      return true;
    }
    let {width, height} = event.nativeEvent.layout;
    let isLandscape = width > height;
    if (isLandscape) {
      videoStore.setVideoWidth(width);
      videoStore.setVideoHeight(height);
      videoStore.setVideoTopPadding(false);
      videoStore.setFullScreenFlag(true);
    } else {
      videoStore.setVideoWidth(width);
      videoStore.setVideoHeight(width * 0.5625);
      videoStore.setVideoTopPadding(true);
      videoStore.setFullScreenFlag(false);
    }
  };

  @action
  orientationDidChange = orientation => {
    const {videoStore} = this.props;
    if (orientation === 'UNKNOWN') {
      return;
    }
    if (
      !videoStore.isFullScreen &&
      (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT')
    ) {
      this.setVideoFullScreen();
      if (orientation === 'LANDSCAPE-LEFT') {
        Orientation.lockToLandscapeLeft();
      } else {
        Orientation.lockToLandscapeRight();
      }
    } else if (orientation === 'PORTRAIT') {
      this.setVideoNormalScreen();
    }
  };

  @action
  onVideoLoadStart = () => {
    this.playerState.isLoading = true;
  };

  @action
  onVideoLoad = event => {
    const {videoStore} = this.props;
    if (!isEmpty(event)) {
      const duration = get(event, 'duration', 0) || 0;
      this.playerState.currentVideoDuration = duration;
      this.playerState.currentPosition = 0;

      // console.log('EVENT::', event);

      // setNowPlayingAudioData({
      //   title: get(videoStore, 'videoDetails.title'),
      //   artwork: get(videoStore, 'videoDetails.thumbnail'),
      //   artist: '',
      //   album: '',
      //   genre: 'Video',
      //   duration: get(event, 'duration', 0),
      //   description: '',
      //   colorized: true,
      //   date: new Date().toString(),
      // });

      // TODO:: Needs to be reviewed for better performance
      videoStore.setVideoPlayingProgress(duration, true);

      const audioTracks = get(event, 'audioTracks', []) || [];
      videoStore.setAudioTracks(audioTracks);

      if (!videoStore.overrideSubTitles && videoStore.isHlsVideoUrl) {
        const textTracks = get(event, 'textTracks', []) || [];
        videoStore.setSubTitleTracks(textTracks);
      }

      if (videoStore.overrideVideoQuality) {
        const videoTracks = get(event, 'videoTracks', []) || [];
        videoStore.setVideoTracks(videoTracks);
      }

      this.playerState.isLoading = false;
    }
    videoStore.setPlayerControls(false);
  };

  onVideoBuffer = e => {
    console.log('\n\n Buffering \n\n', e);
  };

  onVideoError = error => {
    console.log('ERROR1::', error);
  };

  @action
  onVideoProgress = event => {
    // console.log('event', event, Platform.OS);
    // TODO:: Needs to be reviewed for better performance
    const {videoStore} = this.props;
    if (!isEmpty(event)) {
      const position = get(event, 'currentTime') || 0;
      this.playerState.currentPosition = position;

      // updateProgress(get(event, 'currentTime', 0), videoStore.isPlaying);
      // TODO:: Needs to be reviewed for better performance
      videoStore.setVideoPlayingProgress(position);
    }
  };

  onExternalPlaybackChange = event => {
    try {
      if (Platform.OS === 'ios') {
        const {videoStore} = this.props;
        const isExternalPlaybackActive = get(event, 'isExternalPlaybackActive');
        videoStore.setAirplay(isExternalPlaybackActive);
      }
    } catch (error) {}
  };

  onToggleFullScreen = () => {
    const {videoStore} = this.props;
    if (!videoStore.isFullScreen) {
      this.setVideoFullScreen();
    } else {
      this.setVideoNormalScreen();
    }
  };

  @action
  setVideoFullScreen = () => {
    const {videoStore} = this.props;
    videoStore.setFullScreenFlag(true);
    Orientation.lockToLandscape();
    this.playerState.heightX = width;
    this.playerState.widthX = height;
    StatusBar.setHidden(true);
    // ImmersiveMode.fullLayout(true);
    // ImmersiveMode.setBarMode('Full');
    // this.setStatusBarListener();
  };

  @action
  setVideoNormalScreen = () => {
    const {videoStore} = this.props;
    videoStore.setFullScreenFlag(false);
    Orientation.lockToPortrait();
    this.playerState.heightX = videoHeight;
    this.playerState.widthX = videoWidth;
    StatusBar.setHidden(false);
    // ImmersiveMode.fullLayout(false);
    // ImmersiveMode.setBarMode('Normal');
    this.removeStatusBarListener();
  };

  setStatusBarListener = () => {
    const {videoStore} = this.props;
    // this.listen = ImmersiveMode.addEventListener(e => {
    //   if (e && e.navigationBottomBar && e.navigationBottomBar === true) {
    //     setTimeout(() => {
    //       if (videoStore.isFullScreen) {
    //         ImmersiveMode.fullLayout(true);
    //         ImmersiveMode.setBarMode('Full');
    //       }
    //     }, 8000);
    //   }
    // });
  };

  removeStatusBarListener = () => {
    // if (this.listen) {
    //   this.listen.remove();
    // }
    // StatusBar.setHidden(false);
    // ImmersiveMode.fullLayout(false);
    // ImmersiveMode.setBarMode('Normal');
  };

  onScreenTouch = () => {
    const {videoStore} = this.props;
    if (videoStore && videoStore.isMinimized) {
      this.heightAnimation.setOffset(0);
      this.maximizeVideoAnimation();
    }
  };

  onReceiveAdEvent = event => {
    const {videoStore} = this.props;
    console.log('ADS-EVENT::', event, Platform.OS);
    switch (get(event, 'event')) {
      case 'STARTED':
        videoStore.setIsAdPlaying(true);
        break;
      case 'COMPLETED':
      case 'SKIPPED':
      case 'ALL_ADS_COMPLETED':
        // destroyAudioControls();
        videoStore.setIsAdPlaying(false);
        // setNowPlayingAudioData({
        //   title: get(videoStore, 'videoDetails.title'),
        //   artwork: get(videoStore, 'videoDetails.thumbnail'),
        //   artist: '',
        //   album: '',
        //   genre: 'Video',
        //   duration: get(videoStore, 'currentVideoDuration', 0),
        //   description: '',
        //   colorized: true,
        //   date: new Date().toString(),
        //   elapsedTime: get(videoStore, 'currentPosition'),
        // });
        break;
    }
  };

  onRestoreUserInterfaceForPictureInPictureStop = () => {
    const {videoStore} = this.props;
    if (videoStore.playerRef) {
      videoStore.playerRef.restoreUserInterfaceForPictureInPictureStopCompleted(
        true,
      );
    }
  };

  onVideoEnd = () => {
    const {videoStore} = this.props;
    videoStore.onVideoEnd();
  };

  // https://multiplatform-f.akamaihd.net/i/multi/april11/sintel/sintel-hd_,512x288_450_b,640x360_700_b,768x432_1000_b,1024x576_1400_m,.mp4.csmil/master.m3u8
  // https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4

  render() {
    console.log('\n\n Bhai URL\n\n', get(videoStore, 'videoDetails'));
    console.log(
      '\n\n Video Store is\n\n',
      this.props.videoStore.videoDetails.uri,
    );
    const {videoStore, renderScrollContainer} = this.props;

    const translateYEnd =
      screenHeight -
      videoStore.videoHeight +
      (videoStore.videoHeight * 0.25) / 4 -
      appPadding * 3 -
      (hasNotchTop ? iphoneXTopPadding : appPadding) -
      (isTab ? -appPadding : 0);

    const translateYInterpolate = this.heightAnimation.interpolate({
      inputRange: [0, interpolateFloorValue],
      outputRange: [0, translateYEnd],
      extrapolate,
    });

    const scaleInterpolate = this.heightAnimation.interpolate({
      inputRange: [0, interpolateFloorValue],
      outputRange: [1, videoScale],
      extrapolate,
    });

    const translateXInterpolate = this.heightAnimation.interpolate({
      inputRange: [0, interpolateFloorValue],
      outputRange: [0, xEndRange],
      extrapolate,
    });

    const opacityCloseInterpolate = this.closeAnimation.interpolate({
      inputRange: [-interpolateFloorValue, -100, 0, 100, interpolateFloorValue],
      outputRange: [0, 0, 1, 0, 0],
    });

    const translateXCloseInterpolate = this.closeAnimation.interpolate({
      inputRange: [-interpolateFloorValue, 0, interpolateFloorValue],
      outputRange: [-screenWidth, 0, screenWidth],
      extrapolate,
    });

    const videoStyles = {
      opacity: opacityCloseInterpolate,
      transform: [
        {
          translateY: translateYInterpolate,
        },
        {
          translateX: this.enableCloseAnimation
            ? Animated.add(translateXCloseInterpolate, translateXInterpolate)
            : translateXInterpolate,
        },
        {
          scale: scaleInterpolate,
        },
      ],
    };

    const finalVideoHeight = videoStore.videoHeight;
    const applyTopMargin = videoStore.isFullScreen ? 0 : 5;
    // const applyTopMargin = videoStore.isFullScreen
    //   ? 0
    //   : Platform.OS === 'android'
    //   ? 0
    //   : hasNotchTop
    //   ? dynamicIsland
    //     ? appPadding * 2.7
    //     : getStatusBarHeight(true)
    //   : dynamicIsland
    //   ? appPadding * 2.7
    //   : getStatusBarHeight();

    const {widthX, heightX} = this.playerState;
    const pointerEvents = 'box-none';

    const opacityInterpolate = this.heightAnimation.interpolate({
      inputRange: [0, interpolateFloorValue],
      outputRange: [1, 0],
    });

    const translateScrollYInterpolate = this.heightAnimation.interpolate({
      inputRange: [0, interpolateFloorValue],
      outputRange: [0, translateYEnd + appPadding * 2],
      extrapolate: 'clamp',
    });

    const scrollStyles = {
      opacity: opacityInterpolate,
      transform: [
        {
          translateY: translateScrollYInterpolate,
        },
      ],
    };

    const textTracks = videoStore.isHlsVideoUrl
      ? undefined
      : toJS(videoStore.subTitleTextTracks);

    return (
      <Animated.View
        style={StyleSheet.absoluteFill}
        pointerEvents={pointerEvents}>
        <View
          style={styles.container}
          onLayout={this.onVideoViewLayoutChange}
          pointerEvents={pointerEvents}>
          {!isEmpty(videoStore.videoDetails) && (
            <Animated.View
              style={[
                styles.videoStyleBg,
                {width: videoStore.videoWidth, height: finalVideoHeight},
                videoStyles,
                {marginTop: applyTopMargin},
              ]}
              {...this.panResponder.panHandlers}>
              <Video
                source={{
                  // uri: get(videoStore, 'videoDetails.uri'),
                  uri: this.props.videoStore.videoDetails.uri,
                  // type: 'm3u8',
                  // uri: 'https://iandevlin.github.io/mdn/video-player-with-captions/video/sintel-short.mp4',
                }}
                style={{width: widthX, height: heightX}}
                ref={ref => {
                  videoStore.setPlayerRef(ref);
                }}
                poster={get(videoStore, 'videoDetails.thumbnail')}
                posterResizeMode={VideoResizeMode.cover}
                controls={false}
                paused={!videoStore.isPlaying}
                rate={videoStore.playBackRate}
                pictureInPicture={true}
                preventsDisplaySleepDuringVideoPlayback={true}
                playInBackground={true}
                progressUpdateInterval={1000}
                minLoadRetryCount={100}
                ignoreSilentSwitch={'ignore'}
                resizeMode={videoStore.videoResizeMode}
                muted={videoStore.muted}
                maxBitRate={videoStore.bitRate}
                selectedTextTrack={toJS(videoStore.selectedTextTrack)}
                // selectedTextTrack={{type: 'language', value: 'en'}}
                selectedVideoTrack={toJS(videoStore.selectedVideoTrack)}
                selectedAudioTrack={toJS(videoStore.selectedAudioTrack)}
                textTracks={textTracks}
                onLoadStart={this.onVideoLoadStart}
                onLoad={this.onVideoLoad}
                onBuffer={this.onVideoBuffer}
                onError={this.onVideoError}
                onProgress={this.onVideoProgress}
                onExternalPlaybackChange={this.onExternalPlaybackChange}
                onRestoreUserInterfaceForPictureInPictureStop={
                  this.onRestoreUserInterfaceForPictureInPictureStop
                }
                onEnd={this.onVideoEnd}
                adTagUrl={get(videoStore, 'videoDetails.adUrl')}
                onReceiveAdEvent={this.onReceiveAdEvent}
              />
              {!videoStore.isAdPlaying && !videoStore.isPipEnabled && (
                <View
                  style={[
                    styles.controlContainer,
                    {
                      width: widthX,
                      height: heightX,
                    },
                  ]}>
                  <PlayerControls
                    minimizeVideoAnimation={this.minimizeVideoAnimation}
                    onToggleFullScreen={this.onToggleFullScreen}
                    onScreenTouch={this.onScreenTouch}
                    playerState={this.playerState}
                  />
                </View>
              )}
            </Animated.View>
          )}
          <Animated.ScrollView
            style={{
              ...styles.container,
              ...styles.videoStyleBg,
              ...scrollStyles,
            }}>
            {renderScrollContainer ? renderScrollContainer : null}
          </Animated.ScrollView>
        </View>
        {/* <HomeIndicator autoHidden /> */}
      </Animated.View>
    );
  }
}

VideoPlayer.propTypes = {
  containerStyle: PropTypes.object,
};

export default VideoPlayer;
