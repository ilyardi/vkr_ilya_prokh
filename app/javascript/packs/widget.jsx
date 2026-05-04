import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { PersistGate } from 'redux-persist/integration/react';
import { createMigrate, persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
import { SnackbarProvider } from 'notistack';
import { ActionCableProvider } from '@thrash-industries/react-actioncable-provider';

import reducers from 'redux/reducers';

import WidgetApp from 'widget_app';

const migrations = {
  1: (state) => {
    state;
    return {
      ...state,
      widget: { history: state.widget.accounts, manager_phone: state.widget.manager_phone },
    };
  },
};

const persistConfig = {
  key: 'root_widget',
  version: 1,
  storage,
  debug: process.env.NODE_ENV == 'development',
  // stateReconciler: hardSet,
  migrate: createMigrate(migrations, { debug: true }),
};

const persistedReducer = persistReducer(persistConfig, combineReducers(reducers));
const store = createStore(persistedReducer, applyMiddleware(thunk));
const persistor = persistStore(store);

// import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();

class EmbeddableWidget {
  static el;

  static mount() {
    let wsURL =
      (window.location.protocol == 'https:' ? 'wss' : 'ws') +
      '://' +
      window.location.host +
      '/cable';
    if (process.env.NODE_ENV == 'development') {
      wsURL = 'ws://localhost:8080/cable';
    }
    const component = (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SnackbarProvider maxSnack={3}>
            <ActionCableProvider url={wsURL}>
              <WidgetApp />
            </ActionCableProvider>
          </SnackbarProvider>
        </PersistGate>
      </Provider>
    );

    function openAccount() {
      const urlParams = new URLSearchParams(window.location.search);
      const uid = urlParams.get('teleset_uid');
      if (uid) {
        window.location.hash = '#users';

        var tickID = setInterval(function () {
          if (!!OSS.getApplication) {
            clearInterval(tickID);
            OSS.getApplication()
              .getController('Users')
              .getSection()
              .getSaving()
              .setRecord(Ext.create('OSS.model.User', { uid: uid }));
          }
        }, 1000);

        setTimeout(function () {
          clearInterval(tickID);
        }, 10000);
      }
    }

    function doRender() {
      if (EmbeddableWidget.el) {
        throw new Error('EmbeddableWidget is already mounted, unmount first');
      }
      const el = document.createElement('div');
      el.setAttribute('class', 'lbwidget-root');
      document.body.appendChild(el);
      ReactDOM.render(component, el);
      EmbeddableWidget.el = el;
      openAccount();
    }
    if (document.readyState === 'complete') {
      doRender();
    } else {
      window.addEventListener('load', () => {
        doRender();
      });
    }
  }

  static unmount() {
    if (!EmbeddableWidget.el) {
      throw new Error('EmbeddableWidget is not mounted, mount first');
    }
    ReactDOM.unmountComponentAtNode(EmbeddableWidget.el);
    EmbeddableWidget.el.parentNode.removeChild(EmbeddableWidget.el);
    EmbeddableWidget.el = null;
  }
}

if (!window.EmbeddableWidget) {
  window.EmbeddableWidget = EmbeddableWidget;
}

EmbeddableWidget.mount();

export default EmbeddableWidget;
