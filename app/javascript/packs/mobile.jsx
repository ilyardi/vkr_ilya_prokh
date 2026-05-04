import React from "react";
import ReactDOM from "react-dom";

import { createStore, applyMiddleware, combineReducers } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { SnackbarProvider } from "notistack";

import reducers from "redux/reducers";
import { AbilityContext, ability } from "tools/ability";
import App from "app";

import { ConfigProvider } from "antd";
import { ConfigProvider as MobileProvider } from "antd-mobile";
import { BrowserLocationQuery } from'react-location-query'
import ruRU from 'antd/locale/ru_RU';
import ruRUm from 'antd-mobile/es/locales/ru-RU';

import dayjs from 'dayjs'
import 'dayjs/locale/ru';
dayjs.locale('ru')

const store = createStore(combineReducers(reducers), applyMiddleware(thunk));

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <Provider store={store}>
      <AbilityContext.Provider value={ability}>
        <SnackbarProvider maxSnack={3}>
          <MobileProvider locale={ruRUm}>
            <ConfigProvider locale={ruRU}>
              <App />
            </ConfigProvider>
          </MobileProvider>
        </SnackbarProvider>
      </AbilityContext.Provider>
    </Provider>,
    document.body.appendChild(document.createElement("div"))
  );
});
