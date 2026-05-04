import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { isEqual as _isEqual, get as _get, isNaN as _isNaN } from 'lodash';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  Tooltip,
  Typography,
  FormControlLabel,
  TableSortLabel,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import Rest from 'tools/rest';
import Preloader from 'components/preloader';
import Pagination from 'components/pagination';
import { withStyles } from '@material-ui/core/styles';

import dayjs from 'dayjs';
import NumberFormat from 'react-number-format';

import { FloatButton, DatePicker, Select, Button, Checkbox, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import Row from './components/row';

class ReportsSaldo extends Component {
  state = {
    loading: false,
    totals: {},
    rows: [],
    meta: {
      page: 1,
      per: 50,
      order: 'desc',
      order_by: '',
    },
    filter: {
      date: dayjs().subtract(1, 'month').startOf('month').format('DD.MM.YYYY'),
    },
    cols: [
      { id: 'number', label: 'Лицевой счет' },
      { id: 'name', label: 'Имя' },
      { id: 'address', label: 'Адрес' },
      { id: 'saldo.start', label: 'Сальдо на начало' },
      { id: 'fee', label: 'Начисления' },
      { id: 'payments.total', label: 'Оплаты' },
      { id: 'saldo.end', label: 'Сальдо' },
    ],
  };

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    // if (
    //   // prevState.meta.page !== this.state.meta.page ||
    //   // prevState.meta.per !== this.state.meta.per ||
    //   // prevState.meta.order !== this.state.meta.order ||
    //   // prevState.meta.order_by !== this.state.meta.order_by ||
    //   !_isEqual(prevState.filter, this.state.filter)
    // ) {
    //   this.setState({ loading: true });
    //   setTimeout(() => this.loadData(), 1000);
    // }
  }

  loadData = () => {
    const {
      meta: { page, per, order, order_by },
      filter,
    } = this.state;
    this.setState({ loading: true });

    let params = { page, per, order, order_by, filter };

    Rest.get('/api/v1/reports/saldo.json', { params: params }).then((response) => {
      const { rows, meta } = response.data;
      let totals = {
        saldo: { start: 0, end: 0 },
        payments: { total: 0 },
        fee: 0,
      };

      rows.forEach((e) => {
        var ss = parseFloat(_get(e, 'saldo.start'));
        var se = parseFloat(_get(e, 'saldo.end'));
        var p = parseFloat(_get(e, 'payments.total'));
        var f = parseFloat(_get(e, 'fee'));

        totals.saldo.start += _isNaN(ss) ? 0 : ss;
        totals.saldo.end += _isNaN(se) ? 0 : se;
        totals.payments.total += _isNaN(p) ? 0 : p;
        totals.fee += _isNaN(f) ? 0 : f;
      });

      this.setState({
        rows: rows,
        // meta,
        totals,
        loading: false,
      });
    });
  };

  // handleChangePage = (event, page) => {
  //   this.setState({
  //     meta: { ...this.state.meta, page: page + 1 }
  //   });
  // };

  // handleChangeRowsPerPage = event => {
  //   this.setState({
  //     meta: { ...this.state.meta, per: parseInt(event.target.value) }
  //   });
  // };

  // handleFilter = name => event => {
  //   this.setState({
  //     filter: { ...this.state.filter, [name]: event.target.value }
  //   });
  // };

  // handleCheckboxFilter = name => event => {
  //   this.setState({
  //     filter: { ...this.state.filter, [name]: event.target.checked }
  //   });
  // };

  handleDateFilter = (name) => (value) => {
    let dates = null;
    if (Array.isArray(value)) {
      dates = value.map((d) => {
        return d ? d.format('DD.MM.YYYY') : null;
      });
    } else {
      dates = value ? value.format('DD.MM.YYYY') : null;
    }
    this.setState({
      filter: { ...this.state.filter, [name]: dates },
    });
  };

  // handleSelectFilter = name => (value, _) => {
  //   this.setState({
  //     filter: { ...this.state.filter, [name]: value }
  //   });
  // };

  // handleRequestSort = (event, order_by) => {
  //   let order = "desc";

  //   if (
  //     this.state.meta.order_by === order_by &&
  //     this.state.meta.order === "desc"
  //   ) {
  //     order = "asc";
  //   }

  //   this.setState({ meta: { ...this.state.meta, order, order_by } });
  // };

  render() {
    const {
      loading,
      rows,
      filter,
      cols,
      totals,
      meta: { per, page, total, order, order_by },
    } = this.state;

    const { classes } = this.props;

    return (
      <Fragment>
        <FloatButton.BackTop />

        <PageHeader title="Отчет по сальдо">
          Выберите месяц:&nbsp;&nbsp;
          <DatePicker
            format={'DD.MM.YYYY'}
            value={filter.date ? dayjs(filter.date, 'DD.MM.YYYY') : null}
            onChange={this.handleDateFilter('date')}
          />
          <Button onClick={this.loadData}>Показать</Button>
        </PageHeader>

        <Preloader loading={loading}>
          <Paper>
            <Table padding="dense">
              <TableHead>
                <TableRow>
                  {cols.map((col) => (
                    <TableCell key={col.id}>
                      <Tooltip title="Sort" placement={'bottom-start'} enterDelay={300}>
                        <TableSortLabel
                          active={order_by === col.id}
                          direction={order}
                          onClick={(event) => this.handleRequestSort(event, col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return <Row key={row.agrm_id} cols={cols} row={row} classes={classes} />;
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  {cols.map((col) =>
                    col.id === 'fee' ||
                    col.id === 'payments.total' ||
                    col.id === 'saldo.start' ||
                    col.id === 'saldo.end' ? (
                      <TableCell>
                        <NumberFormat
                          value={_get(totals, col.id)}
                          thousandSeparator={' '}
                          decimalScale={2}
                          displayType={'text'}
                          prefix={''}
                        />
                      </TableCell>
                    ) : (
                      <TableCell />
                    ),
                  )}
                </TableRow>
                {/* <TableRow>
                  {total ? (
                    <TablePagination
                      colSpan={9}
                      count={total}
                      rowsPerPage={per}
                      page={page - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      ActionsComponent={Pagination}
                    />
                  ) : (
                    ""
                  )}
                </TableRow> */}
              </TableFooter>
            </Table>
          </Paper>
        </Preloader>
      </Fragment>
    );
  }
}

const styles = (theme) => ({
  yellowCell: {
    backgroundColor: 'yellow',
  },
});

ReportsSaldo.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ReportsSaldo);
