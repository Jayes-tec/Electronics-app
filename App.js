import React, { useState } from 'react';
import RootNavigator from './components/uicomponents/RootNavigator';
import { View, Text } from 'react-native';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import RootReducer from './storage/RootReducer'

var store = createStore(RootReducer)

function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

export default App;