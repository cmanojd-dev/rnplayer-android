// import MusicControl, { Command } from 'react-native-music-control';

import {EventRegister} from 'react-native-event-listeners';
import {MUSIC_CONTROLS, NOTIFICATION_CONTROLS, SKIP_SEC} from './constants';
import {getSystemVersion} from 'react-native-device-info';
import {AppState, Platform} from 'react-native';

import {storeManager} from '@utils/appDefault';

const isLowEndDevice =
  // eslint-disable-next-line radix
  Platform.OS === 'android' && parseInt(getSystemVersion()) <= 7;

let isAudioControlEnable = null;

export const musicControlsInit = () => {
  try {
    const {videoStore} = storeManager.stores;
    MusicControl.enableBackgroundMode(true);

    if (Platform.OS === 'ios') {
      MusicControl.handleAudioInterruptions(true);
    }

    MusicControl.on(Command.play, () => {
      if (
        Platform.OS === 'android' &&
        AppState.currentState === 'background' &&
        !videoStore.isAdPlaying
      ) {
        videoStore.setPlayingState(true);
      } else {
        EventRegister.emit(MUSIC_CONTROLS, {
          toggle: true,
          state: NOTIFICATION_CONTROLS.REMOTE_PLAY,
        });
      }
    });

    MusicControl.on(Command.pause, () => {
      if (
        Platform.OS === 'android' &&
        AppState.currentState === 'background' &&
        !videoStore.isAdPlaying
      ) {
        videoStore.setPlayingState(false);
      } else {
        EventRegister.emit(MUSIC_CONTROLS, {
          toggle: true,
          state: NOTIFICATION_CONTROLS.REMOTE_PAUSE,
        });
      }
    });

    MusicControl.on(Command.nextTrack, () => {
      if (!videoStore.isDisableNext) {
        EventRegister.emit(MUSIC_CONTROLS, {
          toggle: false,
          state: NOTIFICATION_CONTROLS.REMOTE_SKIP_NEXT,
        });
      }
    });

    MusicControl.on(Command.previousTrack, () => {
      if (!videoStore.isDisablePrev) {
        EventRegister.emit(MUSIC_CONTROLS, {
          toggle: false,
          state: NOTIFICATION_CONTROLS.REMOTE_SKIP_PREV,
        });
      }
    });

    MusicControl.on(Command.skipForward, () => {
      EventRegister.emit(MUSIC_CONTROLS, {
        toggle: false,
        doPlus: true,
        state: NOTIFICATION_CONTROLS.REMOTE_SKIP_FORWARD,
      });
    });

    MusicControl.on(Command.skipBackward, () => {
      EventRegister.emit(MUSIC_CONTROLS, {
        toggle: false,
        doPlus: false,
        state: NOTIFICATION_CONTROLS.REMOTE_SKIP_BACKWARD,
      });
    });

    MusicControl.on(Command.changePlaybackPosition, data => {
      EventRegister.emit(MUSIC_CONTROLS, {
        toggle: false,
        position: data,
        state: NOTIFICATION_CONTROLS.REMOTE_SEEK,
      });
    });

    if (Platform.OS === 'android') {
      MusicControl.on(Command.closeNotification, () => {
        EventRegister.emit(MUSIC_CONTROLS, {
          toggle: true,
          skip: 0,
          state: NOTIFICATION_CONTROLS.REMOTE_PAUSE,
        });
        updateAudioStatePlayback(MusicControl.STATE_PAUSED);
        destroyAudioControls();
      });
      MusicControl.on(Command.stop, () => {
        EventRegister.emit(MUSIC_CONTROLS, {
          toggle: true,
          skip: 0,
          state: NOTIFICATION_CONTROLS.REMOTE_PAUSE,
        });
        updateAudioStatePlayback(MusicControl.STATE_PAUSED);
        destroyAudioControls();
      });
    }
  } catch (error) {}
};

export const toggleAudioControls = (enable = true) => {
  try {
    if (!isAudioControlEnable) {
      const {videoStore} = storeManager.stores;
      isAudioControlEnable = enable;
      MusicControl.enableControl(Command.play, enable);
      MusicControl.enableControl(Command.pause, enable);
      MusicControl.enableControl(Command.stop, false);
      MusicControl.enableControl(Command.seek, false);
      MusicControl.enableControl(Command.changePlaybackPosition, enable);
      if (Platform.OS === 'ios' && videoStore.isShowNextPrev) {
        MusicControl.enableControl(
          Command.nextTrack,
          videoStore.isShowNextPrev && !videoStore.isDisableNext,
        );
        MusicControl.enableControl(
          Command.previousTrack,
          videoStore.isShowNextPrev && !videoStore.isDisablePrev,
        );
      } else {
        MusicControl.enableControl(Command.skipBackward, enable, {
          interval: SKIP_SEC,
        });
        MusicControl.enableControl(Command.skipForward, enable, {
          interval: SKIP_SEC,
        });
        MusicControl.enableControl(
          Command.nextTrack,
          videoStore.isShowNextPrev && !videoStore.isDisableNext,
        );
        MusicControl.enableControl(
          Command.previousTrack,
          videoStore.isShowNextPrev && !videoStore.isDisablePrev,
        );
      }
      if (Platform.OS === 'android') {
        MusicControl.enableControl(Command.closeNotification, true, {
          when: 'never',
        });
      } else {
        MusicControl.enableControl(Command.seekForward, true);
        MusicControl.enableControl(Command.seekBackward, true);
      }
    }
  } catch (error) {}
};

export const destroyAudioControls = () => {
  try {
    if (isAudioControlEnable) {
      isAudioControlEnable = null;
      MusicControl.resetNowPlaying();
    }
  } catch (error) {}
};

export const setNowPlayingAudioData = data => {
  try {
    const {
      artwork,
      title,
      album,
      artist,
      description,
      duration,
      date,
      elapsedTime = 0,
    } = data;
    const notificationData = {
      title: title,
      artwork: artwork, // URL or RN's image require()
      album: album,
      artist: artist,
      description: description, // Android Only
      genre: 'News',
      duration: duration && duration > 0 ? duration : 0, // (Seconds)
      state: MusicControl.STATE_PLAYING,
      elapsedTime: elapsedTime,
      date: date, // Release Date (RFC 3339) - Android Only
    };
    if (isLowEndDevice) {
      try {
        delete notificationData.artwork;
      } catch (error) {}
    }
    toggleAudioControls(true);
    try {
      MusicControl.setNowPlaying(notificationData);
    } catch (error) {}
  } catch (error) {}
};

export const updateAudioPlayback = async (
  elapsedTime,
  state = MusicControl.STATE_PLAYING,
) => {
  try {
    const {videoStore} = storeManager.stores;
    // const isCastPlaying = await GoogleCast.getCastState();
    // if (isCastPlaying !== CastState.CONNECTED) {
    MusicControl.updatePlayback({
      state,
      elapsedTime,
      speed: videoStore.playBackRate,
    });
    // }
  } catch (error) {}
};

export const updateAudioStatePlayback = async (
  state = MusicControl.STATE_PLAYING,
) => {
  try {
    // const isCastPlaying = await GoogleCast.getCastState();
    // if (isCastPlaying !== CastState.CONNECTED) {
    MusicControl.updatePlayback({
      state,
    });
    // }
  } catch (error) {}
};

export const updateProgress = (elapsedTime, isPlaying = false) => {
  let state = MusicControl.STATE_PAUSED;
  if (isPlaying) {
    state = MusicControl.STATE_PLAYING;
  }
  updateAudioPlayback(elapsedTime, state);
};

export const setMusicPause = elapsedTime => {
  if (elapsedTime) {
    updateAudioPlayback(elapsedTime, MusicControl.STATE_PAUSED);
  }
  updateAudioStatePlayback(MusicControl.STATE_PAUSED);
};

export const setMusicPlay = elapsedTime => {
  if (elapsedTime) {
    updateAudioPlayback(elapsedTime, MusicControl.STATE_PAUSED);
  }
  updateAudioStatePlayback(MusicControl.STATE_PLAYING);
};
