import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { SnackbarProvider } from 'notistack';

import reducers from 'redux/reducers';
import { AbilityContext, ability } from 'tools/ability';
import App from 'app';

import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';

import dayjs from 'dayjs'
import 'dayjs/locale/ru';
dayjs.locale('ru')

const store = createStore(combineReducers(reducers), applyMiddleware(thunk));
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={store}>
      <AbilityContext.Provider value={ability}>
        <SnackbarProvider maxSnack={3}>
          <ConfigProvider
  locale={ruRU}
  theme={{
    token: {
      colorPrimary:   '#2563eb',
      colorLink:      '#2563eb',
      colorInfo:      '#2563eb',
      colorSuccess:   '#16a34a',
      colorWarning:   '#f59e0b',
      colorError:     '#dc2626',
      borderRadius:   6,
    },
    components: {
      Menu: {
        itemSelectedBg:   '#3b82f6',
        itemSelectedColor:'#ffffff',
        itemHoverBg:      '#1e40af',
        itemHoverColor:   '#ffffff',
      },
      Layout: {
        headerBg:   '#1e3a8a',
        siderBg:    '#1e293b',
        bodyBg:     '#f8fafc',
      },
      Button: {
        colorPrimary: '#2563eb',
      },
    },
  }}
>
            <App />
          </ConfigProvider>
        </SnackbarProvider>
      </AbilityContext.Provider>
    </Provider>,
    document.body.appendChild(document.createElement('div')),
  );
});
