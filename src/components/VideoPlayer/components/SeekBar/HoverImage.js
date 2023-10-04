import React, { Component } from 'react';
import { View } from 'native-base';
import { moderateScaling, verticalScaling } from '@utils/styleHelper';
import { isTablet } from 'react-native-device-info';
import { Image } from 'react-native';

class HoverImage extends Component {
  shouldComponentUpdate = nextProps => {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  };

  render() {
    try {
      const {
        positionObject = {},
        storyImageWidth,
        storyImageHeight,
        tileWidth,
        tileHeight,
        storyBoardImageUrl,
      } = this.props;

      const OFFSET_LEFT = positionObject.x ? positionObject.x : 0;
      const OFFSET_TOP = positionObject.y ? positionObject.y : 0;
      const IMAGE_WIDTH = storyImageWidth;
      const IMAGE_HEIGHT = storyImageHeight;

      const CROPPED_VIEW_STYLE = {
        width: tileWidth,
        height: tileHeight,
        overflow: 'hidden',
        position: 'absolute',
        borderWidth: moderateScaling(3),
        borderColor: 'white',
        backgroundColor: 'grey',
        transform: [
          { scale: moderateScaling(isTablet() ? 1 : 0.5) },
          { translateY: isTablet() ? verticalScaling(-40) : 0 },
        ],
      };

      const IMAGES_STYLE = {
        marginLeft: -OFFSET_LEFT,
        marginTop: -OFFSET_TOP,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
      };

      return (
        <View style={CROPPED_VIEW_STYLE}>
          <Image
            style={IMAGES_STYLE}
            resizeMode={'contain'}
            source={{
              uri: storyBoardImageUrl,
            }}
          />
        </View>
      );
    } catch (error) {
      return null;
    }
  }
}

export default HoverImage;
