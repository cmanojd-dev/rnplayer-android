import React from 'react';
import { Actionsheet, Box, Text } from 'native-base';
import { observer } from 'mobx-react';
import { capitalize, get, isEmpty, map } from 'lodash';
import CustomIcon from '@customIcon';
import styles from './styles';

const ActionSheetComponent = observer(props => {
  const {
    isFullScreen,
    isOpenSheet,
    toggleSheet,
    title,
    optionData,
    filterKey,
    itemKey,
    selectionKey,
    selectedOption,
    onSelectItem,
  } = props;
  return (
    <Actionsheet
      zIndex={1}
      size={isFullScreen ? 'lg' : 'full'}
      isOpen={isOpenSheet}
      onClose={() => toggleSheet(false)}>
      <Actionsheet.Content alignSelf={'center'} maxHeight={'100%'}>
        {!!title && (
          <Box justifyContent={'center'}>
            <Text style={styles.titleText}>{title}</Text>
          </Box>
        )}
        {map(optionData, (obj, index) => {
          const str = get(obj, `${itemKey}`, '');
          return (
            <Actionsheet.Item
              key={index}
              onPress={() => onSelectItem(obj)}
              name={get(obj, `${itemKey}`)}
              justifyContent={'center'}
              {...(!isEmpty(selectedOption) &&
                selectedOption[selectionKey] === obj[filterKey] && {
                  endIcon: (
                    <CustomIcon
                      name={'ic-check-circle'}
                      style={styles.iconStyle}
                    />
                  ),
                })}>
              {capitalize(str.substr(str.indexOf(':') + 1))}
            </Actionsheet.Item>
          );
        })}
      </Actionsheet.Content>
    </Actionsheet>
  );
});

export default ActionSheetComponent;
