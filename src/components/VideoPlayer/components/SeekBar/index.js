import React from 'react';
import {View} from 'native-base';
import {Slider} from '@miblanchard/react-native-slider';
import HoverImage from './HoverImage';
import {moderateScaling, verticalScaling} from '@utils/styleHelper';
import styles from './styles';
import {get, isNumber} from 'lodash';
import {hasDynamicIsland, hasNotch, isTablet} from 'react-native-device-info';
import {Dimensions, PixelRatio, Platform} from 'react-native';
import {checkVideoRelatedUrl} from '@videoPlayer/utils';
import {inject, observer} from 'mobx-react';
import {action, makeObservable, observable} from 'mobx';

const HNPI = hasNotch() || hasDynamicIsland();
const minRightPercent = moderateScaling(70);
const appPadding = moderateScaling(20);

@inject('videoStore')
@observer
class SeekBar extends React.Component {
  @observable toggleOpacity = 0;
  @observable xPos = null;
  @observable storyBoardImageUrl = null;
  @observable positionObject = null;
  @observable storyImageWidth = null;
  @observable storyImageHeight = null;
  @observable tileWidth = moderateScaling(284);
  @observable tileHeight = verticalScaling(160);
  @observable storyTiles = [];

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.getStoryBoardJsonData();
  }

  @action
  getImageFromSec = event => {
    try {
      if (
        isNumber(event) &&
        checkVideoRelatedUrl(this.storyBoardImageUrl) &&
        this.storyTiles &&
        Array.isArray(this.storyTiles) &&
        this.storyTiles.length > 0
      ) {
        let positionObject = this.storyTiles.filter(obj => {
          return obj.start >= event;
        });
        if (
          positionObject &&
          Array.isArray(positionObject) &&
          positionObject.length > 0
        ) {
          positionObject = positionObject[0];
          if (positionObject) {
            if (positionObject.start && !!positionObject.start) {
              this.positionObject = positionObject;
            }
          }
        }
      }
    } catch (error) {}
  };

  @action
  getImageSize = storyBoardJson => {
    try {
      const tiles = get(storyBoardJson, 'tiles');
      if (tiles && Array.isArray(tiles) && tiles.length > 0) {
        // ? Scaling is not applied as this is coming from MUX API. Will apply scaling if needed in future
        const height = tiles[tiles.length - 1].y + storyBoardJson.tile_height;
        const width = tiles[tiles.length - 1].x + storyBoardJson.tile_width;
        this.storyImageHeight = height;
        this.storyImageWidth = width;
      }
    } catch (error) {}
  };

  @action
  getStoryBoardJsonData = () => {
    try {
      const storyboard = get(this, 'props.videoStore.videoDetails.storyboard');
      if (checkVideoRelatedUrl(storyboard)) {
        fetch(storyboard)
          .then(r => r.json())
          .then(storyBoardJson => {
            if (
              storyBoardJson &&
              storyBoardJson.tiles &&
              Array.isArray(storyBoardJson.tiles) &&
              storyBoardJson.tiles.length > 0
            ) {
              if (storyBoardJson.tile_width && storyBoardJson.tile_height) {
                // ? Scaling is not applied as this is coming from MUX API. Will apply scaling if needed in future
                this.tileWidth = storyBoardJson.tile_width;
                this.tileHeight = storyBoardJson.tile_height;
              }
              if (checkVideoRelatedUrl(get(storyBoardJson, 'url'))) {
                this.storyBoardImageUrl = storyBoardJson.url;
                this.storyTiles = storyBoardJson.tiles;
                this.getImageSize(storyBoardJson);
              }
            }
          });
      }
    } catch (error) {}
  };

  @action
  onCustomLayout = event => {
    const isFullScreen = false;
    const storyBoardImageUrl = this.storyBoardImageUrl;
    if (checkVideoRelatedUrl(storyBoardImageUrl)) {
      if (isNumber(get(event, 'moveX')) && isNumber(this.tileWidth)) {
        let xPos = parseFloat(event.moveX - this.tileWidth / 2);
        let screenWidth = Dimensions.get('screen').width;
        const leftFactor = moderateScaling(
          isFullScreen && HNPI
            ? 30
            : Platform.OS === 'android' && isFullScreen
            ? 10
            : 60,
        );
        if (Platform.OS === 'android' && isFullScreen) {
          screenWidth = PixelRatio.getPixelSizeForLayoutSize(
            screenWidth * (minRightPercent / 100),
          );
        }
        const rightLimitPercent = parseFloat(
          (event.moveX / screenWidth) * 100,
        ).toFixed(2);
        if (xPos < 0 && isTablet() && !isFullScreen) {
          xPos = moderateScaling(10);
        } else if (xPos < leftFactor / 2 && isTablet() && isFullScreen) {
          xPos = leftFactor / 2;
        } else if (xPos < -leftFactor) {
          xPos = -leftFactor;
        } else if (rightLimitPercent > minRightPercent) {
          xPos =
            screenWidth * (minRightPercent / 100) -
            (appPadding / 1) * (isFullScreen ? 5 : 7);
        }
        this.xPos = xPos;
      }
    }
  };

  @action
  onSlidingStart = value => {
    const onSeekStart = get(this, 'props.onSeekStart');
    if (onSeekStart && typeof onSeekStart === 'function') {
      onSeekStart(value);
    }
    if (this.toggleOpacity !== 1) {
      this.toggleOpacity = 1;
    }
  };

  @action
  onSlidingComplete = value => {
    const onSeekComplete = get(this, 'props.onSeekComplete');
    if (onSeekComplete && typeof onSeekComplete === 'function') {
      onSeekComplete(value);
    }
    if (this.toggleOpacity !== 0) {
      this.toggleOpacity = 0;
    }
  };

  onValueChange = event => {
    this.getImageFromSec(event[0]);
  };

  render() {
    let {currentTime, videoDuration} = this.props;
    if (currentTime <= 0) {
      currentTime = 0;
    }
    if (videoDuration <= 0) {
      videoDuration = 0;
    }
    return (
      <View style={styles.container}>
        <Slider
          minimumValue={0}
          maximumValue={
            currentTime < videoDuration ? videoDuration : currentTime
          } // check point 1
          step={1}
          value={currentTime}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
          trackClickable={false}
          minimumTrackTintColor={'#FFFFFF'}
          thumbTouchSize={styles.thumbTouch}
          onSlidingStart={this.onSlidingStart}
          onSlidingComplete={this.onSlidingComplete}
          onValueChange={this.onValueChange}
          onCustomLayout={this.onCustomLayout}
        />
        {this.toggleOpacity !== 0 && (
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              position: 'absolute',
              bottom: this.tileHeight,
              left: this.xPos,
            }}>
            <HoverImage
              storyBoardImageUrl={this.storyBoardImageUrl}
              tileHeight={this.tileHeight}
              tileWidth={this.tileWidth}
              storyImageWidth={this.storyImageWidth}
              storyImageHeight={this.storyImageHeight}
              positionObject={this.positionObject}
            />
          </View>
        )}
      </View>
    );
  }
}

export default SeekBar;
