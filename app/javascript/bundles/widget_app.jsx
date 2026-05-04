import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas);
library.add(far);
import { ActionCableConsumer } from '@thrash-industries/react-actioncable-provider';
import { withSnackbar } from 'notistack';
import { IconButton, Button } from '@material-ui/core';

import { managerPhoneUpdate, historyAdd } from 'redux/actions/widget';

import SearchForm from './components/widget/search_form';
import Settings from './components/widget/settings';
import GotoAccountButton from './components/widget/goto_account_button';
import './widget_app.scss';

class WidgetApp extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      opened: false,
    };

    if (window.Notification && Notification.permission !== 'denied') {
      Notification.requestPermission(function (p) {
        if (p === 'denied') {
          console.error('Уведомления о звонках запрещены.');
        } else if (p === 'granted') {
          console.warn('Уведомления о звонках разрешены');
        }
      });
    }
  }

  handleToggleOpen = (page) => () => {
    this.setState((prev) => {
      let prevOpen = prev.opened;
      return {
        page,
        opened: prev.page && prev.page != page ? prevOpen : !prevOpen,
      };
    });
  };

  handleCallReceived = (message) => {
    console.warn(message);
    if (message.uid) {
      const notify = new Notification('Звонок ' + message.call_number, {
        requireInteraction: true,
        body: message.name,
        icon: '/ico/favicon-32x32.png',
        tag: 'new_call',
        renotify: true,
      });
      console.warn(notify);
      notify.onclick = (e) => {
        e.preventDefault();
        this.props.historyAdd(message);
        GotoAccountButton.gotoAccount(message.uid, '_blank');
        window.open(`https://crm.teleset.plus/agreements?number=${message.number}&visibleCard=true`, '_blank')
        notify.close();
      };
      setTimeout(() => {
        notify.close();
      }, 20000);
    }

    // this.props.enqueueSnackbar(JSON.stringify(message), {
    //   variant: 'info',
    //   anchorOrigin: {
    //     vertical: 'top',
    //     horizontal: 'right',
    //   },
    //   action: (
    //     <Button size="small">{'Закрыть'}</Button>
    //   )
    // });
  };

  handleWidgetExit = () => {
    this.setState({
      showDock: true,
    });
  };

  render() {
    // const body = (this.state.showDock) && (
    const body = (
      <div className="dock">
        <IconButton
          variant="contained"
          size="small"
          color="primary"
          onClick={this.handleToggleOpen('search')}
        >
          <FontAwesomeIcon icon="search" />
        </IconButton>
        <IconButton
          variant="contained"
          size="small"
          color="default"
          onClick={this.handleToggleOpen('settings')}
        >
          <FontAwesomeIcon icon="cogs" />
        </IconButton>
      </div>
    );

    return (
      <div className="docked-widget">
        {this.props.managerPhone && this.props.managerPhone != '' && (
          <ActionCableConsumer
            channel={{
              channel: 'CallsChannel',
              phone: this.props.managerPhone,
            }}
            onReceived={this.handleCallReceived}
          ></ActionCableConsumer>
        )}
        {body}
        <Transition in={this.state.opened} timeout={250} onExited={this.handleWidgetExit}>
          {(status) => (
            <div className={`widget widget-${status}`}>
              <div className="widget-header">
                <div
                  className="widget-header-title"
                  onClick={this.handleToggleOpen(this.state.page)}
                >
                  {this.state.page == 'search' && <span>Поиск по адресу</span>}
                  {this.state.page == 'settings' && <span>Настройки</span>}
                </div>
                <a className="widget-header-icon" onClick={this.handleToggleOpen(this.state.page)}>
                  <FontAwesomeIcon icon="times" />
                </a>
              </div>
              <div className="widget-body">
                {this.state.page == 'search' && <SearchForm />}
                {this.state.page == 'settings' && <Settings />}
              </div>
            </div>
          )}
        </Transition>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    managerPhone: state.widget.managerPhone,
  };
};

const mapDispatchToProps = (dispatch) => ({
  managerPhoneUpdate(payload) {
    dispatch(managerPhoneUpdate(payload));
  },
  historyAdd(payload) {
    dispatch(historyAdd(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withSnackbar(WidgetApp));
