import React from 'react';
import {NativeBaseProvider} from 'native-base';
import {Provider} from 'mobx-react';

import Routes from '@routes';

import {storeManager} from '@utils/appDefault';

// import {CustomTheme} from '@theme';

class App extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // appDefault();
  }

  //   <NativeBaseProvider theme={CustomTheme}>
  render() {
    return (
      <NativeBaseProvider>
        <Provider {...storeManager.stores}>
          <Routes />
        </Provider>
      </NativeBaseProvider>
    );
  }
}

export default App;
