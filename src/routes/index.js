import React from 'react';
import {observer} from 'mobx-react';

import {NavigationContainer} from '@react-navigation/native';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PlayerComponent from '@playerComponent';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const Routes = observer(props => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={'video_player'}
          component={PlayerComponent}
          options={{
            title: 'Video Player',
            autoHideHomeIndicator: true,
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});
export default Routes;
