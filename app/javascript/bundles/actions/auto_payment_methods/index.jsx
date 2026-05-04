import React, { Component } from 'react';
import Rest from 'tools/rest';
import { debounce, isEqual as _isEqual, replace as _replace } from 'lodash';
import dayjs from 'dayjs';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  FloatButton,
  Select,
  Input,
  Row,
  Col,
  Form,
  Modal,
  Typography,
  Checkbox,
  Tag,
  DatePicker,
  Statistic,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { red, volcano, green, yellow } from '@ant-design/colors';
import { parseISO as _parseISO, format } from 'date-fns';
import { find as _find, map as _map, includes as _includes } from 'lodash'

import AgreementCard from 'components/agreement_card';
import QueryMixin from 'components/query_mixin';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;
const { RangePicker } = DatePicker;

class AutoPaymentMethods extends QueryMixin {
  state = {
    auto_payment_methods: [],
    meta: {
      page: this.getQuery('page') || 1,
      per: this.getQuery('per') || 50,
      total: 0,
    },
    search: {
      // created_at: [this.getQuery('created_at_from'), this.getQuery('created_at_to')],
      created_at_from: this.getQuery('created_at_from'),
      created_at_to: this.getQuery('created_at_to'),
      // withdraw_at: [this.getQuery('withdraw_at_from'), this.getQuery('withdraw_at_to')],
      withdraw_at: this.getQuery('withdraw_at'),
      status: this.getQuery('status'),
      number: this.getQuery('number'),
      lk_phone: this.getQuery('lk_phone'),
      active: this.getQuery('active'),
      agrm_number: this.getQuery('agrm_number')
    },
    agreement: null,
    total_sum: 0,
    loading: false,
    useDebounce: false,
    visibleCard: false,
    visibleAgreementCard: false,
    auto_payment_method: {},
    data_relevance: null,
  };

  statuses = [
    { label: 'Создан', value: 'created' },
    { label: 'Подтвержден', value: 'confirmed' },
    { label: 'Зарегистрирован', value: 'done' },
    { label: 'Отменен', value: 'declined' },
  ];

  loadAutoPaymentMethods = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      filter: this.state.search,
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true, useDebounce: false });

    this.loadRequest = Rest.get('/api/v1/auto_payment_methods.json', { params: params }).then(
      (response) => {
        const { auto_payment_methods, total_sum, meta } = response.data;
        this.setState({
          auto_payment_methods,
          total_sum,
          meta,
          loading: false,
        });
        this.setQuery({
          ...this.state.search,
          page: meta.page,
          per: meta.per,
        });
      },
    );
  };

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
    document.title = _replace(document.title, ' | Автоплатежи ЛК', '')
  }

  componentDidMount() {
    document.title += ' | Автоплатежи ЛК'
    this.loadAutoPaymentMethods();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per) ||
      prevState.data_relevance !== this.state.data_relevance
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadAutoPaymentMethods();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  };

  handleChangeText = (e) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, [e.target.name]: e.target.value },
    });
  };

  handleChangeStatus = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, status: value },
    })
  };

  handleTableChange = (pagination, filters, sorter) => {
    // const newsorter = {
    //   order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
    //   order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    // };
    this.setState({
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
      }
    });
  };

  render() {
    const {
      loading,
      search,
      buildings,
      entrances,
      flats,
      visibleCard,
      visibleAgreementCard,
      auto_payment_method,
      auto_payment_methods,
      meta,
      total_sum,
      agreement,
    } = this.state;
    const { classes } = this.props
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      position: ['bottomCenter'],
      defaultCurrent: '1',
      showSizeChanger: true,
    };

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'Абонент',
        dataIndex: 'abonent',
        key: 'abonent',
        render: (value) => {
          return (<Text>{value?.phone} (ID: {value?.id})</Text>)
        }
      },
      {
        title: 'Договор',
        dataIndex: 'lb_agreement',
        key: 'lb_agreement',
        render: (value) => {
          return (<a onClick={()=>{
            this.setState({
              agreement: value,
              visibleAgreementCard: true,
            })
          }}>{value?.number} (ID: {value?.agrm_id})</a>)
        }
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        render: (value) => (_find(this.statuses, { value: value })?.label)
      },
      {
        title: 'Состояние',
        dataIndex: 'active',
        key: 'active',
        render: (value) => (value ?
          <Tag color="success" >Активен</Tag >
          :
          <Tag color="error" >Не активен</Tag >)
      },
      {
        title: 'Сумма',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Дата платежа',
        dataIndex: 'date',
        key: 'date',
        render: (value) => (value ? dayjs(value).format('DD.MM.YYYY') : null),
      },
      {
        title: 'Создан',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value) => (value ? dayjs(value).format('DD.MM.YYYY') : null),
      },
      {
        title: 'Изменен',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (value) => (value ? dayjs(value).format('DD.MM.YYYY') : null),
      },
    ];

    return (
      <React.Fragment>
        <FloatButton.BackTop />
        <PageHeader title="Автоплатежи ЛК"></PageHeader>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Телефон ЛК:"
              >
                <Input
                  controls={false}
                  name="lk_phone"
                  value={search.lk_phone}
                  placeholder="Телефон"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              <Form.Item
                label='№ договора:'
              >
                <Input
                  name="agrm_number"
                  value={search.agrm_number}
                  placeholder="Номер договора"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label='Статус:'
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <Select
                  allowClear
                  value={search.status || null}
                  options={this.statuses}
                  placeholder="Статус"
                  onChange={this.handleChangeStatus}
                />
              </Form.Item>
              <Form.Item
                label='№ автоплатежа:'
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <Input
                  name="number"
                  value={search.number}
                  placeholder="№ автоплатежа"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={'Создан:'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  value={search.created_at_from && search.created_at_to ?
                    [dayjs(search.created_at_from, 'DD.MM.YYYY'), dayjs(search.created_at_to, 'DD.MM.YYYY')]
                    :
                    null
                  }
                  placeholder={['Создана с', 'по']}
                  format={'DD.MM.YYYY'}
                  onChange={(dates, dateStrings) => {
                    this.setState({
                      search: {
                        ...search,
                        created_at_from: dateStrings[0],
                        created_at_to: dateStrings[1],
                      }
                    })
                  }}
                />
              </Form.Item>
              <Form.Item
                label={'Списание:'}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <DatePicker
                  picker='month'
                  value={search.withdraw_at ? dayjs(search.withdraw_at, 'YYYY-MM-DD') : null }
                  placeholder = 'выберите месяц'
                  format="MMMM YYYY"
                  onChange={(date, dateString) => {
                    this.setState({
                      search: {
                        ...search,
                        withdraw_at: date ? date.format('YYYY-MM-DD') : null
                      }
                    })
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={3}>
              <Form.Item
                label='Только активные:'
                labelCol={{ span: 17 }}
                wrapperCol={{ span: 1 }}
              >
                <Checkbox
                  checked={search.active == true ? true : false}
                  onChange={(e) => {
                    this.setState({
                      search: {
                        ...search,
                        active: e.target.checked ? true : undefined
                      }
                    })
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Statistic title="Кол-во платежей: " value={meta?.total} />
            </Col>
            <Col span={3}>
              <Statistic title="Сумма платежей: " value={total_sum} />
            </Col>
          </Row>
        </Form>
        {visibleCard &&
          <Modal
            title={`Автоплатеж № ${auto_payment_method?.id}`}
            visible={visibleCard}
            onCancel={() => { this.setState({ visibleCard: false, data_relevance: new Date() }) }}
            onOk={() => { this.setState({ visibleCard: false, data_relevance: new Date() }) }}
            footer={false}
            width={'80%'}
          >
          </Modal>}
        {visibleAgreementCard &&
          <Modal
            title={`Карточка договора № ${agreement?.number}`}
            visible={visibleAgreementCard}
            onCancel={() => { this.setState({ visibleAgreementCard: false }) }}
            onOk={() => { this.setState({ visibleAgreementCard: false }) }}
            footer={false}
            width={'95%'}
          >
            <AgreementCard agrm_id={this.state.agreement?.agrm_id} />
          </Modal>
        }
        <Table
          rowKey={(record) => record.id}
          loading={loading}
          columns={columns}
          dataSource={auto_payment_methods}
          hideOnSinglePage={true}
          onChange={this.handleTableChange}
          pagination={pagination}
          // onRow={(record, rowIndex) => {
          //   return {
          //     onClick: event => { this.setState({ visibleCard: true, auto_payment_method: record }) },
          //   };
          // }}
        />
      </React.Fragment >
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

export default withStyles(styles)(AutoPaymentMethods);
