import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { isEqual } from 'lodash';
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

import IrcCompareRow from './components/row';

class IrcCompare extends Component {
  state = {
    loading: false,
    totals: {},
    rows: [],
    meta: {
      page: 1,
      per: 50,
      order: 'desc',
      order_by: 'pay_date',
    },
    filter: {
      // pay_date: [],
      // buh_date: null,
      address: '',
      agrm_id_type: 'all',
      fee_diff: true,
      saldo_diff: false,
      agrm_number: null,
    },
    cols: [
      // { id: "id", label: "ID" },
      { id: 'agrm_number', label: 'Лицевой счет' },
      { id: 'address', label: 'Адрес' },
      { id: 'date', label: 'Дата' },
      { id: 'fee', label: 'ИРЦ Начисления' },
      { id: 'billing_fee', label: 'Билл. начисления' },
      { id: 'saldo', label: 'ИРЦ Сальдо' },
      { id: 'billing_saldo', label: 'Билл. сальдо' },
      // { id: "billing_address", label: "Билл. адрес" },
    ],
  };

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.meta.order !== this.state.meta.order ||
      prevState.meta.order_by !== this.state.meta.order_by ||
      !isEqual(prevState.filter, this.state.filter)
    ) {
      this.loadData();
    }
  }

  loadData = () => {
    const {
      meta: { page, per, order, order_by },
      filter,
    } = this.state;
    this.setState({ loading: true });

    let params = { page, per, order, order_by, filter };

    Rest.get('/api/v1/irc_account_saldos.json', { params: params }).then((response) => {
      let { rows, totals, meta } = response.data;

      this.setState({
        rows: rows,
        meta,
        totals,
        loading: false,
      });
    });
  };

  handleChangePage = (event, page) => {
    this.setState({
      meta: { ...this.state.meta, page: page + 1 },
    });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({
      meta: { ...this.state.meta, per: parseInt(event.target.value) },
    });
  };

  handleFilter = (name) => (event) => {
    this.setState({
      filter: { ...this.state.filter, [name]: event.target.value },
    });
  };

  handleCheckboxFilter = (name) => (event) => {
    this.setState({
      filter: { ...this.state.filter, [name]: event.target.checked },
    });
  };

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

  handleSelectFilter = (name) => (value, _) => {
    this.setState({
      filter: { ...this.state.filter, [name]: value },
    });
  };

  handleRequestSort = (event, order_by) => {
    let order = 'desc';

    if (this.state.meta.order_by === order_by && this.state.meta.order === 'desc') {
      order = 'asc';
    }

    this.setState({ meta: { ...this.state.meta, order, order_by } });
  };

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

        <PageHeader
          title="ИРЦ сальдо"
          extra={[
            <Button key="load_file">
              <Link to={'/irc_compare/load_file'}>Загрузить файл</Link>
            </Button>,
          ]}
        ></PageHeader>

        <Preloader loading={loading}>
          <Paper>
            <Select
              defaultValue={filter.agrm_id_type}
              style={{ width: 150 }}
              onChange={this.handleSelectFilter('agrm_id_type')}
            >
              <Select.Option value={'all'}>Все</Select.Option>
              <Select.Option value={'only_empty'}>Договор не найден</Select.Option>
              <Select.Option value={'wo_empty'}>Договор найден</Select.Option>
            </Select>
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
                <TableRow>
                  <TableCell>
                    <Input
                      value={filter.agrm_number}
                      placeholder="Лицевой счет"
                      onChange={this.handleFilter('agrm_number')}
                      // addonAfter={}
                    />
                    {/* <Checkbox
                      checked={filter.agrm_id_nil}
                      onChange={this.handleCheckboxFilter("agrm_id_nil")}
                    >
                      Только нулевые
                    </Checkbox> */}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={filter.address}
                      placeholder="Адрес"
                      onChange={this.handleFilter('address')}
                      // addonAfter={}
                    />
                  </TableCell>
                  <TableCell />

                  <TableCell colSpan={2}>
                    <Checkbox
                      checked={filter.fee_diff}
                      onChange={this.handleCheckboxFilter('fee_diff')}
                    >
                      Различие в начислениях
                    </Checkbox>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Checkbox
                      checked={filter.saldo_diff}
                      onChange={this.handleCheckboxFilter('saldo_diff')}
                    >
                      Различие в сальдо
                    </Checkbox>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return <IrcCompareRow key={row.id} cols={cols} row={row} classes={classes} />;
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  {cols.map((col) =>
                    col.id === 'fee' ||
                    col.id === 'billing_fee' ||
                    col.id === 'saldo' ||
                    col.id === 'billing_saldo' ? (
                      <TableCell>
                        <NumberFormat
                          value={totals[col.id]}
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
                <TableRow>
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
                    ''
                  )}
                </TableRow>
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

IrcCompare.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IrcCompare);
