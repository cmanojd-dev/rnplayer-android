import {Animated} from 'react-native';
import {findIndex, get, isBoolean, isEmpty, parseInt} from 'lodash';
import {action, computed, makeObservable, observable} from 'mobx';
// import {CastState, MediaPlayerState} from 'react-native-google-cast';
import VideoResizeMode from 'react-native-video/VideoResizeMode';
// import {getStatusBarHeight} from 'react-native-iphone-x-helper';

import {
  screenHeight,
  SKIP_SEC,
  // iphoneXTopPadding,
  hasNotchTop,
  dynamicIsland,
  useNativeDriver,
  videoHeight,
  videoWidth,
} from './constants';
import {TextTrackType} from 'react-native-video';
import {fileExtension} from './utils';
// import {destroyAudioControls, setMusicPause, setMusicPlay} from './musicUtils';

class VideoStore {
  @observable isPlaying = true;
  @observable playBackRate = 1;
  @observable videoResizeMode = VideoResizeMode.cover;
  @observable currentVideoDuration = 0;
  @observable currentPosition = 0;
  @observable playerRef;
  @observable isFullScreen = false;
  @observable isBuffering = false;

  @observable isMinimized = false;
  @observable disallowPlayerMinimization = false;
  @observable slideUpFinished = true;
  @observable isPlayerVisible = false;

  @observable bounceValue = new Animated.Value(screenHeight);
  @observable videoHeight = videoHeight;
  @observable videoWidth = videoWidth;
  @observable videoTopPadding = 0;
  // hasNotchTop || dynamicIsland ? getStatusBarHeight(true) - 10 : 0;

  @observable subTitleTextTracks = [
    {
      title: 'off',
      language: '',
      type: TextTrackType.VTT,
      uri: '',
    },
    {
      title: 'English',
      language: 'en',
      type: TextTrackType.VTT,
      uri: 'https://video-services-dev.s3.amazonaws.com/public/elephants-dream-subtitles-en.vtt',
    },
    {
      title: 'Spanish',
      language: 'es',
      type: TextTrackType.VTT,
      uri: 'https://video-services-dev.s3.amazonaws.com/public/elephants-dream-subtitles-german.vtt',
    },
  ];
  @observable selectedTextTrack = {type: 'title', value: 'off'};

  @observable videoTracks = [
    {
      width: 0,
      name: 'auto',
      height: 0,
      filesize: 178846532,
      ext: 'mp4',
      bitrate: 0,
    },
    {
      width: 1280,
      name: 'high',
      height: 720,
      filesize: 178912314,
      ext: 'mp4',
      bitrate: 2189176,
    },
    {
      width: 960,
      name: 'medium',
      height: 540,
      filesize: 116560805,
      ext: 'mp4',
      bitrate: 1426240,
    },
    {
      width: 640,
      name: 'low',
      height: 360,
      filesize: 65568041,
      ext: 'mp4',
      bitrate: 802288,
    },
  ];
  @observable selectedVideoTrack = {type: 'resolution', value: 0};

  @observable muted = __DEV__;

  @observable isAirplay = false;
  @observable isChromeCast = false;
  // @observable castState = CastState.NOT_CONNECTED;
  // @observable castMediaStatus = MediaPlayerState.IDLE;

  @observable controlsVisible = true;
  @observable bitRate = 0;

  @observable videoData = [
    // {
    //   id: '119',
    //   uri: 'https://thinqvideo.tm-cappital.co/streaming-playlists/hls/db62a110-854d-4077-a1db-5fc9688fc6eb/0a3191fb-c5d7-4900-9c6a-da0908a719b2-master.m3u8',
    //   // storyboard: 'https://image.mux.com/tZHYQRiJG45ngzUl9aU2pL3aESMxcOtC9KA2Wb3702Tg/storyboard.json',
    //   title: 'My video title3',
    //   subtitle: 'My video subtitle3',
    //   thumbnail:
    //     'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    // },
    {
      id: '120',
      //? Public videos: https://gist.github.com/jsturgis/3b19447b304616f18657
      // uri: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      // uri: 'https://stream.mux.com/UJSXuM2hJJfz7uXJtp5MThOKj4D02YgiJ.m3u8',
      // uri: 'https://stream.mux.com/hVD27gGqNlY4E4p1QhKxtys1Z6OOMkeE.m3u8',
      // uri: 'https://stream.mux.com/eNoCd4dKflS8011ztEi9acjIRM5sEUiID.m3u8',
      // uri: 'https://iandevlin.github.io/mdn/video-player-with-captions/video/sintel-short.mp4',
      // uri: 'https://stream.mux.com/tZHYQRiJG45ngzUl9aU2pL3aESMxcOtC9KA2Wb3702Tg.m3u8',
      // uri: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      // uri: 'https://stream.mux.com/YhPvKvXg2DXw02ytGFpcwxdqv3w5SIuq6aXOcnqzkEUg.m3u8',
      uri: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
      // uri: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      // uri: 'https://stream.mux.com/YhPvKvXg2DXw02ytGFpcwxdqv3w5SIuq6aXOcnqzkEUg/high.mp4',
      // uri: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbrop_adv_example_fmp4/master.m3u8',
      storyboard:
        'https://image.mux.com/YhPvKvXg2DXw02ytGFpcwxdqv3w5SIuq6aXOcnqzkEUg/storyboard.json',

      title: 'My video title1',
      subtitle: 'My video subtitle1',
      thumbnail:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      adUrl:
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
    },
    {
      id: '121',
      uri: 'https://stream.mux.com/tZHYQRiJG45ngzUl9aU2pL3aESMxcOtC9KA2Wb3702Tg.m3u8',
      storyboard:
        'https://image.mux.com/tZHYQRiJG45ngzUl9aU2pL3aESMxcOtC9KA2Wb3702Tg/storyboard.json',
      title: 'My video title2',
      subtitle: 'My video subtitle2',
      thumbnail:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      adUrl:
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
    },
    {
      id: '122',
      uri: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
      // storyboard: 'https://image.mux.com/tZHYQRiJG45ngzUl9aU2pL3aESMxcOtC9KA2Wb3702Tg/storyboard.json',
      title: 'My video title3',
      subtitle: 'My video subtitle3',
      thumbnail:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      adUrl:
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=',
    },
    {
      id: '123',
      // uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      uri: 'https://stream.mux.com/tZHYQRiJG45ngzUl9aU2pL3aESMxcOtC9KA2Wb3702Tg.m3u8',
      // storyboard: 'https://image.mux.com/YhPvKvXg2DXw02ytGFpcwxdqv3w5SIuq6aXOcnqzkEUg/storyboard.json',
      title: 'For Bigger Blazes',
      subtitle: 'HBO GO now works with Chrome cast',
      thumbnail:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      adUrl:
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=',
    },
  ];

  @observable videoDetails = {};

  @observable currentPlayingVideoIndex = 0;

  @observable overrideVideoQuality = true;
  @observable overrideSubTitles = false;

  @observable audioTracks = [];
  @observable selectedAudioTrack = {type: 'system', value: ''};

  @observable isAdPlaying = false;

  @observable isPipEnabled = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setVideoDetails = (index = 0) => {
    if (index !== -1) {
      this.currentPlayingVideoIndex = index;
      if (Array.isArray(this.videoData) && this.videoData.length > 0) {
        const dataObj = get(
          this.videoData,
          `[${this.currentPlayingVideoIndex}]`,
        );
        if (!isEmpty(dataObj)) {
          this.videoDetails = dataObj;
        }
      }
    }
  };

  @action
  slideUp = () => {
    this.bounceValue.setValue(screenHeight);
    Animated.timing(this.bounceValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver,
    }).start(() => {
      this.setSlideUpFinishedFlag(true);
      setTimeout(() => {
        this.setPlayingState(true);
      }, 700);
    });
  };

  @action
  slideDown = () => {
    Animated.timing(this.bounceValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver,
    }).start();
  };

  @action
  setSlideUpFinishedFlag = value => {
    this.slideUpFinished = value;
  };

  @action
  setVideoWidth = value => {
    this.videoWidth = value;
  };

  @action
  setPlayerVisible = value => {
    this.isPlayerVisible = value;
  };

  @action
  setIsPipEnabled = value => {
    this.isPipEnabled = value;
  };

  @action
  closePlayer = () => {
    // this.slideDown();
    this.isPlayerVisible = false;
    this.controlsVisible = false;
    this.setPlayingState(false);
  };

  @action
  openPlayer = () => {
    this.isPlayerVisible = true;
    // this.slideUp();
  };

  @action
  setVideoHeight = value => {
    this.videoHeight = value;
  };

  @action
  setVideoTopPadding = flag => {
    if (!hasNotchTop) {
      return;
    }
    if (flag) {
      this.videoTopPadding = iphoneXTopPadding;
    } else {
      this.videoTopPadding = 0;
    }
  };

  @action
  setBitRate = value => {
    this.bitRate = value;
    this.selectedVideoTrack = {type: 'resolution', value};
  };

  @action
  minimizeVideoPlayer = () => {
    this.isMinimized = true;
    this.setControlVisibilityValue(false);
  };

  @action
  maximizeVideoPlayer = () => {
    this.isMinimized = false;
  };

  @action
  setPlayerRef = dataObj => {
    if (!isEmpty(dataObj)) {
      this.playerRef = dataObj;
    }
  };

  @action
  onVideoSeekStart = () => {
    this.setPlayingState(false);
  };

  @action
  setAirplay = value => {
    if (value !== this.isAirplay) {
      value = isBoolean(value) ? value : false;
      if (value === true) {
        this.setControlVisibilityValue(true);
      }
      this.isAirplay = value;
    }
  };

  // @action
  // setChromeCastState = value => {
  //   if (value !== this.isChromeCast) {
  //     value = isBoolean(value) ? value : false;
  //     if (value === true) {
  //       this.setControlVisibilityValue(true);
  //     }
  //     this.isChromeCast = value;
  //   }
  // };

  // @action
  // changeMediaPlayerState = value => {
  //   this.castMediaStatus = value;
  // };

  @action
  setPlayerControls = value => {
    if (value !== this.controlsVisible) {
      value = isBoolean(value) ? value : false;
      this.setControlVisibilityValue(value);
    }
    this.visibleTime && clearTimeout(this.visibleTime);
    if (value === true) {
      this.visibleTime = setTimeout(() => {
        this.setControlVisibilityValue(false);
        this.visibleTime && clearTimeout(this.visibleTime);
      }, 30000);
    }
  };

  @action
  onExternalPlaybackEnd = (progress = 0) => {
    if (!progress || progress <= 0) {
      progress = 0;
    }
    this.onVideoSeekComplete(progress);
    // this.setChromeCastState(false);
    this.setAirplay(false);
  };

  @action
  setControlVisibilityValue = controlsVisible => {
    this.visibleTime && clearTimeout(this.visibleTime);
    if (controlsVisible !== this.controlsVisible) {
      if (this.isMinimized) {
        this.controlsVisible = false;
        return;
      }
      this.controlsVisible = controlsVisible;
    }
  };

  @action
  onVideoSeekComplete = seconds => {
    if (this.playerRef && this.playerRef.seek) {
      seconds = this.parseSeconds(seconds);
      this.currentPosition = seconds;
      this.playerRef.seek(seconds);
    }
    this.setPlayingState(true);
  };

  parseSeconds = progress => {
    if (!progress || progress <= 0 || isNaN(progress)) {
      progress = 0;
    }
    return progress;
  };

  @action
  onVideoEnd = (progress = 0) => {
    let autoplay = false;
    if (Array.isArray(this.videoData) && this.videoData.length > 1) {
      this.onChangeVideo(true);
      return;
    }
    progress = this.parseSeconds(progress);
    this.currentPosition = progress;
    if (this.playerRef && this.playerRef.seek) {
      this.playerRef.seek(progress);
    }
    setTimeout(() => {
      this.setPlayingState(autoplay);
    }, 1000);
  };

  @action
  setPlayingState = (value, position = undefined) => {
    this.isPlaying = value;
    // if (value) {
    //   setMusicPlay(position);
    // } else {
    //   setMusicPause(position);
    // }
  };

  @action
  toggleResizeMode = () => {
    this.videoResizeMode =
      this.videoResizeMode === 'cover' ? 'contain' : 'cover';
  };

  // @action
  // changeCastState = value => {
  //   this.castState = value;
  // };

  // TODO: Player Progress needs to reviewed for better performance
  @action
  setVideoPlayingProgress = (value, isDuration = false) => {
    if (isDuration) {
      this.currentVideoDuration = value;
    } else {
      this.currentPosition = value;
    }
  };

  @action
  changePlaybackRate = () => {
    const value = this.playBackRate;
    switch (value) {
      case 1:
        this.playBackRate = 1.25;
        break;
      case 1.25:
        this.playBackRate = 1.5;
        break;
      case 1.5:
        this.playBackRate = 2;
        break;
      case 2:
        this.playBackRate = 1;
        break;
      default:
        this.playBackRate = 1;
        break;
    }
  };

  @action
  onSkipVideoSeconds = (doPlus = true) => {
    let duration = 0;
    if (doPlus) {
      duration = parseInt(this.currentPosition + SKIP_SEC, 10);
    } else {
      duration = parseInt(this.currentPosition - SKIP_SEC, 10);
    }
    if (duration > 0) {
      this.onVideoSeekComplete(duration);
    } else {
      this.onVideoSeekComplete(0);
    }
  };

  @action
  setFullScreenFlag = value => {
    this.isFullScreen = value;
  };

  @action
  setSubTitleTracks = data => {
    if (Array.isArray(data) && data.length > 0) {
      data.unshift({
        index: -1,
        language: 'off',
        title: 'off',
        uri: '',
      });
      this.subTitleTextTracks = [...data];
    }
  };

  @action
  setSelectedTexTrack = (dataObj, isSingleTrack = false) => {
    if (!isEmpty(dataObj) && !isSingleTrack) {
      this.selectedTextTrack = {
        type: 'title',
        value: get(dataObj, 'title', ''),
      };
    } else {
      this.selectedTextTrack = {
        type: 'title',
        value: 'off',
      };
    }
  };

  @action
  toggleVolume = () => {
    this.muted = !this.muted;
  };

  @action
  setVideoTracks = data => {
    if (Array.isArray(data) && data.length > 0) {
      data.unshift({
        bitrate: 0,
        codecs: '-',
        height: 0,
        trackId: '0x',
        width: 0,
        name: 'auto',
      });
      this.videoTracks = [...data];
    }
  };

  @action
  setSelectedVideoTracks = dataObj => {
    if (!isEmpty(dataObj)) {
      this.selectedVideoTrack = {
        type: 'resolution',
        value: get(dataObj, 'height'),
      };
    }
  };

  @action
  setAudioTracks = data => {
    if (Array.isArray(data) && data.length > 0) {
      this.audioTracks = [...data];
      const title = get(data, '[0].title');
      if (title && title !== '') {
        this.selectedAudioTrack = {
          type: 'title',
          value: get(data, '[0].title'),
        };
      }
    }
  };

  @action
  setSelectedAudioTrack = dataObj => {
    if (!isEmpty(dataObj)) {
      if (dataObj.title && dataObj.title !== '') {
        this.selectedAudioTrack = {
          type: 'title',
          value: get(dataObj, 'title'),
        };
      }
    }
  };

  @computed get isHlsVideoUrl() {
    let isHLSUrl = false;
    const sourceExt = fileExtension(this.videoDetails.uri);
    if (sourceExt === '.m3u8') {
      isHLSUrl = true;
    }
    return isHLSUrl;
  }

  @action
  setIsAdPlaying = value => {
    this.isAdPlaying = value;
  };

  @computed get isShowNextPrev() {
    return Array.isArray(this.videoData) && this.videoData.length > 1;
  }

  @computed get isDisableNext() {
    let isDisabled = false;
    if (
      Array.isArray(this.videoData) &&
      this.currentPlayingVideoIndex === this.videoData.length - 1
    ) {
      isDisabled = true;
    }
    return isDisabled;
  }

  @computed get isDisablePrev() {
    let isDisabled = false;
    if (Array.isArray(this.videoData) && this.currentPlayingVideoIndex === 0) {
      isDisabled = true;
    }
    return isDisabled;
  }

  @action
  onChangeVideo = isNext => {
    this.currentVideoDuration = 0;
    this.currentPosition = 0;
    this.videoDetails = {};
    // destroyAudioControls();
    const index = isNext
      ? this.currentPlayingVideoIndex + 1
      : this.currentPlayingVideoIndex - 1;
    this.setVideoDetails(index);
  };

  @action
  setCurrentPlayingIndex = id => {
    if (id) {
      const index = findIndex(this.videoData, function (obj) {
        return obj.id === id;
      });
      if (index >= 0) {
        this.currentPlayingVideoIndex = index;
      }
    }
  };

  @computed get isShowSubtitles() {
    return (
      Array.isArray(this.subTitleTextTracks) &&
      this.subTitleTextTracks.length > 0
    );
  }

  @computed get isShowVideoQuality() {
    return Array.isArray(this.videoTracks) && this.videoTracks.length > 1;
  }

  @computed get isShowPlaybackAudio() {
    return Array.isArray(this.audioTracks) && this.audioTracks.length > 1;
  }
}

export default VideoStore;
