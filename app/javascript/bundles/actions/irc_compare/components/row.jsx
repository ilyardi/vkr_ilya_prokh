import React, { Component, Fragment } from "react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
// import { withStyles } from "@material-ui/core/styles";
import {
  TableRow,
  TableCell,
  Typography,
  // Tooltip,
  // Chip,
  IconButton,
  CircularProgress
} from "@material-ui/core";
import { Update as UpdateIcon } from "@material-ui/icons";
// import { green, yellow } from "@material-ui/core/colors";

import Rest from "tools/rest";

import NumberFormat from "react-number-format";

class IrcCompareRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      row: props.row,
      saving: false
    };
  }

  // use componentDidUpdate
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps)) {
      nextState.row = nextProps.row;
    }
  }

  handleUpdate = e => {
    e.preventDefault();
    this.setState({ saving: true });

    Rest.put(`/api/v1/irc_account_saldos/${this.state.row.id}/reload.json`)
      .then(res => {
        this.setState({ row: res.data.row });
      })
      .catch(e => {
        console.error("error", e);
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  render() {
    const { classes, cols } = this.props;
    const { saving, row } = this.state;

    const renderCell = (row, col) => {
      switch (col.id) {
        case "fee":
        case "billing_fee":
          return (
            <TableCell
              key={col.id}
              className={row.fee != row.billing_fee ? classes.yellowCell : null}
            >
              <NumberFormat
                value={row[col.id]}
                thousandSeparator={" "}
                decimalScale={2}
                displayType={"text"}
                prefix={""}
              />
            </TableCell>
          );
        case "saldo":
        case "billing_saldo":
          return (
            <TableCell
              key={col.id}
              className={
                row.saldo != row.billing_saldo ? classes.yellowCell : null
              }
            >
              <NumberFormat
                value={row[col.id]}
                thousandSeparator={" "}
                decimalScale={2}
                displayType={"text"}
                prefix={""}
              />
            </TableCell>
          );

        case "date":
          return (
            <TableCell key={col.id}>
              <Typography noWrap={true}>{row[col.id]}</Typography>
            </TableCell>
          );
        case "agrm_number":
          return (
            <TableCell key={col.id}>
              <Fragment>
                <Typography
                  variant="caption"
                  gutterBottom
                  title={`agrm_id: ${row["agrm_id"]}`}
                >
                  {row[col.id]}
                </Typography>
              </Fragment>
            </TableCell>
          );
        default:
          return <TableCell key={col.id}>{row[col.id]}</TableCell>;
      }
    };

    return (
      <TableRow>
        {cols.map(col => {
          return renderCell(row, col);
        })}
        <TableCell>
          <IconButton
            title="Обновить"
            color="secondary"
            onClick={saving ? null : this.handleUpdate}
          >
            {!saving ? <UpdateIcon /> : <CircularProgress size={24} />}
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }
}

IrcCompareRow.propTypes = {
  classes: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
  cols: PropTypes.array.isRequired
};

export default IrcCompareRow;
