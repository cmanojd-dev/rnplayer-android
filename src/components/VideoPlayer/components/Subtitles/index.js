import React from 'react';
import { Actionsheet, Box, Text } from 'native-base';
import { inject, observer } from 'mobx-react';
import { capitalize, get, isEmpty, map } from 'lodash';
import CustomIcon from '@customIcon';
import styles from './styles';

const SubTitles = inject('videoStore')(
  observer(props => {
    const { videoStore, toggleSubtitleSheet, onToggleSheet = () => {} } = props;
    const { isFullScreen, subTitleTextTracks, selectedTextTrack } = videoStore;

    const onSelectItem = obj => {
      videoStore.setSelectedTexTrack(obj);
      if (onToggleSheet) {
        onToggleSheet();
      }
    };

    return (
      <Actionsheet
        size={isFullScreen ? 'lg' : 'full'}
        isOpen={toggleSubtitleSheet}
        onClose={() => onToggleSheet(false)}>
        <Actionsheet.Content alignSelf={'center'} maxHeight={'100%'}>
          <Box justifyContent={'center'}>
            <Text style={styles.titleText}>{'Select SubTitle'}</Text>
          </Box>
          {map(subTitleTextTracks, (obj, index) => {
            if (!isEmpty(obj)) {
              const titleStr = get(obj, 'title', '');
              return (
                <Actionsheet.Item
                  key={index}
                  onPress={() => onSelectItem(obj)}
                  name={titleStr}
                  justifyContent={'center'}
                  {...(!isEmpty(selectedTextTrack) &&
                    selectedTextTrack.value === obj.title && {
                      endIcon: (
                        <CustomIcon
                          name={'ic-check-circle'}
                          style={styles.iconStyle}
                        />
                      ),
                    })}>
                  {capitalize(titleStr.substr(titleStr.indexOf(':') + 1))}
                </Actionsheet.Item>
              );
            }
          })}
        </Actionsheet.Content>
      </Actionsheet>
    );
  }),
);

export default SubTitles;
