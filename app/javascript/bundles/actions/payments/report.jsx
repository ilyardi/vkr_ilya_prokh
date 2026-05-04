import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _, { isEqual, map as _map, replace as _replace } from 'lodash';
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
  Checkbox,
  TableSortLabel,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs';
import NumberFormat from 'react-number-format';
import {
  FloatButton,
  DatePicker,
  Select,
  Button,
  Descriptions,
  Input,
  Checkbox as CheckboxAnt,
  Radio,
  Space
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { SaveOutlined, SaveTwoTone, DownloadOutlined } from '@ant-design/icons';

import Preloader from 'components/preloader';
import Pagination from 'components/pagination';
import Rest from 'tools/rest';
import { Can } from 'tools/ability';

import ReportPaymentRow from './components/report_payment_row';

class PaymentsReport extends Component {
  state = {
    loading: false,
    total_amount: null,
    payments: [],
    lb_classes: [],
    meta: {
      page: 1,
      per: 50,
      order: 'desc',
      order_by: 'pay_date',
    },
    filter: {
      pay_date: [],
      local_date: [],
      buh_date: [],
      lb_classes: [],
      agrm_number: null,
      status: null,
      empty_buh_date: null,
      type: '',
      service_type: null,
      empty_service_type: null,
      // date: null,
    },
    selectedPayments: [],
    cols: [
      { id: 'agrm_number', label: 'Лицевой счет' },
      { id: 'address', label: 'Адрес' },
      { id: 'amount', label: 'Сумма платежа' },
      { id: 'teleset_service_type', label: 'Тип договора' },
      { id: 'pay_date', label: 'Дата приема платежа' },
      { id: 'local_date', label: 'Дата добавления в биллинг' },
      { id: 'buh_date', label: 'Период бух.учета' },
      { id: 'status', label: 'Статус' },
      { id: 'class_name', label: 'Категория платежа' },
    ],
    batch_update: {
      buh_date: null,
      teleset_service_type: null,
    },
  };

  statuses = {
    0: 'Проведен',
    1: 'Подтвержден сверкой',
    2: 'Аннулирован',
  };

  service_type = {
    internet: 'Интернет',
    tv: 'ТВ',
    video: 'ВН',
  };

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Все платежи', '')
  }

  componentDidMount() {
    document.title += ' | Все платежи'
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

    if (this.loadRequest) this.loadRequest.cancel();

    this.loadRequest = Rest.get('/api/v1/lb_payments.json', { params: params }).then((response) => {
      let { lb_payments, lb_classes, total_amount, meta } = response.data;
      // lb_classes.push({ id: null, name: 'Сбросить' });

      this.setState({
        selectedPayments: [],
        payments: lb_payments,
        lb_classes,
        meta,
        total_amount,
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

  handleDateFilter = (name) => (value) => {
    const dates = value ? value.format('DD.MM.YYYY') : null;

    this.setState({
      filter: { ...this.state.filter, [name]: dates },
    });
  };

  handleDateArrayFilter = (name) => (value) => {
    const dates = value?.map((d) => {
      return d ? d.format('DD.MM.YYYY') : null;
    });

    this.setState({
      filter: { ...this.state.filter, [name]: dates || [] },
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

  handleUpdate = (payment) => {
    const { payments } = this.state;

    const updatedPayments = payments.map((p) => {
      return p.record_id === payment.record_id ? payment : p;
    });

    this.setState({ payments: updatedPayments });
  };

  handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = this.state.payments.map((n) => n.record_id);
      this.setState({ selectedPayments: newSelecteds });
      return;
    }
    this.setState({ selectedPayments: [] });
  };

  handleSelectRow = (event, payment) => {
    if (
      event.target.tagName == 'TD' ||
      event.target.tagName == 'TR' ||
      (event.target.tagName == 'INPUT' && event.target.type == 'checkbox')
    ) {
      const id = payment.record_id;
      const selected = this.state.selectedPayments;
      const selectedIndex = this.state.selectedPayments.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }

      this.setState({ selectedPayments: newSelected });
    }
  };

  handleEmptyDataPickerFilter = (event) => {
    this.setState({
      filter: {
        ...this.state.filter,
        [event.target.name]: event.target.checked ? event.target.value : undefined,
        [event.target.name.slice(6)]: [],
      },
    });
  };

  handleEmptySelectFilter = (event) => {
    this.setState({
      filter: {
        ...this.state.filter,
        [event.target.name]: event.target.checked ? event.target.value : undefined,
        [event.target.name.slice(6)]: null,
      },
    });
  };

  handleBatchUpdateDate = () => {
    let params = {
      ids: this.state.selectedPayments,
      lb_payment: {
        buh_date: this.state.batch_update.buh_date || '',
      },
    };

    if (params.ids.length < 1) return;
    Rest.put(`/api/v1/lb_payments/batch_update.json`, params).then((_) => {
      this.loadData();
    });
  };

  handleBatchUpdateServiceType = () => {
    let params = {
      ids: this.state.selectedPayments,
      lb_payment: {
        teleset_service_type: this.state.batch_update.teleset_service_type || '',
      },
    };

    if (params.ids.length < 1) return;
    Rest.put(`/api/v1/lb_payments/batch_update.json`, params).then((_) => {
      this.loadData();
    });
  };

  handlePaymentsReport = () => {
    window.open(`/api/v1/reports/payments_by_month.csv?date=${this.state.filter.buh_date[0]}`)
  }

  // handleDateFilter = (value) => {
  //   this.setState({
  //     filter: {
  //       ...this.state.filter,
  //       date: value.format('DD.MM.YYYY')
  //     },
  //   });
  // };

  totalRow() {
    const {
      batch_update,
      total_amount,
      meta: { total },
    } = this.state;

    return (
      <React.Fragment>
        <TableCell>Итого:</TableCell>
        <TableCell>{total}</TableCell>
        <TableCell colSpan={2} align="right">
          <NumberFormat
            value={total_amount}
            thousandSeparator={' '}
            decimalScale={2}
            displayType={'text'}
            prefix={''}
          />
        </TableCell>
        <TableCell colSpan={3}>
          <Can I="batch_update" a="LbPayment">
            <Select
              name={'teleset_service_type'}
              style={{ width: 150 }}
              value={this.state.batch_update.teleset_service_type}
              placeholder="тип договора"
              onChange={(value) => {
                this.setState({
                  batch_update: {
                    ...this.state.batch_update,
                    teleset_service_type: value ? value : null,
                  },
                });
              }}
              allowClear
            >
              {_map(this.service_type, (value, key) => {
                return <Select.Option key={key}>{value}</Select.Option>;
              })}
            </Select>
            <Button icon={<SaveTwoTone />} onClick={this.handleBatchUpdateServiceType} />
          </Can>
        </TableCell>
        <TableCell colSpan={3}>
          <Can I="batch_update" a="LbPayment">
            <DatePicker
              format={'DD.MM.YYYY'}
              value={batch_update.buh_date ? dayjs(batch_update.buh_date, 'DD.MM.YYYY') : null}
              onChange={(value) => {
                this.setState({
                  batch_update: {
                    ...this.state.batch_update,
                    buh_date: value ? value.format('DD.MM.YYYY') : null,
                  },
                });
              }}
            />
            <Button icon={<SaveTwoTone />} onClick={this.handleBatchUpdateDate} />
          </Can>
        </TableCell>
      </React.Fragment>
    );
  }

  render() {
    const { classes } = this.props;
    const {
      loading,
      payments,
      lb_classes,
      filter,
      cols,
      meta: { page, per, total, order, order_by },
    } = this.state;
    const {
      empty_service_type,
      empty_buh_date,
    } = this.state.filter

    console.log(this.state.filter)
    const rowCount = payments.length;
    const rowSelectedCount = this.state.selectedPayments.length;
    const isSelected = (id) => this.state.selectedPayments.indexOf(id) !== -1;
    return (
      <Fragment>
        <FloatButton.BackTop />

        <PageHeader
          title="Все платежи"
          extra={
            [
              // <Button key="payments">
              //   <Link to={'/payments'}>Загруженные платежи</Link>
              // </Button>,
            ]
          }
        >
          <Descriptions bordered border size={'small'}>
            <Descriptions.Item label="Лицевой счет">
              <Input
                value={filter.agrm_number}
                placeholder="Лицевой счет"
                onChange={this.handleFilter('agrm_number')}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Дата платежа">
              <DatePicker.RangePicker
                format={'DD.MM.YYYY'}
                value={filter.pay_date.map((d) => {
                  return d ? dayjs(d, 'DD.MM.YYYY') : null;
                })}
                onChange={this.handleDateArrayFilter('pay_date')}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Дата добавления платежа">
              <DatePicker.RangePicker
                format={'DD.MM.YYYY'}
                value={filter.local_date.map((d) => {
                  return d ? dayjs(d, 'DD.MM.YYYY') : null;
                })}
                onChange={this.handleDateArrayFilter('local_date')}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Период бух. учета">
              <DatePicker.RangePicker
                format={'DD.MM.YYYY'}
                value={filter.buh_date.map((d) => {
                  return d ? dayjs(d, 'DD.MM.YYYY') : null;
                })}
                onChange={this.handleDateArrayFilter('buh_date')}
                disabled={empty_buh_date ? true : false}
              />
              <CheckboxAnt
                name='empty_buh_date'
                checked={filter.empty_buh_date}
                value={true}
                onChange={this.handleEmptyDataPickerFilter}
              >
                Пустые
              </CheckboxAnt>
              <Button icon={<DownloadOutlined/>} onClick={this.handlePaymentsReport}/>
            </Descriptions.Item>
            <Descriptions.Item label="Контрагент">
              <Select
                mode="multiple"
                defaultValue={filter.lb_classes}
                style={{ width: 200 }}
                onChange={this.handleSelectFilter('lb_classes')}
              >
                {lb_classes.map((lb_class) => (
                  <Select.Option key={lb_class.id} value={lb_class.id}>
                    {lb_class.name}
                  </Select.Option>
                ))}
              </Select>
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Select
                defaultValue={filter.status}
                style={{ width: 200 }}
                onChange={this.handleSelectFilter('status')}
              >
                {Object.keys(this.statuses).map((v) => (
                  <Select.Option key={v} value={v}>
                    {this.statuses[v]}
                  </Select.Option>
                ))}
              </Select>
            </Descriptions.Item>
            <Descriptions.Item label="Вид лиц">
              <Radio.Group
                name="filter_type"
                onChange={this.handleFilter('type')}
                value={filter.type}
              >
                <Radio value={''}>Все</Radio>
                <br />
                <Radio value={2}>Физ.лица</Radio>
                <Radio value={1}>Юр.лица</Radio>
              </Radio.Group>
            </Descriptions.Item>
            <Descriptions.Item label="Тип услуг">
              <Select
                name={'service_type'}
                style={{ width: 150 }}
                value={this.state.filter.service_type}
                placeholder="тип договора"
                onChange={(value) => {
                  this.setState({
                    filter: {
                      ...this.state.filter,
                      service_type: value ? value : null,
                    },
                  });
                }}
                allowClear
                disabled={empty_service_type ? true : false}
              >
                {_map(this.service_type, (value, key) => {
                  return <Select.Option key={key}>{value}</Select.Option>;
                })}
              </Select><br />
              <CheckboxAnt
                name='empty_service_type'
                checked={filter.empty_service_type}
                value={true}
                onChange={this.handleEmptySelectFilter}
              >
                Пустые
              </CheckboxAnt>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Отчет по платежам">
              <DatePicker
                format={'DD.MM.YYYY'}
                placeholder="Месяц"
                value={filter.date ? dayjs(filter.date, 'DD.MM.YYYY') : null}
                onChange={this.handleDateFilter}
              />
            </Descriptions.Item> */}
          </Descriptions>
        </PageHeader>

        <Preloader loading={loading}>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={rowSelectedCount > 0 && rowSelectedCount < rowCount}
                      checked={rowSelectedCount === rowCount}
                      onChange={this.handleSelectAllClick}
                      inputProps={{ 'aria-label': 'Выбрать все' }}
                    />
                  </TableCell>
                  {cols.map((row) => {
                    return (
                      <TableCell key={row.id}>
                        <Tooltip title="Sort" placement={'bottom-start'} enterDelay={300}>
                          <TableSortLabel
                            active={order_by === row.id}
                            direction={order}
                            onClick={(event) => this.handleRequestSort(event, row.id)}
                          >
                            {row.label}
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                  <TableCell />
                </TableRow>
                <TableRow>{this.totalRow()}</TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => {
                  return (
                    <ReportPaymentRow
                      key={p.record_id}
                      cols={cols}
                      payment={p}
                      classes={classes}
                      onSelect={this.handleSelectRow}
                      onUpdate={this.handleUpdate}
                      selected={isSelected(p.record_id)}
                      service_type={this.service_type}
                    />
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  {total && (
                    <TablePagination
                      colSpan={10}
                      count={total}
                      rowsPerPage={per}
                      page={page - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      ActionsComponent={Pagination}
                      rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]}
                    />
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
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  menu: {
    width: 200,
  },
  statusDate: {
    fontSize: '10px',
  },
  periodDateButton: {
    paddingRight: theme.spacing(4),
  },
});

PaymentsReport.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PaymentsReport);
