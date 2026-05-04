import React, { Component } from 'react';
import { connect } from 'react-redux';
import Rest from 'tools/rest';
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  Checkbox,
  Select,
  DatePicker,
  Input,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  debounce,
  find as _find,
  forEach as _forEach,
  map as _map,
  isEqual as _isEqual,
  last as _last,
  includes as _includes,
  replace as _replace
} from 'lodash';
import dayjs from 'dayjs';

import QueryMixin from 'components/query_mixin';
import Preloader from 'components/preloader';
import Requests from 'components/requests';
import RequestStates from 'components/request_states';
import RequestReasons from 'components/request_reasons';
import SearchTemplatesPanel from 'components/search_templates_panel';

const { RangePicker } = DatePicker;

class HelpDesk extends QueryMixin {
  state = {
    visible_request_card: false,
    visible_request_reasons: false,
    meta: {
      page: this.getQuery('page') || 1,
      per: this.getQuery('per') || 50,
      total: 0,
      order: this.getQuery('order'),
      order_by: this.getQuery('order_by'),
    },
    search: {
      actual: this.getQuery('actual'),
      number: this.getQuery('number'),
      description: this.getQuery('description'),
      request_type_id: this.getQuery('request_type_id'),
      request_statuses: this.getQuery('request_statuses') || [],
      responsible_user_id: this.getQuery('responsible_user_id'),
      executor_user_id: this.getQuery('executor_user_id'),
      created_at: [this.getQuery('created_at_from'), this.getQuery('created_at_to')],
      doned_at: [this.getQuery('doned_at_from'), this.getQuery('doned_at_to')],
      do_today: this.getQuery('do_today'),
      show_all: this.getQuery('show_all'),
      street_id: this.getQuery('street_id'),
      building_id: this.getQuery('building_id'),
      entrance_id: this.getQuery('entrance_id'),
      flat_id: this.getQuery('flat_id'),
      request_reasons: this.getQuery('request_reasons') || [],
      request_subtypes: this.getQuery('request_subtypes') || [],
    },
    request_statuses: [],
    request_subtypes: [],
    buildings: [],
    entrances: [],
    flats: [],
    visibleCard: false,
    useDebounce: false,
    loading: false,
    key: 0,
  };

  request_reasons = [];
  request_types = [];
  users = [];

  streets = [];

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Задачи', '')
    if (this.loadRequest) this.loadRequest.cancel();
  };

  componentDidMount() {
    document.title += ' | Задачи'
    this.loadRequestTypes();
    this.loadRequestStatuses();
    this.loadUsers();
    this.loadStreets();
    this.loadReasons();
    if (this.getQuery('request_type_id')) { this.loadSubtypes(this.getQuery('request_type_id')) }
    if (this.getQuery('street_id')) { this.loadBuildings(this.getQuery('street_id')) }
    if (this.getQuery('building_id')) { this.loadEntrances(this.getQuery('building_id')) }
    if (this.getQuery('building_id')) { this.loadFlats(this.getQuery('building_id')) }
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.meta, this.state.meta)
    ) {
      this.handleSetQuery(this.state.meta)
    };

    if (
        prevState.search.request_type_id !== this.state.search.request_type_id &&
        this.state.search.request_type_id
      ) {
      this.loadSubtypes(this.state.search.request_type_id)
    }
  };

  handleSetQuery = (meta) => {
    let searchToUrl = {}
    _forEach(this.state.search, (value, key) => {
      if (key == 'created_at' || key == 'doned_at') {
        searchToUrl[`${key}_from`] = value[0];
        searchToUrl[`${key}_to`] = value[1];
        return
      }
      searchToUrl[key] = value;
    })
    this.setQuery({
      ...searchToUrl,
      page: meta.page,
      per: meta.per,
      order: meta.order,
      order_by: meta.order_by,
    });
  }

  handleChangeMeta = (meta) => {
    this.handleSetQuery(meta)
    this.setState({
      meta: {
        ...this.state.meta,
        total: meta.total
      }
    })
  };

  loadUsers() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/users/help_desk_users`).then(
      (response) => {
        const { users } = response.data
        this.users = _map(users, (user) => {
          return { label: user.name, value: user.id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadReasons() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_reasons.json`).then(
      (response) => {
        const { request_reasons } = response.data
        this.request_reasons = _map(request_reasons, (reason) => {
          if (!reason.active) {
            return { label: reason.description, value: reason.id, disabled: true }
          }
          return { label: reason.description, value: reason.id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadRequestTypes() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_types.json`).then(
      (response) => {
        const { request_types } = response.data
        this.request_types = _map(request_types, (type) => {
          return { label: type.name, value: type.id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadSubtypes(request_type_id) {
    const params = {
      request_type_id: request_type_id,
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_subtypes.json`, { params: params }).then(
      (response) => {
        const { request_subtypes } = response.data
        this.setState({
          request_subtypes: _map(request_subtypes, (subtype) => {
            return { label: subtype.name, value: subtype.id }
          })
        })

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadRequestStatuses() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_statuses/for_searching.json`).then(
      (response) => {
        const { request_statuses } = response.data
        this.setState({
          request_statuses: _map(request_statuses, (status) => {
            return { label: status, value: status }
          })
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

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

  handleChangeType = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: {
        ...this.state.search,
        request_type_id: value,
        request_subtypes: [],
      },
    });
  };

  handleChangeStatus = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, request_status: value },
    })
  };

  handleChangeResponsibleUser = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, responsible_user_id: value },
    })
  };

  handleChangeExecutorUser = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, executor_user_id: value },
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

  handleChangeText = (e) => {
    if (this.debounceLoad) {
      this.debounceLoad.cancel();
    }
    this.debounceLoad = debounce(() => {
      this.setState({
        useDebounce: true,
        meta: { ...this.state.meta, page: 1 },
        search: { ...this.state.search, [e.target.name]: e.target.value },
      });
    }, 500);

    this.debounceLoad();

    if (!this.state.useDebounce) {
      this.debounceLoad.flush();
    }
  };

  handleSetSearch = (searchParams) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        ...searchParams
      }
    })
  };

  render() {
    const {
      visible_request_states,
      visible_request_reasons,
      search,
      meta,
      request_statuses,
      buildings,
      entrances,
      flats,
      loading,
    } = this.state

    const {
      current_user
    } = this.props

    return (
      <React.Fragment>
        <PageHeader
          title="Задачи"
          extra={[
            <React.Fragment key="options">
              {current_user.role == 'admin' &&
                <React.Fragment>
                  <Button
                    type="button"
                    onClick={() => this.setState({ visible_request_states: true })}>
                    Типы / Статусы
                  </Button>
                  <Button
                    type="button"
                    onClick={() => this.setState({ visible_request_reasons: true })}>
                    Причины закрытия
                  </Button>
                </React.Fragment>
              }
            </React.Fragment>,
          ]}
        />
        {visible_request_states && current_user.role == 'admin' &&
          <Modal
            title={`Управление типами и статусами задач`}
            visible={visible_request_states}
            onCancel={() => { this.setState({ visible_request_states: false }) }}
            onOk={() => { this.setState({ visible_request_states: false }) }}
            footer={false}
            width={'80%'}
          >
            <RequestStates />
          </Modal>
        }
        {visible_request_reasons && current_user.role == 'admin' &&
          <Modal
            title={`Управление причинами задачи`}
            visible={visible_request_reasons}
            onCancel={() => { this.setState({ visible_request_reasons: false }) }}
            onOk={() => { this.setState({ visible_request_reasons: false }) }}
            footer={false}
            width={'50%'}
          >
            <RequestReasons />
          </Modal>
        }
        <Preloader loading={loading}>
          <div style={{width: '97%'}}>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Row gutter={16}>
                <Col span={7}>
                  <Form.Item
                    label={'Номер:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Input
                      name="number"
                      defaultValue={search.number}
                      placeholder="Номер"
                      onChange={this.handleChangeText}
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Автор:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      value={search.responsible_user_id == '' ? undefined : search.responsible_user_id}
                      placeholder='Автор'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.users}
                      onChange={this.handleChangeResponsibleUser}
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Исполнитель:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      value={search.executor_user_id == '' ? undefined : search.executor_user_id}
                      placeholder='Исполнитель'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.users}
                      onChange={this.handleChangeExecutorUser}
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Причины закрытия:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      mode="multiple"
                      value={search.request_reasons}
                      placeholder='Причины закрытия'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.request_reasons}
                      onChange={(value)=> {
                        this.setState({
                          search: {
                            ...search,
                            request_reasons: value
                          }
                        })
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    label={'Тип:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      value={search.request_type_id == '' ? undefined : search.request_type_id}
                      placeholder='Тип задачи'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.request_types}
                      onChange={this.handleChangeType}
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    label={'Подтип:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      mode='multiple'
                      disabled={search.request_type_id ? false : true}
                      value={search.request_subtypes}
                      placeholder='Подтипы'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.state.request_subtypes}
                      onChange={(values)=> {
                        this.setState({
                          search: {
                            ...search,
                            request_subtypes: values
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    label={'Статус:'}
                    style={{marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      mode='multiple'
                      value={search.request_statuses}
                      placeholder='Статусы задачи'
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={request_statuses}
                      onChange={(values)=> {
                        this.setState({
                          search: {
                            ...search,
                            request_statuses: values
                          }
                        })
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label={'Создана:'}
                    style={{marginBottom: '5px'}}
                  >
                    <RangePicker
                      style={{width: '100%'}}
                      value={search.created_at[0] && search.created_at[1] ?
                        _map(search.created_at, (item) => { return dayjs(item, 'DD.MM.YYYY') })
                        :
                        null
                      }
                      placeholder={['Создана с', 'по']}
                      format={'DD.MM.YYYY'}
                      onChange={(dates, dateStrings) => {
                        this.setState({
                          search: {
                            ...search,
                            created_at: dateStrings
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label={'Выполнена:'}
                    style={{marginBottom: '5px'}}
                  >
                    <RangePicker
                      style={{width: '100%'}}
                      value={(search.doned_at[0] && search.doned_at[1]) ?
                        _map(search.doned_at, (item) => { return dayjs(item, 'DD.MM.YYYY') })
                        :
                        null}
                      placeholder={['Выполнена с', 'по']}
                      format={'DD.MM.YYYY'}
                      onChange={(dates, dateStrings) => {
                        this.setState({
                          search: {
                            ...search,
                            doned_at: dateStrings
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        label='Улица:'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{marginBottom: '5px'}}
                      >
                        <Select
                          allowClear
                          showSearch
                          key={this.state.key}
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
                        style={{marginBottom: '5px'}}
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
                        style={{marginBottom: '5px'}}
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
                        style={{marginBottom: '5px'}}
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
                <Col span={4}>
                  <Form.Item
                    label='На сегодня:'
                    labelCol={{ span: 16 }}
                    style={{marginBottom: '5px'}}
                  >
                    <Checkbox
                      checked={search.do_today == true ? true : false}
                      onChange={(e) => {
                        this.setState({
                          search: {
                            ...search,
                            do_today: e.target.checked ? true : null
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label='Показать все:'
                    labelCol={{ span: 16 }}
                    style={{marginBottom: '5px'}}
                  >
                    <Checkbox
                      checked={search.show_all == true ? true : false}
                      onChange={(e) => {
                        this.setState({
                          search: {
                            ...search,
                            show_all: e.target.checked ? true : null
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label='Актуальные(+2д):'
                    labelCol={{ span: 16 }}
                    style={{marginBottom: '5px'}}
                  >
                    <Checkbox
                      checked={search.actual == true ? true : false}
                      onChange={(e) => {
                        this.setState({
                          search: {
                            ...search,
                            actual: e.target.checked ? true : null
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label='Без дублей:'
                    labelCol={{ span: 16 }}
                    style={{ marginBottom: '5px' }}
                  >
                    <Checkbox
                      checked={search.exclude_parent == true ? true : false}
                      onChange={(e) => {
                        this.setState({
                          search: {
                            ...search,
                            exclude_parent: e.target.checked ? true : null
                          }
                        })
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item style={{marginBottom: '5px'}}>
                    <Input
                      name="description"
                      defaultValue={search.description}
                      placeholder="Контекстный поиск по описанию"
                      onChange={this.handleChangeText}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Row>
              <SearchTemplatesPanel searchParams={search} setSearchParams={this.handleSetSearch} searchableType="request"/>
            </Row>
          </div>
        </Preloader>
        <Requests
          search={search}
          meta={meta}
          handleChangeMeta={this.handleChangeMeta}
        />
      </React.Fragment >
    )
  }
}

const mapStateToProps = (state) => {
  return {
    current_user: state.user,
  };
};

export default connect(mapStateToProps, null)(HelpDesk);

