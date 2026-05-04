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
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { red, volcano, green, yellow } from '@ant-design/colors';
import { parseISO as _parseISO, format } from 'date-fns';
import { find as _find, map as _map, includes as _includes } from 'lodash'

import QueryMixin from 'components/query_mixin';
import Preloader from 'components/preloader';
import BlockingServiceCard from 'components/blocking_service_card';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;

class BlockingServices extends QueryMixin {
  state = {
    blocking_services: [],
    statuses: [],
    meta: {
      page: this.getQuery('page'),
      per: this.getQuery('per'),
      total: 0,
    },
    search: {
      status: this.getQuery('status'),
      street_id: this.getQuery('street_id'),
      building_id: this.getQuery('building_id'),
      entrance_id: this.getQuery('entrance_id'),
      flat_id: this.getQuery('flat_id'),
      name: this.getQuery('name'),
      number: this.getQuery('number'),
      phone: this.getQuery('phone'),
      lk_phone: this.getQuery('lk_phone'),
      active: this.getQuery('active'),
      blocking_number: this.getQuery('blocking_number')
    },
    buildings: [],
    entrances: [],
    flats: [],
    loading: false,
    useDebounce: false,
    visibleCard: false,
    blocking_service: {},
    data_relevance: null,
  };

  streets = [];

  loadBlockingServices = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      filter: this.state.search,
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true, useDebounce: false });

    this.loadRequest = Rest.get('/api/v1/blocking_services.json', { params: params }).then(
      (response) => {
        const { blocking_services, statuses, meta } = response.data;
        this.setState({
          blocking_services,
          statuses,
          meta,
          loading: false,
          blocking_service: blocking_services.length > 0 ? blocking_services[0] : {},
          visibleCard: this.getQuery('visibleCard') ? true : this.state.visibleCard
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
    document.title = _replace(document.title, ' | Блокировки ЛК', '')
  }

  componentDidMount() {
    document.title += ' | Блокировки ЛК'
    this.loadBlockingServices();
    this.loadStreets();
    if (this.getQuery('street_id')) { this.loadBuildings(this.getQuery('street_id')) }
    if (this.getQuery('building_id')) { this.loadEntrances(this.getQuery('building_id')) }
    if (this.getQuery('building_id')) { this.loadFlats(this.getQuery('building_id')) }
  }

  componentDidUpdate(prevProps, prevState) {
    const { street, building } = this.state.search;
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
        this.loadBlockingServices();
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
  }

  loadStreets = () => {
    this.setState({ loading: true });
    Rest.get(`/api/v1/addresses.json`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        this.streets = _map(suggestions, (s) => {
          return { label: s.value, value: s.id, key: s.id }
        })
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadBuildings = (street_id) => {
    this.setState({ loading: true });
    Rest.get(`/api/v1/addresses/houses.json?street_id=${street_id}`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        this.setState({
          buildings: _map(suggestions, (s) => {
            return { label: s.value, value: s.id };
          })
        });
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadEntrances = (building_id) => {
    this.setState({ loading: true });

    Rest.get(`/api/v1/addresses/entrances.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        this.setState({
          entrances: _map(data, (v) => {
            return { label: v.name, value: v.entrance_id };
          })
        });
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadFlats = (building_id) => {
    this.setState({ loading: true });

    Rest.get(`/api/v1/addresses/flats.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        this.setState({
          flats: _map(data, (v) => {
            return { label: v.name, value: v.flat_id };
          })
        });
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
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

  handleChangeStreet = (value, option) => {
    this.loadBuildings(value)
    this.setState({
      meta: { ...this.state.meta },
      search: {
        ...this.state.search,
        street_id: value,
        building_id: undefined,
        flat_id: undefined,
        entrance_id: undefined,
      },
    })
  };

  handleChangeBuilding = (value, option) => {
    this.loadEntrances(value);
    this.loadFlats(value);
    this.setState({
      meta: { ...this.state.meta },
      search: {
        ...this.state.search,
        building_id: value,
        flat_id: undefined,
        entrance_id: undefined,
      },
    })
  };

  handleChangeEntrance = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, entrance_id: value },
    })
  };

  handleChangeFlat = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, flat_id: value },
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
      blocking_service,
      blocking_services,
      statuses,
      meta
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
      { title: '№', dataIndex: 'id', key: 'id' },
      {
        title: 'Дата С',
        dataIndex: 'from_date',
        key: 'from_date',
        render: (value) => (value ? dayjs(value).format('MM.YYYY') : null),
      },
      {
        title: 'Дата ПО',
        dataIndex: 'to_date',
        key: 'to_date',
        render: (value) => (value ? dayjs(value).format('MM.YYYY') : null),
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        render: (value) => (_find(statuses, { value: value })?.label)
      },
      {
        title: 'Состояние',
        dataIndex: 'active',
        key: 'active',
        render: (value) => (value ? 'Активна' : 'Завершена'),
      },
      {
        title: '№ договора',
        dataIndex: 'agreement',
        key: 'agrm_number',
        render: (value) => {return (value?.number)}
      },
      {
        title: 'Адресс',
        dataIndex: 'agreement',
        key: 'agrm_address',
        render: (value) => { return (value?.address) }
      },
      {
        title: 'Телефон ЛК',
        dataIndex: 'abonent',
        key: 'abonent_phone',
        render: (value) => { return (value?.phone)}
      },
    ];

    return (
      <React.Fragment>
        <FloatButton.BackTop />
        <PageHeader title="Услуги блокировки"></PageHeader>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='ФИО абонента:'
              >
                <Input
                  name="name"
                  value={search.name}
                  placeholder="ФИО"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              <Form.Item
                label='№ блокировки:'
              >
                <Input
                  name="blocking_number"
                  value={search.blocking_number}
                  placeholder="Номер блокировки"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label='Статус:'
              >
                <Select
                  allowClear
                  value={search.status || null}
                  options={statuses}
                  placeholder="Статус"
                  onChange={this.handleChangeStatus}
                />
              </Form.Item>
              <Form.Item
                label='№ договора:'
              >
                <Input
                  name="number"
                  value={search.number}
                  placeholder="Номер договора"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              {/* <Form.Item
                label='Состояние:'
              >
                <Switch
                  defaultChecked
                  checkedChildren="Активные"
                  unCheckedChildren="Все"
                  checked = {search.active}
                  onChange={(checked, e)=> {
                    this.setState({
                      meta: { ...this.state.meta, page: 1 },
                      search: { ...this.state.search, active: checked ? true : null},
                    })
                  }}
                />
              </Form.Item> */}
            </Col>
            <Col span={6}>
              <Form.Item
                label="Телефон договора:"
              >
                <Input
                  controls={false}
                  name="phone"
                  value={search.phone}
                  placeholder="Телефон"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
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
            </Col>
            <Col span={6}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label='Улица:'
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <Select
                      allowClear
                      showSearch
                      // key={this.state.key}
                      value={search.street_id == '' ? undefined : search.street_id}
                      placeholder='Улица'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.streets}
                      onChange={this.handleChangeStreet}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item
                    label='Дом:'
                    labelCol={{ span: 8 }}
                  // wrapperCol={{ span: 12 }}
                  >
                    <Select
                      allowClear
                      showSearch
                      disabled={search.street_id ? false : true}
                      value={search.building_id == '' ? undefined : search.building_id}
                      placeholder='дом'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label, input)}
                      options={buildings}
                      onChange={this.handleChangeBuilding}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Под.:'
                    labelCol={{ span: 10 }}
                  >
                    <Select
                      allowClear
                      showSearch
                      disabled={search.building_id ? false : true}
                      value={search.entrance_id == '' ? undefined : search.entrance_id}
                      placeholder='под.'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label, input)}
                      options={entrances}
                      onChange={this.handleChangeEntrance}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Кв.:'
                    labelCol={{ span: 10 }}
                  >
                    <Select
                      allowClear
                      showSearch
                      disabled={search.building_id ? false : true}
                      value={search.flat_id == '' ? undefined : search.flat_id}
                      placeholder='кв.'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label, input)}
                      options={flats}
                      onChange={this.handleChangeFlat}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='Только активные:'
                labelCol={{ span: 8 }}
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
          </Row>
        </Form>
        <Preloader loading={this.state.loading}>
          {visibleCard &&
            <Modal
              title={`Заявка на блокировку № ${blocking_service.id}`}
              visible={visibleCard}
              onCancel={() => { this.setState({ visibleCard: false, data_relevance: new Date() }) }}
              onOk={() => { this.setState({ visibleCard: false, data_relevance: new Date() }) }}
              footer={false}
              width={'80%'}
            >
              <BlockingServiceCard blockingServiceId={blocking_service?.id} />
            </Modal>}
          <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            rowKey={(record) => record.id}
            loading={loading}
            columns={columns}
            dataSource={blocking_services}
            hideOnSinglePage={true}
            onChange={this.handleTableChange}
            pagination={pagination}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => { this.setState({ visibleCard: true, blocking_service: record }) }, // click row
              };
            }}
            rowClassName={(record, index) => {
              switch (record.status) {
                case 'processing':
                  return classes['warning'];
                case 'blocked':
                  return classes['success'];
                case 'unblocking':
                  return classes['danger'];
              }
            }}
          />
        </Preloader>
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

export default withStyles(styles)(BlockingServices);
