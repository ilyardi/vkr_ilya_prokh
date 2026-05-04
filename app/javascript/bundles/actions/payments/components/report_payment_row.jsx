import React, { Component, Fragment } from 'react';
import { isEqual, map as _map } from 'lodash';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Checkbox,
  CircularProgress,
} from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import NumberFormat from 'react-number-format';

import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';

const { Option } = Select;

class ReportPaymentRow extends Component {
  state = {
    deleting: false,
  };

  statuses = {
    0: 'Проведен',
    1: 'Подтвержден сверкой',
    2: 'Аннулирован',
  };

  handleUpdate = (date) => {
    const { onUpdate } = this.props;
    let params = {
      lb_payment: {
        buh_date: date || '',
      },
    };

    Rest.put(`/api/v1/lb_payments/${this.props.payment.record_id}.json`, params).then(
      (response) => {
        const { payment } = response.data;

        if (!payment.buh_date) {
          payment.buh_date = '';
        }

        if (onUpdate) {
          onUpdate(payment);
        }
      },
    );
  };

  handleChangeServiceType = (value) => {
    const { onUpdate } = this.props;
    const params = {
      lb_payment: {
        teleset_service_type: value,
      },
    };

    Rest.put(`/api/v1/lb_payments/${this.props.payment.record_id}.json`, params).then(
      (response) => {
        const { payment } = response.data;
        if (onUpdate) {
          onUpdate(payment);
        }
      },
    );
  };

  handleDelete = (e) => {
    e.preventDefault();

    const { onUpdate } = this.props;

    if (!this.canDelete()) return;
    this.setState({ deleting: true });

    Rest.delete(`/api/v1/lb_payments/${this.props.payment.record_id}.json`)
      .then((res) => {
        if (onUpdate) {
          onUpdate(res.data.payment);
        }
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ deleting: false });
      });
  };

  renderCell = (col) => {
    const { classes, payment, service_type } = this.props;
    // const { service_type } = this.state
    switch (col.id) {
      case 'agrm_number': {
        return (
          <Fragment>
            {payment[col.id]}
            <br />
            <Typography variant="caption" gutterBottom>
              id: {payment['record_id']}
            </Typography>
          </Fragment>
        );
      }
      case 'status':
        return (
          <>
            <div>{this.statuses[payment.status]}</div>
            {payment.cancel_date && <div className={classes.statusDate}>{payment.cancel_date}</div>}
          </>
        );
      case 'buh_date':
        return (
          <Can I="update" a="LbPayment" passThrough>
            {(allowed) =>
              allowed ? (
                <DatePicker
                  format={'DD.MM.YYYY'}
                  value={payment[col.id] == 0 ? null : dayjs.unix(payment[col.id])}
                  onChange={this.handleUpdate}
                />
              ) : (
                <span>
                  {payment[col.id] == 0 ? null : dayjs.unix(payment[col.id]).format('DD.MM.YYYY')}
                </span>
              )
            }
          </Can>
        );
      case 'amount':
        return (
          <NumberFormat
            value={payment[col.id]}
            thousandSeparator={' '}
            decimalScale={2}
            displayType={'text'}
            prefix={''}
          />
        );
      case 'teleset_service_type':
        if (this.props.payment.account_type == 1) {
          return (
            <Select
              name={'teleset_service_type'}
              style={{ width: 200 }}
              value={this.props.payment.teleset_service_type}
              placeholder="тип договора"
              onChange={this.handleChangeServiceType}
              allowClear
            >
              {_map(service_type, (value, key) => {
                return <Select.Option key={key}>{value}</Select.Option>;
              })}
            </Select>
          );
        }
      default:
        return payment[col.id];
    }
  };

  canDelete() {
    const { payment } = this.props;
    return (
      payment.class_name == 'Доверительный платеж' &&
      payment.status != 2 &&
      this.context.can('destroy', 'LbPayment')
    );
  }

  render() {
    const { payment, cols, onSelect, selected } = this.props;
    const { deleting } = this.state;

    return (
      <TableRow onClick={(event) => onSelect(event, payment)} selected={!!selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={!!selected} />
        </TableCell>
        {cols.map((col) => (
          <TableCell key={col.id}>{this.renderCell(col)}</TableCell>
        ))}
        <TableCell>
          <Can I="destroy" a="LbPayment">
            <IconButton
              title="Удалить"
              color="secondary"
              disabled={!this.canDelete()}
              onClick={deleting ? null : this.handleDelete}
            >
              {!deleting ? <DeleteIcon /> : <CircularProgress size={24} />}
            </IconButton>
          </Can>
        </TableCell>
      </TableRow>
    );
  }
}

ReportPaymentRow.contextType = AbilityContext;

ReportPaymentRow.propTypes = {
  classes: PropTypes.object.isRequired,
  payment: PropTypes.object.isRequired,
  cols: PropTypes.array.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onUpdate: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    current_user_role: state.user.role,
    // current_user_id: state.user.id
  };
};

export default ReportPaymentRow;
