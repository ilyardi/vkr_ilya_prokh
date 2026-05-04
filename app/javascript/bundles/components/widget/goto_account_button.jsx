import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, IconButton } from '@material-ui/core';

class GotoAccountButton extends Component {
  static gotoAccount = (uid, target) => {
    if (typeof OSS != 'undefined' && !(target)) {
      window.location.hash = '#users';
      OSS.getApplication()
        .getController('Users')
        .getSection()
        .getSaving()
        .setRecord(Ext.create('OSS.model.User', { uid: uid }));
      return;
    }

    window.open(`https://lb.teleset.plus?teleset_uid=${uid}#users`, target)

    // const form = document.createElement('form');
    // form.action = 'https://lb.teleset.plus?teleset_uid=' + uid + "#users";
    // console.log(form.action)
    // form.method = 'GET';
    // if (options && options.target) {
    //   form.setAttribute('target', options.target);
    // }
    // document.body.appendChild(form);
    // form.submit();

    // const form = document.createElement('form');
    // form.action = '/admin/config.php';
    // if (options && options.actionWithHost) {
    //   form.action = 'https://lb.teleset.plus/admin/config.php';
    // }
    // form.method = 'POST';
    // if (options && options.target) {
    //   form.setAttribute('target', options.target);
    // }

    // const hiddenUid = document.createElement('input');
    // hiddenUid.setAttribute('type', 'hidden');
    // hiddenUid.setAttribute('name', 'uid');
    // hiddenUid.setAttribute('value', uid);

    // const hiddenDev = document.createElement('input');
    // hiddenDev.setAttribute('type', 'hidden');
    // hiddenDev.setAttribute('name', 'devision');
    // hiddenDev.setAttribute('value', 22);

    // form.appendChild(hiddenUid);
    // form.appendChild(hiddenDev);

    // document.body.appendChild(form);
    // form.submit();
  };

  handleClick = () => {
    GotoAccountButton.gotoAccount(this.props.account.uid);
  };

  render() {
    return (
      <Tooltip title="Открыть карточку абонента">
        <IconButton size="small" color="primary" onClick={this.handleClick}>
          <FontAwesomeIcon icon="arrow-alt-circle-right" size="lg" />
        </IconButton>
      </Tooltip>
    );
  }
}

export default GotoAccountButton;
