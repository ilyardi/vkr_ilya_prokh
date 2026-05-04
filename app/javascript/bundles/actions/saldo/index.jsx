import React, { Component, Fragment } from 'react';
import {
  isEqual as _isEqual,
  get as _get,
  isNaN as _isNaN,
  replace as _replace,
  map as _map,
  sumBy as _sumBy
} from 'lodash';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableFooter,
  Paper,
  Link as LinkUI,
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FloatButton, DatePicker, Row, Col, Input, Checkbox, Tooltip, Radio, Button, Table as AntTable } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Preloader from 'components/preloader';
import NumFormat from 'components/num-format';
// import { Link } from "react-router-dom";
import dayjs from 'dayjs';

import Rest from 'tools/rest';
import GotoAccountButton from 'components/widget/goto_account_button';

class Saldo extends Component {
  state = {
    loading: false,
    rows: [],
    total_saldo: {},
    reserves: [],
    saldos: {},
    meta: {},
    headerMenuEl: null,
    filter: {
      agrm_id: null,
      number: null,
      only: null,
      type: null,
    },
  };

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Сальдо', '')
  }

  componentDidMount() {
    document.title += ' | Сальдо'
    this.loadData(1);
    this.loadReserves();
  }

  handleChangePage = (e, page) => {
    this.loadData(page + 1);
  };

  handleChangeRowsPerPage = (e) => {
    this.loadData(this.state.meta.page, e.target.value);
  };

  handleFilter = (name) => (event) => {
    this.setState({
      filter: { ...this.state.filter, [name]: event.target.value },
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

  handleCheckboxFilter = (name) => (event) => {
    this.setState({
      filter: {
        ...this.state.filter,
        [name]: event.target.checked ? event.target.value : null,
      },
    });
  };

  handleULCsvReport = () => {
    let params = {
      filter: this.state.filter.date,
    };
    // Rest.get('/api/v1/saldos/ur_csv_report.csv', { params: params }).then((response) => {
    // });
    window.open(`/api/v1/saldos/ur_csv_report.csv?date=${this.state.filter.date}`)
  };

  handleAgrmsCsvReport = () => {
    let params = {
      filter: this.state.filter.date,
    };
    // Rest.get('/api/v1/saldos/ur_csv_report.csv', { params: params }).then((response) => {
    // });
    window.open(`/api/v1/saldos/agrms_csv_report.csv?date=${this.state.filter.date}`)
  };

  loadData = (page, per = this.state.meta.per) => {
    let params = {
      page: page,
      per: per,
      filter: this.state.filter,
    };
    this.setState({ loading: true });
    Rest.get('/api/v1/saldos.json', { params: params }).then((response) => {
      this.setState({ loading: false });
      this.setState(response.data);
    });
  };

  loadReserves = () => {
    let params = {
      filter: this.state.filter
    };
    Rest.get('/api/v1/saldos/reserves_report.json', { params: params })
    .then((response) => {
      this.setState({
        ...this.state,
        reserves: response.data.result
      });
    });
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (!_isEqual(prevState.filter, this.state.filter)) {
      this.loadData(1);
      this.loadReserves();
    }
  };

  handleHeaderMenuClick = (event) => {
    this.setState({ headerMenuEl: event.currentTarget });
  };

  handleHeaderMenuClose = () => {
    this.setState({ headerMenuEl: null });
  };

  render() {
    const { classes } = this.props;
    const { loading, filter, rows, saldos, total_saldo, reserves } = this.state;
    var dates = Object.keys(total_saldo).sort();

    return (
      <React.Fragment>
        <FloatButton.BackTop />

        <PageHeader title="Сальдо">
          <Row gutter={24}>
            <Col span={4}>
              <DatePicker
                format={'DD.MM.YYYY'}
                placeholder="Месяц"
                value={filter.date ? dayjs(filter.date, 'DD.MM.YYYY') : null}
                onChange={this.handleDateFilter('date')}
              />
            </Col>
            <Col span={4}>
              <Input
                value={filter.agrm_id}
                placeholder="agrm_id"
                onChange={this.handleFilter('agrm_id')}
              />
            </Col>
            <Col span={4}>
              <Input
                value={filter.number}
                placeholder="Лицевой счет"
                onChange={this.handleFilter('number')}
              />
            </Col>
            <Col span={4}>
              <Radio.Group
                name="filder_type"
                onChange={this.handleFilter('type')}
                value={filter.type}
              >
                <Radio value={null}>Все</Radio>
                <Radio value={2}>Физ.лица</Radio>
                <Radio value={1}>Юр.лица</Radio>
              </Radio.Group>
            </Col>
            <Col span={4}>
              <Button onClick={(e)=>{this.handleULCsvReport()}}>Отчет по ЮЛ</Button>
              <Button onClick={(e) => { this.handleAgrmsCsvReport() }}>Отчет по ФЛ</Button>
            </Col>
          </Row>
        </PageHeader>

        <Preloader loading={loading}>
          <div className={classes.tableContainer}>
            <Paper>
              <Table className={classes.table} padding="checkbox">
                <TableHead>
                  <TableRow>
                    {/* <TableCell>ID</TableCell>
                    <TableCell className={classes.nowrap}>Лицевой счет</TableCell> */}
                    {/* <TableCell>Адрес</TableCell> */}
                    <TableCell></TableCell>
                    <TableCell>{dates[0]}</TableCell>
                    <TableCell>Переплата</TableCell>
                    <TableCell>Долг</TableCell>
                    <TableCell>Начисления</TableCell>
                    <TableCell>Оплаты</TableCell>
                    <TableCell>Корректировки</TableCell>
                    <TableCell>{dates[1]}</TableCell>
                    <TableCell>Переплата</TableCell>
                    <TableCell>Долг</TableCell>
                  </TableRow>
                  <TableRow>
                    {/* <TableCell colSpan={3}>Сумма:</TableCell> */}
                    <TableCell>
                      Интернет
                      <br />
                      Интернет&nbsp;разовые
                      <br />
                      Интернет&nbsp;период.
                      <br />
                      ТВ
                      <br />
                      ТВ разовые
                      <br />
                      ТВ период.
                      <br />
                      Видео
                      <br />
                      Другое
                      <br />
                      Умный домофон
                      <br />
                      ТО домофон
                      <br />
                      Итого интернет:
                      <br />
                      Итого ТВ:
                      <br />
                      Итого:
                    </TableCell>
                    <TableCell>
                      <NumFormat value={total_saldo[dates[0]]?.saldo_internet || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_internet_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_internet_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_tv || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_tv_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_tv_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_video || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_other || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_ud || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.saldo_to_dom || 0} />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.saldo_internet +
                          total_saldo[dates[0]]?.saldo_internet_ones +
                          total_saldo[dates[0]]?.saldo_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.saldo_tv +
                          total_saldo[dates[0]]?.saldo_tv_ones +
                          total_saldo[dates[0]]?.saldo_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.saldo_internet +
                          total_saldo[dates[0]]?.saldo_internet_ones +
                          total_saldo[dates[0]]?.saldo_internet_period +
                          total_saldo[dates[0]]?.saldo_tv +
                          total_saldo[dates[0]]?.saldo_tv_ones +
                          total_saldo[dates[0]]?.saldo_tv_period +
                          total_saldo[dates[0]]?.saldo_video +
                          total_saldo[dates[0]]?.saldo_other +
                          total_saldo[dates[0]]?.saldo_ud +
                          total_saldo[dates[0]]?.saldo_to_dom || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <NumFormat value={total_saldo[dates[0]]?.over_internet || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_internet_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_internet_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_tv || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_tv_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_tv_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_video || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_other || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_ud || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.over_to_dom || 0} />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.over_internet +
                          total_saldo[dates[0]]?.over_internet_ones +
                          total_saldo[dates[0]]?.over_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.over_tv +
                          total_saldo[dates[0]]?.over_tv_ones +
                          total_saldo[dates[0]]?.over_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          // total_saldo[dates[0]]?.over_internet +
                          // total_saldo[dates[0]]?.over_internet_ones +
                          // total_saldo[dates[0]]?.over_internet_period +
                          // total_saldo[dates[0]]?.over_tv +
                          // total_saldo[dates[0]]?.over_tv_ones +
                          // total_saldo[dates[0]]?.over_tv_period +
                          // total_saldo[dates[0]]?.over_video +
                          // total_saldo[dates[0]]?.over_other +
                          // total_saldo[dates[0]]?.over_ud +
                          // total_saldo[dates[0]]?.over_to_dom || 0
                          total_saldo[dates[0]]?.over || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <NumFormat value={total_saldo[dates[0]]?.dolg_internet || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_internet_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_internet_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_tv || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_tv_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_tv_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_video || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_other || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_ud || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[0]]?.dolg_to_dom || 0} />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.dolg_internet +
                          total_saldo[dates[0]]?.dolg_internet_ones +
                          total_saldo[dates[0]]?.dolg_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[0]]?.dolg_tv +
                          total_saldo[dates[0]]?.dolg_tv_ones +
                          total_saldo[dates[0]]?.dolg_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          // total_saldo[dates[0]]?.dolg_internet +
                          // total_saldo[dates[0]]?.dolg_internet_ones +
                          // total_saldo[dates[0]]?.dolg_internet_period +
                          // total_saldo[dates[0]]?.dolg_tv +
                          // total_saldo[dates[0]]?.dolg_tv_ones +
                          // total_saldo[dates[0]]?.dolg_tv_period +
                          // total_saldo[dates[0]]?.dolg_video +
                          // total_saldo[dates[0]]?.dolg_other +
                          // total_saldo[dates[0]]?.dolg_ud +
                          // total_saldo[dates[0]]?.dolg_to_dom || 0
                          total_saldo[dates[0]]?.dolg || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={filter.only == 'fee_internet'}
                        value={'fee_internet'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_internet || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_internet_ones'}
                        value={'fee_internet_ones'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_internet_ones || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_internet_period'}
                        value={'fee_internet_period'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_internet_period || 0} />
                      </Checkbox>
                      <br />
                      <Tooltip
                        title={
                          <React.Fragment>
                            <NumFormat
                              value={
                                total_saldo[dates[1]]?.fee_tv - total_saldo[dates[1]]?.total * 78
                              }
                            />
                            {' + '}
                            <NumFormat value={total_saldo[dates[1]]?.total * 78} />
                          </React.Fragment>
                        }
                      >
                        <Checkbox
                          checked={filter.only == 'fee_tv'}
                          value={'fee_tv'}
                          onChange={this.handleCheckboxFilter('only')}
                        >
                          <NumFormat value={total_saldo[dates[1]]?.fee_tv || 0} />
                        </Checkbox>
                      </Tooltip>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_tv_ones'}
                        value={'fee_tv_ones'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_tv_ones || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_tv_period'}
                        value={'fee_tv_period'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_tv_period || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_video'}
                        value={'fee_video'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_video || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_other'}
                        value={'fee_other'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_other || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_ud'}
                        value={'fee_ud'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_ud || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'fee_to_dom'}
                        value={'fee_to_dom'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.fee_to_dom || 0} />
                      </Checkbox>
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.fee_internet +
                          total_saldo[dates[1]]?.fee_internet_ones +
                          total_saldo[dates[1]]?.fee_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.fee_tv +
                          total_saldo[dates[1]]?.fee_tv_ones +
                          total_saldo[dates[1]]?.fee_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.fee_internet +
                          total_saldo[dates[1]]?.fee_internet_ones +
                          total_saldo[dates[1]]?.fee_internet_period +
                          total_saldo[dates[1]]?.fee_tv +
                          total_saldo[dates[1]]?.fee_tv_ones +
                          total_saldo[dates[1]]?.fee_tv_period +
                          total_saldo[dates[1]]?.fee_video +
                          total_saldo[dates[1]]?.fee_other +
                          total_saldo[dates[1]]?.fee_ud +
                          total_saldo[dates[1]]?.fee_to_dom || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={filter.only == 'payment_internet'}
                        value={'payment_internet'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_internet || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_internet_ones'}
                        value={'payment_internet_ones'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_internet_ones || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_internet_period'}
                        value={'payment_internet_period'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_internet_period || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_tv'}
                        value={'payment_tv'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_tv || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_tv_ones'}
                        value={'payment_tv_ones'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_tv_ones || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_tv_period'}
                        value={'payment_tv_period'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_tv_period || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_video'}
                        value={'payment_video'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_video || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_other'}
                        value={'payment_other'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_other || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_ud'}
                        value={'payment_ud'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_ud || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'payment_to_dom'}
                        value={'payment_to_dom'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.payment_to_dom || 0} />
                      </Checkbox>
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.payment_internet +
                          total_saldo[dates[1]]?.payment_internet_ones +
                          total_saldo[dates[1]]?.payment_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.payment_tv +
                          total_saldo[dates[1]]?.payment_tv_ones +
                          total_saldo[dates[1]]?.payment_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.payment_internet +
                          total_saldo[dates[1]]?.payment_internet_ones +
                          total_saldo[dates[1]]?.payment_internet_period +
                          total_saldo[dates[1]]?.payment_tv +
                          total_saldo[dates[1]]?.payment_tv_ones +
                          total_saldo[dates[1]]?.payment_tv_period +
                          total_saldo[dates[1]]?.payment_video +
                          total_saldo[dates[1]]?.payment_other +
                          total_saldo[dates[1]]?.payment_ud +
                          total_saldo[dates[1]]?.payment_to_dom || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={filter.only == 'correction_internet'}
                        value={'correction_internet'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_internet || 0} />
                      </Checkbox>
                      <br />
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_internet_period'}
                        value={'correction_internet_period'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_internet_period || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_tv'}
                        value={'correction_tv'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_tv || 0} />
                      </Checkbox>
                      <br />
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_tv_period'}
                        value={'correction_tv_period'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_tv_period || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_video'}
                        value={'correction_video'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_video || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_other'}
                        value={'correction_other'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_other || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_ud'}
                        value={'correction_ud'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_ud || 0} />
                      </Checkbox>
                      <br />
                      <Checkbox
                        checked={filter.only == 'correction_to_dom'}
                        value={'correction_to_dom'}
                        onChange={this.handleCheckboxFilter('only')}
                      >
                        <NumFormat value={total_saldo[dates[1]]?.correction_to_dom || 0} />
                      </Checkbox>
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.correction_internet +
                          total_saldo[dates[1]]?.correction_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.correction_tv +
                          total_saldo[dates[1]]?.correction_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.correction_internet +
                          total_saldo[dates[1]]?.correction_internet_period +
                          total_saldo[dates[1]]?.correction_tv +
                          total_saldo[dates[1]]?.correction_tv_period +
                          total_saldo[dates[1]]?.correction_video +
                          total_saldo[dates[1]]?.correction_other +
                          total_saldo[dates[1]]?.correction_ud +
                          total_saldo[dates[1]]?.correction_to_dom || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <NumFormat value={total_saldo[dates[1]]?.saldo_internet || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_internet_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_internet_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_tv || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_tv_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_tv_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_video || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_other || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_ud || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.saldo_to_dom || 0} />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.saldo_internet +
                          total_saldo[dates[1]]?.saldo_internet_ones +
                          total_saldo[dates[1]]?.saldo_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.saldo_tv +
                          total_saldo[dates[1]]?.saldo_tv_ones +
                          total_saldo[dates[1]]?.saldo_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.saldo_internet +
                          total_saldo[dates[1]]?.saldo_internet_ones +
                          total_saldo[dates[1]]?.saldo_internet_period +
                          total_saldo[dates[1]]?.saldo_tv +
                          total_saldo[dates[1]]?.saldo_tv_ones +
                          total_saldo[dates[1]]?.saldo_tv_period +
                          total_saldo[dates[1]]?.saldo_video +
                          total_saldo[dates[1]]?.saldo_other +
                          total_saldo[dates[1]]?.saldo_ud +
                          total_saldo[dates[1]]?.saldo_to_dom || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <NumFormat value={total_saldo[dates[1]]?.over_internet || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_internet_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_internet_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_tv || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_tv_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_tv_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_video || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_other || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_ud || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.over_to_dom || 0} />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.over_internet +
                          total_saldo[dates[1]]?.over_internet_ones +
                          total_saldo[dates[1]]?.over_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.over_tv +
                          total_saldo[dates[1]]?.over_tv_ones +
                          total_saldo[dates[1]]?.over_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          // total_saldo[dates[1]]?.over_internet +
                          // total_saldo[dates[1]]?.over_internet_ones +
                          // total_saldo[dates[1]]?.over_internet_period +
                          // total_saldo[dates[1]]?.over_tv +
                          // total_saldo[dates[1]]?.over_tv_ones +
                          // total_saldo[dates[1]]?.over_tv_period +
                          // total_saldo[dates[1]]?.over_video +
                          // total_saldo[dates[1]]?.over_other +
                          // total_saldo[dates[1]]?.over_ud +
                          // total_saldo[dates[1]]?.over_to_dom || 0
                          total_saldo[dates[1]]?.over || 0
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <NumFormat value={total_saldo[dates[1]]?.dolg_internet || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_internet_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_internet_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_tv || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_tv_ones || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_tv_period || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_video || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_other || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_ud || 0} />
                      <br />
                      <NumFormat value={total_saldo[dates[1]]?.dolg_to_dom || 0} />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.dolg_internet +
                          total_saldo[dates[1]]?.dolg_internet_ones +
                          total_saldo[dates[1]]?.dolg_internet_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          total_saldo[dates[1]]?.dolg_tv +
                          total_saldo[dates[1]]?.dolg_tv_ones +
                          total_saldo[dates[1]]?.dolg_tv_period || 0
                        }
                      />
                      <br />
                      <NumFormat
                        value={
                          // total_saldo[dates[1]]?.dolg_internet +
                          // total_saldo[dates[1]]?.dolg_internet_ones +
                          // total_saldo[dates[1]]?.dolg_internet_period +
                          // total_saldo[dates[1]]?.dolg_tv +
                          // total_saldo[dates[1]]?.dolg_tv_ones +
                          // total_saldo[dates[1]]?.dolg_tv_period +
                          // total_saldo[dates[1]]?.dolg_video +
                          // total_saldo[dates[1]]?.dolg_other +
                          // total_saldo[dates[1]]?.dolg_ud +
                          // total_saldo[dates[1]]?.dolg_to_dom || 0
                          total_saldo[dates[1]]?.dolg || 0
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Аванс</TableCell>
                    <TableCell>{total_saldo[dates[0]]?.advance}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>{total_saldo[dates[1]]?.advance}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Месяц</TableCell>
                    <TableCell>Резерв</TableCell>
                    <TableCell>Остаток</TableCell>
                    <TableCell>Январь</TableCell>
                    <TableCell>Февраль</TableCell>
                    <TableCell>Март</TableCell>
                    <TableCell>Апрель</TableCell>
                    <TableCell>Май</TableCell>
                    <TableCell>Июнь</TableCell>
                    <TableCell>Июль</TableCell>
                    <TableCell>Август</TableCell>
                    <TableCell>Сентябрь</TableCell>
                    <TableCell>Октябрь</TableCell>
                    <TableCell>Ноябрь</TableCell>
                    <TableCell>Декабрь</TableCell>
                  </TableRow>
                  {_map(reserves, (reserve) => {
                    return (
                      <TableRow>
                        <TableCell>{reserve["month"]}</TableCell>
                        <TableCell><NumFormat value={reserve["reserve_summ"] || 0} /></TableCell>
                        <TableCell><NumFormat value={reserve["reserve_balance"] || 0} /></TableCell>
                        <TableCell>{reserve["spends"]?.['01']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['02']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['03']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['04']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['05']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['06']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['07']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['08']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['09']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['10']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['11']?.["summ"] || 0}</TableCell>
                        <TableCell>{reserve["spends"]?.['12']?.["summ"] || 0}</TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>ИТОГО: </TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['01']?.["summ"] ? Number(reserve["spends"]?.['01']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['02']?.["summ"] ? Number(reserve["spends"]?.['02']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['03']?.["summ"] ? Number(reserve["spends"]?.['03']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['04']?.["summ"] ? Number(reserve["spends"]?.['04']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['05']?.["summ"] ? Number(reserve["spends"]?.['05']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['06']?.["summ"] ? Number(reserve["spends"]?.['06']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['07']?.["summ"] ? Number(reserve["spends"]?.['07']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['08']?.["summ"] ? Number(reserve["spends"]?.['08']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['09']?.["summ"] ? Number(reserve["spends"]?.['09']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['10']?.["summ"] ? Number(reserve["spends"]?.['10']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['11']?.["summ"] ? Number(reserve["spends"]?.['11']?.["summ"]) : 0 })}</TableCell>
                    <TableCell>{_sumBy(reserves, (reserve) => { return reserve["spends"]?.['12']?.["summ"] ? Number(reserve["spends"]?.['12']?.["summ"]) : 0 })}</TableCell>
                  </TableRow>
                </TableHead>
                {this.state.meta.page && (
                  <TableHead>
                    <TableRow>
                      <TablePagination
                        colSpan={16}
                        count={this.state.meta.total}
                        rowsPerPage={this.state.meta.per}
                        page={this.state.meta.page - 1}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      />
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell className={classes.nowrap}>Лицевой счет</TableCell>
                    <TableCell>Адрес</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{dates[0]}</TableCell>
                    <TableCell>Переплата</TableCell>
                    <TableCell>Долг</TableCell>
                    <TableCell>Начисления</TableCell>
                    <TableCell>Оплаты</TableCell>
                    <TableCell>Корректировки</TableCell>
                    <TableCell>{dates[1]}</TableCell>
                    <TableCell>Переплата</TableCell>
                    <TableCell>Долг</TableCell>
                  </TableRow>
                  {rows.map((row) => {
                    return (
                      <TableRow>
                        <TableCell>{row.agrm_id}</TableCell>
                        <TableCell>
                          <LinkUI
                            onClick={() => {
                              GotoAccountButton.gotoAccount(row.account.uid, {
                                target: '_blank',
                                actionWithHost: true,
                              });
                            }}
                          >
                            {row.number}&nbsp;
                            <FontAwesomeIcon icon="external-link-alt" />
                          </LinkUI>
                        </TableCell>
                        <TableCell>{row.account.address}</TableCell>
                        <TableCell>
                          Интернет
                          <br />
                          Интернет&nbsp;разовые
                          <br />
                          Интернет&nbsp;период.
                          <br />
                          ТВ
                          <br />
                          ТВ разовые
                          <br />
                          ТВ период.
                          <br />
                          Видео
                          <br />
                          Другое
                          <br />
                          Умный домофон
                          <br />
                          ТО домофон
                          <br />
                          Итого интернет:
                          <br />
                          Итого ТВ:
                          <br />
                          Итого:
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_internet || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_internet_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.saldo_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.saldo_internet +
                              saldos[dates[0]][row.agrm_id]?.saldo_internet_ones +
                              saldos[dates[0]][row.agrm_id]?.saldo_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.saldo_tv +
                              saldos[dates[0]][row.agrm_id]?.saldo_tv_ones +
                              saldos[dates[0]][row.agrm_id]?.saldo_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.saldo_internet +
                              saldos[dates[0]][row.agrm_id]?.saldo_internet_ones +
                              saldos[dates[0]][row.agrm_id]?.saldo_internet_period +
                              saldos[dates[0]][row.agrm_id]?.saldo_tv +
                              saldos[dates[0]][row.agrm_id]?.saldo_tv_ones +
                              saldos[dates[0]][row.agrm_id]?.saldo_tv_period +
                              saldos[dates[0]][row.agrm_id]?.saldo_video +
                              saldos[dates[0]][row.agrm_id]?.saldo_other +
                              saldos[dates[0]][row.agrm_id]?.saldo_ud +
                              saldos[dates[0]][row.agrm_id]?.saldo_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_internet || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_internet_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.over_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.over_internet +
                              saldos[dates[0]][row.agrm_id]?.over_internet_ones +
                              saldos[dates[0]][row.agrm_id]?.over_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.over_tv +
                              saldos[dates[0]][row.agrm_id]?.over_tv_ones +
                              saldos[dates[0]][row.agrm_id]?.over_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.over_internet +
                              saldos[dates[0]][row.agrm_id]?.over_internet_ones +
                              saldos[dates[0]][row.agrm_id]?.over_internet_period +
                              saldos[dates[0]][row.agrm_id]?.over_tv +
                              saldos[dates[0]][row.agrm_id]?.over_tv_ones +
                              saldos[dates[0]][row.agrm_id]?.over_tv_period +
                              saldos[dates[0]][row.agrm_id]?.over_video +
                              saldos[dates[0]][row.agrm_id]?.over_other +
                              saldos[dates[0]][row.agrm_id]?.over_ud +
                              saldos[dates[0]][row.agrm_id]?.over_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_internet || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_internet_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[0]][row.agrm_id]?.dolg_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.dolg_internet +
                              saldos[dates[0]][row.agrm_id]?.dolg_internet_ones +
                              saldos[dates[0]][row.agrm_id]?.dolg_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.dolg_tv +
                              saldos[dates[0]][row.agrm_id]?.dolg_tv_ones +
                              saldos[dates[0]][row.agrm_id]?.dolg_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[0]][row.agrm_id]?.dolg_internet +
                              saldos[dates[0]][row.agrm_id]?.dolg_internet_ones +
                              saldos[dates[0]][row.agrm_id]?.dolg_internet_period +
                              saldos[dates[0]][row.agrm_id]?.dolg_tv +
                              saldos[dates[0]][row.agrm_id]?.dolg_tv_ones +
                              saldos[dates[0]][row.agrm_id]?.dolg_tv_period +
                              saldos[dates[0]][row.agrm_id]?.dolg_video +
                              saldos[dates[0]][row.agrm_id]?.dolg_other +
                              saldos[dates[0]][row.agrm_id]?.dolg_ud +
                              saldos[dates[0]][row.agrm_id]?.dolg_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_internet || 0} />
                          <br />
                          <NumFormat
                            value={saldos[dates[1]][row.agrm_id]?.fee_internet_ones || 0}
                          />
                          <br />
                          <NumFormat
                            value={saldos[dates[1]][row.agrm_id]?.fee_internet_period || 0}
                          />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.fee_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.fee_internet +
                              saldos[dates[1]][row.agrm_id]?.fee_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.fee_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.fee_tv +
                              saldos[dates[1]][row.agrm_id]?.fee_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.fee_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.fee_internet +
                              saldos[dates[1]][row.agrm_id]?.fee_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.fee_internet_period +
                              saldos[dates[1]][row.agrm_id]?.fee_tv +
                              saldos[dates[1]][row.agrm_id]?.fee_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.fee_tv_period +
                              saldos[dates[1]][row.agrm_id]?.fee_video +
                              saldos[dates[1]][row.agrm_id]?.fee_other +
                              saldos[dates[1]][row.agrm_id]?.fee_ud +
                              saldos[dates[1]][row.agrm_id]?.fee_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_internet || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_internet_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.payment_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.payment_internet +
                              saldos[dates[1]][row.agrm_id]?.payment_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.payment_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.payment_tv +
                              saldos[dates[1]][row.agrm_id]?.payment_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.payment_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.payment_internet +
                              saldos[dates[1]][row.agrm_id]?.payment_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.payment_internet_period +
                              saldos[dates[1]][row.agrm_id]?.payment_tv +
                              saldos[dates[1]][row.agrm_id]?.payment_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.payment_tv_period +
                              saldos[dates[1]][row.agrm_id]?.payment_video +
                              saldos[dates[1]][row.agrm_id]?.payment_other +
                              saldos[dates[1]][row.agrm_id]?.payment_ud +
                              saldos[dates[1]][row.agrm_id]?.payment_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_internet || 0} />
                          <br />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_tv || 0} />
                          <br />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.correction_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.correction_internet +
                              saldos[dates[1]][row.agrm_id]?.correction_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.correction_tv +
                              saldos[dates[1]][row.agrm_id]?.correction_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.correction_internet +
                              saldos[dates[1]][row.agrm_id]?.correction_internet_period +
                              saldos[dates[1]][row.agrm_id]?.correction_tv +
                              saldos[dates[1]][row.agrm_id]?.correction_tv_period +
                              saldos[dates[1]][row.agrm_id]?.correction_video +
                              saldos[dates[1]][row.agrm_id]?.correction_other +
                              saldos[dates[1]][row.agrm_id]?.correction_ud +
                              saldos[dates[1]][row.agrm_id]?.correction_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_internet || 0} />
                          <br />
                          <NumFormat
                            value={saldos[dates[1]][row.agrm_id]?.saldo_internet_ones || 0}
                          />
                          <br />
                          <NumFormat
                            value={saldos[dates[1]][row.agrm_id]?.saldo_internet_period || 0}
                          />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.saldo_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.saldo_internet +
                              saldos[dates[1]][row.agrm_id]?.saldo_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.saldo_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.saldo_tv +
                              saldos[dates[1]][row.agrm_id]?.saldo_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.saldo_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.saldo_internet +
                              saldos[dates[1]][row.agrm_id]?.saldo_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.saldo_internet_period +
                              saldos[dates[1]][row.agrm_id]?.saldo_tv +
                              saldos[dates[1]][row.agrm_id]?.saldo_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.saldo_tv_period +
                              saldos[dates[1]][row.agrm_id]?.saldo_video +
                              saldos[dates[1]][row.agrm_id]?.saldo_other +
                              saldos[dates[1]][row.agrm_id]?.saldo_ud +
                              saldos[dates[1]][row.agrm_id]?.saldo_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_internet || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_internet_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.over_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.over_internet +
                              saldos[dates[1]][row.agrm_id]?.over_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.over_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.over_tv +
                              saldos[dates[1]][row.agrm_id]?.over_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.over_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.over_internet +
                              saldos[dates[1]][row.agrm_id]?.over_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.over_internet_period +
                              saldos[dates[1]][row.agrm_id]?.over_tv +
                              saldos[dates[1]][row.agrm_id]?.over_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.over_tv_period +
                              saldos[dates[1]][row.agrm_id]?.over_video +
                              saldos[dates[1]][row.agrm_id]?.over_other +
                              saldos[dates[1]][row.agrm_id]?.over_ud +
                              saldos[dates[1]][row.agrm_id]?.over_to_dom || 0
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_internet || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_internet_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_internet_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_tv || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_tv_ones || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_tv_period || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_video || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_other || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_ud || 0} />
                          <br />
                          <NumFormat value={saldos[dates[1]][row.agrm_id]?.dolg_to_dom || 0} />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.dolg_internet +
                              saldos[dates[1]][row.agrm_id]?.dolg_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.dolg_internet_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.dolg_tv +
                              saldos[dates[1]][row.agrm_id]?.dolg_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.dolg_tv_period || 0
                            }
                          />
                          <br />
                          <NumFormat
                            value={
                              saldos[dates[1]][row.agrm_id]?.dolg_internet +
                              saldos[dates[1]][row.agrm_id]?.dolg_internet_ones +
                              saldos[dates[1]][row.agrm_id]?.dolg_internet_period +
                              saldos[dates[1]][row.agrm_id]?.dolg_tv +
                              saldos[dates[1]][row.agrm_id]?.dolg_tv_ones +
                              saldos[dates[1]][row.agrm_id]?.dolg_tv_period +
                              saldos[dates[1]][row.agrm_id]?.dolg_video +
                              saldos[dates[1]][row.agrm_id]?.dolg_other +
                              saldos[dates[1]][row.agrm_id]?.dolg_ud +
                              saldos[dates[1]][row.agrm_id]?.dolg_to_dom || 0
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {this.state.meta.page && (
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        colSpan={16}
                        count={this.state.meta.total}
                        rowsPerPage={this.state.meta.per}
                        page={this.state.meta.page - 1}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      />
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </Paper>
          </div>
        </Preloader>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  nowrap: {
    whiteSpace: 'nowrap',
  },
  filterSourceType: {
    width: '150px',
  },
  borderLeft: {
    borderLeft: '1px solid gray',
  },
});

Saldo.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Saldo);
