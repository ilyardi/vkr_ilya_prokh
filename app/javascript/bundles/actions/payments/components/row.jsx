import React, { Component } from "react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableCell,
  Typography,
  Tooltip,
  Chip,
  IconButton
} from "@material-ui/core";
import UpdateIcon from "@material-ui/icons/Update";
import { green, yellow } from "@material-ui/core/colors";

import Rest from "tools/rest";

import NumberFormat from "react-number-format";

class PaymentRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      payment: props.payment,
      saving: false
    };
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps)) {
      nextState.payment = nextProps.payment;
    }
  }

  handleResend = e => {
    e.preventDefault();

    Rest
      .put(`/api/v1/payments/${this.state.payment.id}/resend.json`)
      .then(res => {
        this.setState({ payment: res.data.payment });
      })
      .catch(e => {
        console.error("error", e);
      });
  };

  render() {
    const { classes, report } = this.props;
    const { saving, payment } = this.state;

    const GreenChip = withStyles({
      root: {
        backgroundColor: green[500]
      }
    })(Chip);

    const YellowChip = withStyles({
      root: {
        backgroundColor: yellow[500]
      }
    })(Chip);

    return (
      <TableRow>
        <TableCell component="th" scope="row">
          {payment.id}
        </TableCell>
        <TableCell>
          {payment.account_number}
          <Typography variant="caption" gutterBottom>
            {payment.source_address}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <NumberFormat
            value={payment.amount}
            thousandSeparator={" "}
            decimalScale={2}
            displayType={"text"}
            prefix={""}
          />
        </TableCell>
        <TableCell>
          {payment.status == "error" && (
            <Tooltip
              title={payment.lanbilling_error || "error"}
              placement="bottom"
            >
              <Chip label={payment.status} color="secondary" />
            </Tooltip>
          )}
          {payment.status == "done" && (
            <Tooltip
              title={payment.lanbilling_error || ""}
              placement="bottom"
            >
              <GreenChip label={payment.status} />
            </Tooltip>
          )}
          {payment.status == "empty" && <Chip label={payment.status} />}
          {payment.status == "unprocessable" && (
            <Tooltip
              title={payment.lanbilling_error || ""}
              placement="bottom"
            >
              <YellowChip label={payment.status} />
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          {payment.ofd_status == "ofd_error" && (
            <Tooltip title={payment.ofd_errors || "error"} placement="bottom">
              <Chip label={"error"} color="secondary" />
            </Tooltip>
          )}
          {payment.ofd_status == "ofd_done" && <GreenChip label={"done"} />}
          {payment.ofd_status == "ofd_empty" && <Chip label={"empty"} />}
          {payment.ofd_status == "ofd_unprocessable" && (
            <YellowChip label={"unprocessable"} />
          )}
        </TableCell>
        <TableCell className={classes.nowrap}>
          {payment.source_type} - {payment.source_id}
        </TableCell>
        <TableCell>{payment.banknam}</TableCell>
        <TableCell>{payment.paid_at}</TableCell>
        <TableCell>{payment.added_at}</TableCell>
        <TableCell align="right">{payment.lanbilling_id}</TableCell>
        <TableCell>
          {payment.status != "done" && !saving && (
            <IconButton
              title="Отправить в Lanbilling"
              color="secondary"
              onClick={this.handleResend}
            >
              <UpdateIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    );
  }
}

PaymentRow.propTypes = {
  classes: PropTypes.object.isRequired,
  payment: PropTypes.object.isRequired
};

export default PaymentRow;
