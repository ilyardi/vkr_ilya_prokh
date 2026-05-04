import React from 'react';
import Rest from 'tools/rest';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Tooltip, Form, Input, DatePicker, Modal, Button, Checkbox, Select, Typography } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { red, volcano, green, yellow } from '@ant-design/colors';
import { ThunderboltFilled } from '@ant-design/icons';
import { withStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs';
import { debounce, find as _find, isEqual as _isEqual, replace as _replace } from 'lodash';
import Preloader from 'components/preloader';
import QueryMixin from 'components/query_mixin';

const { Text } = Typography;

class LkPayments extends QueryMixin {
  state = {
    payments: [],
    meta: {
      page: this.getQuery('page'),
      per: this.getQuery('per'),
      total: 0,
    },
    search: {
      payment_id: this.getQuery('payment_id'),
      order_id: this.getQuery('order_id'),
      agrm_number: this.getQuery('agrm_number'),
      created_at: this.getQuery('created_at'),
      source: this.getQuery('source'),
    },
    useDebounce: false,
    loading: false,
    receiptShow: false,
    receiptData: {},
  };

  source_types = [
    { label: 'mobile', value: 'mobile'},
    { label: 'site', value: 'site' },
  ]

  loadPayments() {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      search: this.state.search,
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true });

    this.loadRequest = Rest.get('/api/v1/lk_payments.json', { params: params }).then((response) => {
      const { payments, meta } = response.data;
      this.setState({
        payments,
        meta,
        loading: false,
      });

      this.setQuery({
        ...this.state.search,
        page: meta.page,
        per: meta.per,
      });
    });
  }

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
    document.title = _replace(document.title, ' | Платежи ЛК', '');
  }

  componentDidMount() {
    document.title += ' | Платежи ЛК';
    this.loadPayments();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per)
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadPayments();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: pagination.current,
        per: pagination.pageSize,
      },
    });
  };

  handleCancelReceipt = () => {
    this.setState({ receiptShow: false });
  };

  handleShowReceipt = (text, record) => {
    if (!text) return;
    this.setState({
      receiptData: {
        text: text,
        record: record,
      },
      receiptShow: true,
    });
  };

  handleChangeText = () => {
    return (e) => {
      let v = e.target.value;
      if (v === null || v === '') {
        v = undefined;
      }
      this.setState({
        useDebounce: true,
        meta: { ...this.state.meta, page: 1 },
        search: { ...this.state.search, [e.target.name]: v },
      });
    };
  };

  handleChangeStatus = (e) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, status: e.target.checked ? 'paid' : undefined },
    });
  };

  handleChangeSource = (value) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {...this.state.search, source: value },
    });
  }

  handleDateFilter = (name) => (value) => {
    let dates = [];
    if (Array.isArray(value)) {
      dates = value.map((d) => {
        return d ? d.format('DD.MM.YYYY') : null;
      });
    } else {
      dates = value ? value.format('DD.MM.YYYY') : null;
    }
    this.setState({
      search: { ...this.state.search, [name]: dates },
    });
  };

  render() {
    const { payments, receiptData, receiptShow, search, meta } = this.state;
    const { classes, current_user } = this.props;
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      showSizeChanger: true,
      position: ['bottomCenter'],
    };

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
      },
      {
        title: 'OrderID',
        dataIndex: 'order_id',
      },
      {
        title: 'Лицевой счет',
        dataIndex: 'agrm_number',
        render: (value, record) => {
          return (
            <Link to={{ pathname: '/agreements', search: `?number=${value}` }}>
              {value}{' '}
              {record.has_bonus && (
                <Tooltip title="Начислен бонус">
                  <ThunderboltFilled style={{ color: 'green', fontSize: '20px' }} />
                </Tooltip>
              )}
            </Link>
          );
        },
      },
      {
        title: 'Имя',
        dataIndex: 'customer_name',
      },
      {
        title: 'Email',
        dataIndex: 'customer_email',
      },
      {
        title: 'Телефон',
        dataIndex: 'customer_phone',
      },
      {
        title: 'Адрес',
        dataIndex: 'customer_address',
      },
      {
        title: 'Сумма',
        dataIndex: 'amount',
      },
      {
        title: 'Дата оплаты',
        dataIndex: 'paid_date',
      },
      {
        title: 'Дата создания/изменения',
        width: '10%',
        render: (_, record) => {
          // const created_at = format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm:ss');
          // const updated_at = format(_parseISO(record.updated_at), 'dd.MM.yyyy HH:mm:ss');
          return (
            <span>
              {dayjs(record.created_at).format('DD.MM.YYYY HH:mm:ss')}
              <br />
              {dayjs(record.updated_at).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          );
        },
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        render: (_, record) => {
          return (
            <React.Fragment>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  this.handleShowReceipt(record.response, record);
                }}
              >
                {record.status}
              </a>
              <br />
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  this.handleShowReceipt(record.ofd_response, record);
                }}
              >
                {record.ofd_status}
              </a>
              <br />
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  this.handleShowReceipt(record.lb_response, record);
                }}
              >
                {record.lb_status}
              </a>
            </React.Fragment>
          );
        },
      },
      {
        title: 'Источник',
        dataIndex: 'source',
      },
    ];

    return (
      <React.Fragment>
        <PageHeader
          title={`Платежи ЛК (${pagination.total})`}
          style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
        />
        {receiptShow && (
          <Modal
            title={`${receiptData.record.customer_name} ${receiptData.record.customer_address}`}
            centered
            visible={receiptShow}
            onOk={this.handleCancelReceipt}
            onCancel={this.handleCancelReceipt}
            footer={[
              <Button key="decline" onClick={this.handleCancelReceipt}>
                Отмена
              </Button>,
            ]}
            style={{ marginTop: '70px', maxWidth: '450px' }}
          >
            <pre>{receiptData.text}</pre>
          </Modal>
        )}
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item>
            <Input
              name="payment_id"
              value={search.payment_id}
              placeholder="ID"
              onChange={this.handleChangeText()}
            />
          </Form.Item>
          <Form.Item>
            <Input
              name="agrm_number"
              value={search.agrm_number}
              placeholder="Лицевой счет"
              onChange={this.handleChangeText()}
            />
          </Form.Item>
          <Form.Item>
            <Input
              name="order_id"
              value={search.order_id}
              placeholder="Order ID"
              onChange={this.handleChangeText()}
            />
          </Form.Item>
          <Form.Item>
            <DatePicker.RangePicker
              format={'DD.MM.YYYY'}
              value={(search.created_at || []).map((d) => {
                return d ? dayjs(d, 'DD.MM.YYYY') : null;
              })}
              onChange={this.handleDateFilter('created_at')}
            />
          </Form.Item>
          {current_user.role !== 'manager' && current_user.role !== 'main_manager' && (
            <Form.Item>
              <Checkbox onChange={this.handleChangeStatus}>Только оплаченные</Checkbox>
            </Form.Item>
          )}
          <Form.Item
            label={'Источник: '}
          >
            <Select
              style={{ width: '150px' }}
              allowClear
              showSearch
              value={search.source == '' ? undefined : search.source}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              options={this.source_types}
              onChange={this.handleChangeSource}
            />
          </Form.Item>
        </Form>
        <Preloader loading={this.state.loading}>
          <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            columns={columns}
            dataSource={payments}
            rowKey={(record) => record.id}
            pagination={pagination}
            size="small"
            onChange={this.handleTableChange}
            bordered={true}
            rowClassName={(record, index) => {
              return classes[record.class_name];
            }}
          />
        </Preloader>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  danger: {
    backgroundColor: red[1],
  },
  warning: {
    backgroundColor: yellow[1],
  },
  success: {
    backgroundColor: green[1],
  },
  error: {
    backgroundColor: volcano[1],
  },
});

const mapStateToProps = (state) => {
  return {
    current_user: state.user,
  };
};

export default connect(mapStateToProps, null)(withStyles(styles)(LkPayments));
