import React, { Component } from 'react';
import Rest from 'tools/rest';
import { debounce, isEqual as _isEqual, replace as _replace, map as _map } from 'lodash';
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
  Statistic,
  Tag,
  Modal,
  Button,
  Radio,
  Typography,
  DatePicker,
  List,
  Switch,
  Checkbox,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import AgreementCard from 'components/agreement_card';

import QueryMixin from 'components/query_mixin';
import Preloader from 'components/preloader';
import RequestCard from 'components/request_card';
import ConnectionsManager from 'components/connections_manager';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;
const { Option } = Select;

class Debtors extends QueryMixin {
  state = {
    debtors: [],
    meta: {
      page: this.getQuery('page'),
      per: this.getQuery('per'),
      total: 0,
    },
    search: {
      street: this.getQuery('street'),
      building: this.getQuery('building'),
      flat: this.getQuery('flat'),
      number: this.getQuery('number'),
      phone: this.getQuery('phone'),
      month: this.getQuery('month') || dayjs().format('YYYY-MM-DD'),
      agrm_type: this.getQuery('agrm_type') || 'tv',
      from_coefficient: this.getQuery('from_coefficient') || 0,
      to_coefficient: this.getQuery('to_coefficient') || 100,
      strict_mode: this.getQuery('strict_mode'),
      in_process: this.getQuery('in_process') || true,
      status: this.getQuery('status'),
      acc_type: this.getQuery('acc_type'),
    },
    total_data: {},
    streetOptions: [],
    buildingOptions: [],
    flatOptions: [],
    request: null,
    report_type: 'tv',
    loading: false,
    useDebounce: false,
    agrm_id: null,
    visible_agreement_card: false,
    visible_request_card: false,
    data_relevance: null,
    predata_request: null,
    debtor: {},
  };

  loadData = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      filter: this.state.search,
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true, useDebounce: false });

    this.loadRequest = Rest.get('/api/v1/debtors.json', { params: params }).then(
      (response) => {
        const { debtors, predata_request, meta, total_data } = response.data;
        this.setState({
          total_data,
          predata_request,
          debtors,
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
    document.title = _replace(document.title, ' | Задолжники', '')
  };

  componentDidMount() {
    document.title += ' | Задолжники'
    this.loadData();
    this.loadStreetOptions();
  };

  componentDidUpdate(prevProps, prevState) {
    const { street, building } = this.state.search;
    if (
      !_isEqual(prevState.search, this.state.search) ||
      prevState.data_relevance !== this.state.data_relevance ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per)
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadData();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }

    if (street && street !== prevState.search.street) {
      this.setState({
        search: {
          ...this.state.search,
          building: '',
        },
      });
      this.loadBuildingOptions();
    }

    if (building && building !== prevState.search.building) {
      this.setState({
        search: {
          ...this.state.search,
          flat: '',
        },
      });
      this.loadFlatOptions();
    }

    if (!street && street !== prevState.search.street) {
      this.setState({
        search: {
          ...this.state.search,
          building: '',
        },
      });
    }

    if (!building && building !== prevState.search.building) {
      this.setState({
        search: {
          ...this.state.search,
          flat: '',
        },
      });
    }
  };

  loadStreetOptions = () => {
    const { street } = this.state.search;

    Rest.get(`/api/v1/addresses.json?query=${street}`).then((res) => {
      const { suggestions } = res.data;

      this.setState({
        streetOptions: suggestions,
      });
    });
  };

  loadBuildingOptions = () => {
    const { street } = this.state.search;

    Rest.get(`/api/v1/addresses/houses.json?street=${street}`).then((res) => {
      const { suggestions } = res.data;
      const options = suggestions.map((s) => {
        return { id: s.id, value: s.value, label: s.value };
      });
      this.setState({
        buildingOptions: options,
      });
    });
  };

  loadFlatOptions = () => {
    const { building } = this.state.search;

    Rest.get(`/api/v1/addresses/flats.json?building_id=${building}`).then((res) => {
      const options = res.data.map((f) => {
        return { id: f.flat_id, value: f.name, label: f.name };
      });
      this.setState({
        flatOptions: options,
      });
    });
  };

  handleChangeText = (e) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, [e.target.name]: e.target.value },
    });
  };

  handleChangeMonth = (date, dateString) => {
    this.setState({
      search: {
        ...this.state.search,
        month: date.format("YYYY-MM-DD"),
      }
    })
  };

  handleChangeFromCoefficient = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        from_coefficient: value,
      },
      meta: { ...this.state.meta, page: 1 },
    })
  };

  handleChangeToCoefficient = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        to_coefficient: value,
      },
      meta: { ...this.state.meta, page: 1 },
    })
  };

  handleChangeStatus = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        status: value,
      },
      meta: { ...this.state.meta, page: 1 },
    })
  };

  handleChangeAccType = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        acc_type: value,
      },
      meta: { ...this.state.meta, page: 1 },
    })
  };

  handleChooseSearchStreet = (v) => {
    this.setState({
      search: {
        ...this.state.search,
        street: v,
      },
      meta: { ...this.state.meta, page: 1 },
    });
  };

  handleChooseSearchBuilding = (v) => {
    this.setState({
      search: {
        ...this.state.search,
        building: v,
      },
      meta: { ...this.state.meta, page: 1 },
    });
  };

  handleChooseSearchFlat = (v) => {
    this.setState({
      search: {
        ...this.state.search,
        flat: v,
      },
      meta: { ...this.state.meta, page: 1 },
    });
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

  handleCreateRequest = (debtor) => {
    const { predata_request } = this.state
    const params = {
      request: {
        request_type_id: predata_request['request_type_id'],
        request_subtype_id: predata_request['request_subtype_id'],
        request_status_id: predata_request['request_status_id'],
        request_first_reason_id: predata_request['request_first_reason_id'],
        resource_id: debtor.agrm_id,
        resource_type: 'LbAgreement',
      },
    }
    this.setState({ loading: true });
    Rest.post(`/api/v1/requests.json`, params).then(
      (response) => {
        const { request } = response.data
        if (request && request.id) {
          this.updateDebtors({ request_id: request.id }, debtor.id)
        }
        toast.success('Задача создана успешно');
      }).catch((e) => {
        console.log(e.response.data.request.errors)
        toast.error('Ошибка создания задачи');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleChangeStrictMode = (e) => {
    this.setState({
      search: {
        ...this.state.search,
        strict_mode: e.target.checked ? true : undefined,
      }
    })
  };

  handleChangeInProcess = (e) => {
    this.setState({
      search: {
        ...this.state.search,
        in_process: e.target.checked ? true : undefined,
      }
    })
  };

  updateDebtors = (debtor_params, debtor_id) => {
    const params = {
      debtor: debtor_params
    }
    this.setState({ loading: true });
    Rest.put(`/api/v1/debtors/${debtor_id}.json`, params).then(
      (response) => {
        const { debtor } = response.data
        this.setState({
          data_relevance: new Date(),
        })
        toast.success('Изменения сохранены');
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  closerModalRequest = () => {
    this.setState({
      data_relevance: new Date(),
      visible_request_card: false,
    });
  };

  openModalRequest = (debtor) => {
    this.setState({ visible_request_card: true, debtor: debtor })
  };

  stringSpliter = (value) => {
    if (!value) { return }
    const array = value.split(',')
    return (
      <List
        size='small'
        dataSource={array}
        renderItem={(item) => (
          <List.Item>
            <Text>{item}</Text>
          </List.Item>
        )}
      />
    )
  };

  render() {
    const {
      loading,
      search,
      report_type,
      streetOptions,
      buildingOptions,
      flatOptions,
      predata_request,
      visible_agreement_card,
      visible_request_card,
      request,
      debtor,
      total_data,
      meta,
    } = this.state;
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      position: ['bottomCenter'],
      defaultCurrent: '1',
      showSizeChanger: true,
    };

    let columns = [
      {
        title: '№ договора',
        dataIndex: 'number',
        key: 'number',
        render: (value, record) => {
          return (
            <div>
              <a onClick={(event) => {
                this.setState({ visible_agreement_card: true, agrm_id: record.agrm_id })
              }}>
                {value}
              </a>
              <InfoCircleOutlined
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  GotoAccountButton.gotoAccount(record.uid, '_blank');
                }}
              />
            </div>
          )
        }
      },
      {
        title: 'Телефоны',
        dataIndex: 'phone',
        key: 'phone',
        render: (_, record) => {
          return (
            <React.Fragment>
              <Text>{record.phone}</Text><br />
              <Text>{record.mobile}</Text><br />
              <Text>{record.fax}</Text>
            </React.Fragment>
          )
        }
      },
      { title: 'Адрес', dataIndex: 'address', key: 'address' },
      {
        title: 'Баланс',
        children: [
          {
            title: 'на 1 число',
            dataIndex: 'balance',
            key: 'balance'
          },
          {
            title: 'текущ.',
            dataIndex: 'current_balance',
            key: 'current_balance'
          }
        ]
      },
      {
        title: 'Нач.',
        dataIndex: 'fee',
        key: 'fee',
      },
      {
        title: 'Кол-во',
        dataIndex: 'fee',
        key: 'fee_count',
        render: (_, record) => {
          return (Math.abs(Math.round(record.current_balance / record.fee)))
        }
      },
      {
        title: 'Тариф',
        dataIndex: 'tariffs',
        key: 'tariffs',
        render: (value) => {
          if (!value) { return '' }
          return (
            <List
              size='small'
              dataSource={value}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          )
        }
      },
      {
        title: 'Статус должника',
        dataIndex: 'status',
        key: 'status',
        render: (value, record) => {
          switch (value) {
            case 'default':
              return <Tag icon={<ClockCircleOutlined />} color="default">текущий</Tag>
            case 'impossible':
              return <Tag icon={<ExclamationCircleOutlined />} color="warning">нет возможности</Tag>
            case 'disconnected':
              return <Tag icon={<CloseCircleOutlined />} color="error">отключен</Tag>
          }
        }
      },
      {
        title: 'Статус задачи',
        dataIndex: 'request_status',
        key: 'request_status',
      },
    ];

    if (search.agrm_type == "tv_int" || search.agrm_type == "int") {
      columns = [
        ...columns,
        {
          title: 'Подключения',
          dataIndex: 'connections',
          key: 'connections',
          width: '150px',
          render: (value, record) => (
            <ConnectionsManager connections={value} agrm_id={record.agrm_id} />
          ),
        },
      ]
    }

    columns.push(
      {
        title: 'Задача',
        dataIndex: 'request_id',
        key: 'request_id',
        fixed: 'right',
        render: (value, record) => {
          if (value) {
            return <Button type='link' onClick={(event) => this.openModalRequest(record)} >Открыть</Button>
          }
          if (record.status != "disconnected") {
            return <Button type='primary' onClick={(event) => this.handleCreateRequest(record)}>Создать</Button>
          }
        }
      }
    )

    return (
      <React.Fragment>
        <FloatButton.BackTop />
        <PageHeader title="Статистика по должникам"></PageHeader>
        <Row style={{ marginBottom: '20px' }}>
          <Col>
            <Radio.Group
              defaultValue='tv'
              value={search.agrm_type}
              buttonStyle="solid"
              onChange={(event) => {
                this.setState({
                  search: {
                    ...search,
                    agrm_type: event.target.value,
                  }
                })
              }}
            >
              <Radio.Button value='tv'>ТВ моно</Radio.Button>
              <Radio.Button value='tv_int'>ТВ + ИНТ</Radio.Button>
              <Radio.Button value='int'>Предоплатчики</Radio.Button>
              <Radio.Button value='svn'>СВН моно</Radio.Button>
              <Radio.Button value='ud'>УД моно</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col span={12}>
            <Form wrapperCol={24} style={{ marginBottom: 16 }}>
              <Row gutter={24} style={{ paddingRight: '40px' }}>
                <Col span={8}>
                  <Form.Item>
                    <Input
                      name="number"
                      value={search.number}
                      placeholder="Номер договора"
                      onChange={this.handleChangeText}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      value={search.street == '' ? undefined : search.street}
                      allowClear
                      showSearch
                      // style={{ width: 200 }}
                      placeholder="Улица"
                      optionFilterProp="children"
                      onChange={this.handleChooseSearchStreet}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {streetOptions.map((street) => {
                        return (
                          <Select.Option key={street.id} value={street.value}>
                            {street.value}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="От: "
                  >
                    <Select
                      placeholder="Коэффициент"
                      onChange={this.handleChangeFromCoefficient}
                      defaultValue={search.from_coefficient}
                      options={[
                        { value: 0, label: '1р.' },
                        { value: 1, label: '1АП' },
                        { value: 2, label: '2АП' },
                        { value: 3, label: '3АП' },
                        { value: 4, label: '4АП' },
                        { value: 5, label: '5АП' },
                        { value: 6, label: '6АП' },
                        { value: 100, label: '∞' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Checkbox
                      checked={search.strict_mode == true ? true : false}
                      onChange={this.handleChangeStrictMode}
                    >
                      Строгий фильтр
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item>
                    <Input
                      controls={false}
                      name="phone"
                      value={search.phone}
                      placeholder="Телефон"
                      onChange={this.handleChangeText}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      // style={{ width: 100 }}
                      disabled={!search.street}
                      value={search.building == '' ? undefined : search.building}
                      allowClear
                      showSearch
                      placeholder="Дом"
                      optionFilterProp="children"
                      onChange={this.handleChooseSearchBuilding}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {buildingOptions.map((building) => {
                        return (
                          <Select.Option key={building.id} value={building.id}>
                            {building.value}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="До: "
                  >
                    <Select
                      placeholder="Коэффициент"
                      onChange={this.handleChangeToCoefficient}
                      defaultValue={search.to_coefficient}
                      options={[
                        { value: 0, label: '1р.' },
                        { value: 1, label: '1АП' },
                        { value: 2, label: '2АП' },
                        { value: 3, label: '3АП' },
                        { value: 4, label: '4АП' },
                        { value: 5, label: '5АП' },
                        { value: 6, label: '6АП' },
                        { value: 100, label: '∞' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Checkbox
                      checked={search.in_process == true ? true : false}
                      onChange={this.handleChangeInProcess}
                    >
                      Обработанные
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item>
                    <DatePicker
                      style={{ width: '100%' }}
                      onChange={this.handleChangeMonth}
                      picker="month"
                      value={dayjs(search.month, 'YYYY-MM-DD')}
                      format="MMMM YYYY"
                      allowClear={false}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      value={search.flat == '' ? undefined : search.flat}
                      disabled={!search.building}
                      allowClear
                      showSearch
                      placeholder="Квартира"
                      optionFilterProp="children"
                      onChange={this.handleChooseSearchFlat}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {flatOptions.map((flat) => {
                        return (
                          <Select.Option key={flat.id} value={flat.value}>
                            {flat.value}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Select
                      onChange={this.handleChangeStatus}
                      value={search.status == '' ? undefined : search.status}
                      allowClear
                      placeholder="Статус"
                      options={[
                        { value: 'default', label: 'Текущий' },
                        { value: 'impossible', label: 'Нет возможности' },
                        { value: 'disconnected', label: 'Отключен' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      onChange={this.handleChangeAccType}
                      value={search.acc_type == '' ? undefined : search.acc_type}
                      allowClear
                      placeholder="Тип аккаунта"
                      options={[
                        { value: 1, label: 'Юр. лица' },
                        { value: 2, label: 'Физ. лица' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
              </Row>
            </Form>
          </Col>
          <Col span={12}>
            <Row justify='space-around'>
              <Col>
                <Statistic title="Должников на 1 число" value={new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(total_data.total_debtors) || '...'} />
                <Statistic
                  title="Текущих должников"
                  value={
                    total_data.total_debtors_current && total_data.total_debtors ?
                      `${new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(total_data.total_debtors_current)} (${((total_data.total_debtors_current / total_data.total_debtors) * 100).toFixed(2)}%)`
                      :
                      '...'}
                />
                <Statistic
                  title="Перенесенные должники"
                  value={
                    total_data.debtors_from_last && total_data.total_debtors ?
                      `${new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(total_data.debtors_from_last)} (${((total_data.debtors_from_last / total_data.total_debtors) * 100).toFixed(2)}%)`
                      :
                      '...'}
                />
              </Col>
              <Col>
                <Statistic
                  title="Сумма долга на 1 число"
                  value={new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(total_data.total_sum) || '...'}
                />
                <Statistic
                  title="Текущая сумма долга"
                  value={total_data.total_sum_current && total_data.total_sum ?
                    `${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(total_data.total_sum_current)} (${((total_data.total_sum_current / total_data.total_sum) * 100).toFixed(2)}%)`
                    :
                    '...'}
                />
                <Statistic
                  title="Сумма по перенесенным"
                  value={total_data.sum_from_last && total_data.total_sum ?
                    `${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(total_data.sum_from_last)} (${((total_data.sum_from_last / total_data.total_sum) * 100).toFixed(2)}%)`
                    :
                    '...'}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Задач за месяц" value={new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(total_data.total_count_request) || '...'} />
                <Statistic
                  title="Задач выполнено"
                  value={total_data.total_request_is_done && total_data.total_count_request ?
                    `${new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(total_data.total_request_is_done)} (${((total_data.total_request_is_done / total_data.total_count_request) * 100).toFixed(2)}%)`
                    :
                    '...'}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Preloader loading={this.state.loading}>
          {visible_request_card && debtor &&
            <Modal
              title={`Задача`}
              visible={visible_request_card}
              onCancel={this.closerModalRequest}
              onOk={this.closerModalRequest}
              footer={false}
              width={'80%'}
            >
              <RequestCard request_id={debtor.request_id} />
            </Modal>
          }
          {visible_agreement_card &&
            <Modal
              title={`Карточка договора`}
              visible={visible_agreement_card}
              onCancel={() => { this.setState({ visible_agreement_card: false }) }}
              onOk={() => { this.setState({ visible_agreement_card: false }) }}
              footer={false}
              width={'95%'}
            >
              <AgreementCard agrm_id={this.state.agrm_id} />
            </Modal>
          }
          <div style={{height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            rowKey={(record) => record.number}
            loading={loading}
            columns={columns}
            dataSource={this.state.debtors}
            hideOnSinglePage={true}
            onChange={this.handleTableChange}
            pagination={pagination}
            size='small'
            bordered
            scroll={{
              x: true
            }}
          />
        </Preloader>
      </React.Fragment >
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
  datePicker: {
    width: '150px',
  },
});

export default withStyles(styles)(Debtors);
