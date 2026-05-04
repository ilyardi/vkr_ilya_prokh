import React, { Component } from "react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import dayjs from 'dayjs';
// import { withStyles } from '@material-ui/core/styles';
import { Typography, TableRow, TableCell } from "@material-ui/core";

class CallRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      call: props.call,
      saving: false
    };
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps)) {
      nextState.call = nextProps.call;
    }
  }

  // handleResend = e => {
  //   e.preventDefault();

  //   api.put(`/api/v1/payments/${this.state.call.id}/resend.json`)
  //     .then(res => {
  //       this.setState({ payment: res.data.payment });
  //     })
  //     .catch(e => {
  //       console.error('error', e);
  //     });
  // }

  render() {
    // const { classes } = this.props;
    const { call } = this.state;

    // const GreenChip = withStyles({
    //   root: {
    //     backgroundColor: colorGreen[500],
    //   },
    // })(Chip);

    return (
      <TableRow>
        <TableCell component="th" scope="row">
          {call.id}
        </TableCell>
        <TableCell>
          {call.account.name}
          <Typography variant="caption" gutterBottom>
            {call.account.address_connect}
          </Typography>
        </TableCell>
        <TableCell>{call.manager.fio}</TableCell>
        <TableCell>{call.call_reason}</TableCell>
        <TableCell>
          {dayjs.unix(call.created_at).format("DD MMMM YYYY H:mm:ss")}
        </TableCell>
      </TableRow>
    );
  }
}

CallRow.propTypes = {
  // classes: PropTypes.object.isRequired,
  call: PropTypes.object.isRequired
};

export default CallRow;
