import React from 'react';
import Rest from 'tools/rest';
import {
  PageHeader,
  Popconfirm,
  Table,
  Row,
  Col,
  Form,
  Select,
  Button,
  DatePicker,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  SaveTwoTone,
  DeleteOutlined
} from '@ant-design/icons';
import {
  debounce,
  map as _map,
  find as _find,
  forEach as _forEach,
  isEqual,
  filter as _filter,
} from 'lodash';
import dayjs from 'dayjs';
import Preloader from 'components/preloader';
import { AbilityContext, Can } from 'tools/ability';

const { Text } = Typography;

class Payments extends React.Component {
  state = {
    payments: [],
    filter: this.props.filter,
    meta: {
      page: 1,
      per: 10,
      total: 0,
      order: 'desc',
      order_by: 'pay_date',
    },
    lb_classes: [],
    useDebounce: false,
    loading: false,
    total_amount: null,
  };

  full_func = false

  service_type = {
    internet: 'Интернет',
    tv: 'ТВ',
    video: 'ВН',
  };

  statuses = {
    0: 'Проведен',
    1: 'Подтвержден сверкой',
    2: 'Аннулирован',
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
    Rest.get('/api/v1/lb_payments.json', { params: params }).then((response) => {
      let { lb_payments, lb_classes, total_amount, meta } = response.data;
      lb_classes.push({ id: null, name: 'Сбросить' });

      this.setState({
        payments: lb_payments,
        lb_classes,
        meta,
        total_amount,
      });
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });;
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
        total: pagination.total,
        order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
        order_by: sorter.column == undefined ? 'pay_date' : sorter.field,
      }
    });
  };

  totalRow = () => {
    const { meta: { total }, total_amount } = this.state
    return (
      <Row>
        <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'inherit', fontWeight: '500', fontSize: '12pt' }}>Итого платежей: {total}</Text>
        </Col>
        <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'inherit', fontWeight: '500', fontSize: '12pt' }}>Сумма: {total_amount}</Text>
        </Col>
        <Col span={7} >
          <Can I="batch_update" a="LbPayment">
            <Text style={{ fontFamily: 'inherit', fontWeight: '500', fontSize: '12pt' }}>
              Тип услуги:
            </Text>
            <Select
              name={'teleset_service_type'}
              style={{ width: 150, marginLeft: 10 }}
              // value={this.state.batch_update.teleset_service_type}
              placeholder="тип договора"
              // onChange={(value) => {
              //   this.setState({
              //     batch_update: {
              //       ...this.state.batch_update,
              //       teleset_service_type: value ? value : null,
              //     },
              //   });
              // }}
              allowClear
            >
              {_map(this.service_type, (value, key) => {
                return <Select.Option key={key}>{value}</Select.Option>;
              })}
            </Select>
            <Button icon={<SaveTwoTone />} onClick={this.handleBatchUpdateServiceType} />
          </Can>
        </Col>
        <Col span={6} >
          <Can I="batch_update" a="LbPayment">
            <Text style={{ fontFamily: 'inherit', fontWeight: '500', fontSize: '12pt' }}>
              Период бух.учета:
            </Text>
            <DatePicker
              style={{ marginLeft: 10 }}
              format={'DD.MM.YYYY'}
            // value={batch_update.buh_date ? dayjs(batch_update.buh_date, 'DD.MM.YYYY') : null}
            // onChange={(value) => {
            //   this.setState({
            //     batch_update: {
            //       ...this.state.batch_update,
            //       buh_date: value ? value.format('DD.MM.YYYY') : null,
            //     },
            //   });
            // }}
            />
            <Button icon={<SaveTwoTone />} onClick={this.handleBatchUpdateDate} />
          </Can>
        </Col>
      </Row>
    )
  };

  canDelete(p) {
    return (
      p.class_name == 'Доверительный платеж' &&
      p.status != 2 &&
      this.context.can('destroy', 'LbPayment')
    );
  };

  handleDelete = (record) => {
    Rest.delete(`/api/v1/lb_payments/${record.record_id}.json`)
      .then((response) => {
        this.loadData()
      })
      .catch((e) => {
        console.error('error', e);
      })
  };

  render() {
    // Так себе решение
    // const fix_item = {
    //   id: 0,
    //   address:
    //     <Can I="batch_update" a="LbPayment">
    //       <Select
    //         name={'teleset_service_type'}
    //         style={{ width: 150 }}
    //         placeholder="тип договора"
    //         allowClear
    //       >
    //       </Select>
    //       <Button icon={<SaveTwoTone />} onClick={this.handleBatchUpdateServiceType} />
    //     </Can>,
    // }
    // const payments = [fix_item, ...this.state.payments]

    // console.log(this.state.meta)
    const { payments, meta } = this.state
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      showSizeChanger: true,
    };
    let columns = [
      {
        title: 'Лицевой счет',
        dataIndex: 'agrm_number',
        width: '8%',
        sorter: true,
      },
      {
        title: 'Адрес',
        dataIndex: 'address',
        sorter: true,
      },
      {
        title: 'Сумма платежа',
        dataIndex: 'amount',
        width: this.full_func ? '8%' : '15%',
        sorter: true,
      },
      {
        title: 'Тип услуги',
        dataIndex: 'teleset_service_type',
        width: '8%',
        sorter: true,
      },
      {
        title: 'Дата приема',
        dataIndex: 'pay_date',
        width: this.full_func ? '12%' : '25%',
        sorter: true,
      },
      {
        title: 'Дата добавления в биллинг',
        dataIndex: 'local_date',
        width: this.full_func ? '12%' : '25%',
        sorter: true,
      },
      {
        title: 'Период бух.учета',
        dataIndex: 'buh_date',
        width: '12%',
        sorter: true,
        render: (_, record) => (
          <Can I="update" a="LbPayment" passThrough>
            {(allowed) =>
              allowed ? (
                <DatePicker
                  format={'DD.MM.YYYY'}
                  value={record.buh_date == 0 ? null : dayjs.unix(record.buh_date)}
                // onChange={this.handleUpdate}
                />
              ) : (
                <span>
                  {record.buh_date == 0 ? null : dayjs.unix(record.buh_date).format('DD.MM.YYYY')}
                </span>
              )
            }
          </Can>
        )
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        width: this.full_func ? '6%' : '10%',
        sorter: true,
        render: (_, record) => (
          <React.Fragment>
            <div>{this.statuses[record.status]}</div>
            {record.cancel_date && <div style={{ fontSize: '10px' }}>{record.cancel_date}</div>}
          </React.Fragment>
        )
      },
      {
        title: 'Категория платежа',
        dataIndex: 'class_name',
        width: this.full_func && '12%',
        sorter: true,
      },
      {
        title: '',
        dataIndex: 'action',
        width: '25px',
        render: (_, record) => (
          <Can I="destroy" a="LbPayment">
            <Popconfirm
              placement="left"
              title="Вы уверены, что хотите удалить Платеж?"
              onConfirm={(e) => {
                this.handleDelete(record);
              }}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                disabled={!this.canDelete(record)}
                title="Удалить платеж"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Can>
        )
      },
    ]

    if (!this.full_func) {
      columns = _filter(columns, (object) => {
        const { dataIndex } = object
        if (
          dataIndex == 'teleset_service_type' ||
          dataIndex == 'buh_date' ||
          dataIndex == 'agrm_number' ||
          dataIndex == 'address'
        ) return
        return object
      })
    };

    return (
      <Preloader loading={this.state.loading}>
        <Table
          rowSelection={this.full_func && {
            type: 'checkbox',
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
          }}
          title={this.full_func && this.totalRow}
          dataSource={payments}
          columns={columns}
          rowKey={(record) => record.record_id}
          size="small"
          bordered={true}
          onChange={this.handleTableChange}
          pagination={pagination}
        />
      </Preloader>
    )
  }
}

Payments.contextType = AbilityContext;

export default Payments
