import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TextField, List, ListSubheader, ListItem, ListItemText, ListItemSecondaryAction,
  Tooltip, IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withSnackbar } from 'notistack';

import { managerPhoneUpdate, callAdd } from 'redux/actions/widget';
import Rest from 'tools/rest';

class Settings extends Component {
  setPhone = (event) => {
    this.props.managerPhoneUpdate(event.target.value);
  }

  render() {
    return (
      <div className="b-calls">
        <TextField
          required
          label="Внутренний номер"
          helperText="Например: 11316"
          defaultValue={this.props.managerPhone}
          margin="normal"
          variant="outlined"
          onChange={this.setPhone}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    managerPhone: state.widget.managerPhone,
  };
};

const mapDispatchToProps = dispatch =>
  ({
    managerPhoneUpdate(payload) {
      dispatch(managerPhoneUpdate(payload));
    },
  });

export default connect(mapStateToProps, mapDispatchToProps)(withSnackbar(Settings));
