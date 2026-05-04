import React, { Component } from 'react';
import Rest from 'tools/rest';

import { withStyles } from '@material-ui/core/styles';
import {
  Layout,
  Table,
  FloatButton,
  Select,
  Input,
  Row,
  Col,
  Form,
  Tag,
  Modal,
  Checkbox,
  InputNumber,
  Typography,
} from 'antd';
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

import { PageHeader } from '@ant-design/pro-layout';
import { InfoCircleOutlined } from '@ant-design/icons';
import { parseISO as _parseISO, format } from 'date-fns';
import { Link } from 'react-router-dom';

import QueryMixin from 'components/query_mixin';
import Preloader from 'components/preloader';
import AgreementCard from 'components/agreement_card';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;

{/* МОК ДАННЫЕ const MOCK_AGREEMENTS = [ { id: 1, number: '10001', name: 'Иванов Иван Иванович', address: 'ул. Ленина, 12, 45', tarifs: 'Интернет 100 Мб+ит/с', balance: 350.00, bill_delivery: 'email', lk_status: 'confirmed_lk', type: 2, uid: 'uid-001' },
{ id: 2, number: '10002', name: 'Петрова Мария Сергеевна', address: 'ул. Пушкина, 7, 12', tarifs: 'Интернет 200Мбит/с + ТВ', balance: -120.50, bill_delivery: 'receipt', lk_status: 'unconfirmed_lk', type: 2, uid: 'uid-002' },
      { id: 3, number: '10003', name: 'ООО "Ромашка"', address: 'пр. Советский, 1, 301', tarifs: 'Бизнес 500 Мбит/с',balance: 1200.00, bill_delivery: 'all', lk_status: 'no_lk', type: 1, uid: 'uid-003' },
      { id: 4, number: '10004', name: 'Сидоров Алексей Петрович', address: 'ул. Гагарина, 33, 8', tarifs: 'Интернет 1Мбит/с', balance: 0.00, bill_delivery: 'email', lk_status: 'confirmed_lk', type: 2, uid: 'uid-004' },
      { id: 5, number: '10005', name: 'Козлова Елена Дмитриевна', address: 'ул. Мира, 5, 22', tarifs: 'ТВ Базовый', balance: 75.30, bill_delivery: 'receipt', lk_status: 'no_lk', type: 2, uid: 'uid-005' },
      ];
*/}

class Agreements extends QueryMixin {
  state = {
    selectedType: null,
    lb_agreements: [],
    orders: [],
    meta: {
      page: this.getQuery('page'),
      per: this.getQuery('per'),
      total: 0,
    },
    search: {
      street: this.getQuery('street'),
      street_id: this.getQuery('street_id'),
      building: this.getQuery('building'),
      building_id: this.getQuery('building_id'),
      flat: this.getQuery('flat'),
      flat_id: this.getQuery('flat_id'),
      name: this.getQuery('name'),
      number: this.getQuery('number'),
      phone: this.getQuery('phone'),
      entrance_id: this.getQuery('entrance_id'),
      request_reasons: this.getQuery('request_reasons') || [],
      request_subtypes: this.getQuery('request_subtypes') || [],
      billDelivery: this.getQuery('billDelivery') || [],
      lkStatus: this.getQuery('lkStatus')|| [],
    },
    streetOptions: [],
    buildingOptions: [],
    flatOptions: [],
    loading: false,
    useDebounce: false,
    visibleCard: false,
    agreement: {},
    buildings: [],
    entrances: [],
    flats: [],
    lb_tarifs: [],
  };

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
    document.title = _replace(document.title, ' | Договоры', '')
  }

  componentDidMount() {
    document.title += ' | Договоры'
    this.loadAgreements();
    this.loadStreetOptions();
    this.loadStreets();
    this.loadReasons();
    this.loadUsers();
    this.loadTarifs();
    if (this.getQuery('request_type_id')) { this.loadSubtypes(this.getQuery('request_type_id')) }
    if (this.getQuery('street_id')) { this.loadBuildings(this.getQuery('street_id')) }
    if (this.getQuery('building_id')) { this.loadEntrances(this.getQuery('building_id')) }
    if (this.getQuery('building_id')) { this.loadFlats(this.getQuery('building_id')) }
  }

  componentDidUpdate(prevProps, prevState) {
    const { street, building } = this.state.search;
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.orders, this.state.orders) ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per)
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadAgreements();
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

  loadAgreements = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      filter: this.state.search,
      orders: this.state.orders
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true, useDebounce: false });


    {/* ТЕСТ МОК ДАННЫХ const lb_agreements = MOCK_AGREEMENTS;
    const meta = { page: 1, per: 25, total: lb_agreements.length };
    this.setState({
      lb_agreements,
      meta,
      loading: false,
      agreement: lb_agreements.length > 0 ? lb_agreements[0] : {},
      visibleCard: this.getQuery('visibleCard') ? true : this.state.visibleCard,
    }); */}



    this.loadRequest = Rest.get('/api/v1/lb_agreements.json', { params: params }).then(
      (response) => {
        const { lb_agreements, meta } = response.data;
        this.setState({
          lb_agreements,
          meta,
          loading: false,
          agreement: lb_agreements.length > 0 ? lb_agreements[0] : {},
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

  loadTarifs() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/lb_tarifs.json`).then(
      (response) => {
        const { lb_tarifs } = response.data
        this.lb_tarifs = _map(lb_tarifs, (t) => {
          return { label: t.descr, value: t.tar_id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
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

  handleChangeEntrance = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, entrance_id: value },
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

  handleChangeFlat = (value, option) => {
    this.setState({
      meta: { ...this.state.meta },
      search: { ...this.state.search, flat_id: value },
    })
  };

  handleChangeText = (e) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, [e.target.name]: e.target.value },
    });
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

  handleBalanceFromChange = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        balanceFrom: value
      },
      meta: { ...this.state.meta, page: 1 }
    });
  };

  handleBalanceToChange = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        balanceTo: value
      },
      meta: { ...this.state.meta, page: 1 }
    });
  };

  handleTarifToChange = (value) => {
    this.setState({
      search: {
        ...this.state.search,
        tar_id: value
      },
      meta: { ...this.state.meta, page: 1 }
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    let orders = sorter
    if (sorter.length) {
      orders = _map(sorter, (record) => { return { order: record.order.replace('end', ''), order_by: record.field } })
    } else {
      orders = sorter.order == undefined ? [] : [{ order: sorter.order.replace('end', ''), order_by: sorter.field }]
    }
    this.setState({
      orders: orders,
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
      }
    });
  };

  handleTypeSelect = (type) => {
    this.setState({
      selectedType: type,
      search: { ...this.state.search,
         type: type,
      },
      meta: { ...this.state.meta, page: 1 },
    });
  };

  handleBillDeliveryChange = (type) => {
    this.setState(prevState => ({
        search: {
            ...prevState.search,
            billDelivery: type,
        },
        meta: { ...prevState.meta, page: 1 }
    }));
  };

  handleLkStatusChange = (type) => {
    this.setState(prevState => ({
        search: {
            ...prevState.search,
            lkStatus: type,
        },
        meta: { ...prevState.meta, page: 1 }
    }));
  };

  render() {
    const {
      loading,
      search,
      streetOptions,
      buildingOptions,
      flatOptions,
      visibleCard,
      agreement,
      buildings,
      meta,
      flats,
      entrances,
      selectedOption,
      inputValue,
      selectedType,
    } = this.state;

    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      position: ['bottomCenter'],
      defaultCurrent: '1',
      showSizeChanger: true,
    };

    const columns = [
      { title: '№ договора', dataIndex: 'number', key: 'number' },
      { title: 'ФИО', dataIndex: 'name', key: 'name' },
      {
        title: 'Улица',
        dataIndex: 'street',
        key: 'street',
        sorter: { multiple: 1 },
        render: (_, record) => (record.address?.split(',')[0]),
      },
      {
        title: 'д.',
        dataIndex: 'building',
        key: 'building',
        sorter: { multiple: 2 },
        render: (_, record) => (record.address?.split(',')[1])
      },
      {
        title: 'кв.',
        dataIndex: 'flat',
        key: 'flat',
        sorter: { multiple: 3 },
        render: (_, record) => (record.address?.split(',')[2])
      },
      { title: 'Тарифы', dataIndex: 'tarifs', key: 'tarifs' },
      { title: 'Баланс', dataIndex: 'balance', key: 'balance' },
      {
        title: 'Способ счета',
        dataIndex: 'bill_delivery',
        key: 'bill_delivery',
        render: (val) => {
          switch (val) {
            case 'all':
              return 'Электронный+Бумажный';
            case 'email':
              return 'Электронный';
            case 'receipt':
              return 'Бумажный';
          }
        },
      },
      {
        title: 'ЛК',
        dataIndex: 'lk_status',
        key: 'lk_status',
        render: (val) => {
          switch (val) {
            case 'confirmed_lk':
              return 'ПЛК';
            case 'unconfirmed_lk':
              return 'ЛК';
              case 'no_lk':
                return '-';
              default:
                return val
          }
        },
      },
      {
        title: 'Тип договора',
        dataIndex: 'type',
        key: 'type',
        render: (val) => {
          switch (val) {
            case 1:
              return 'Юридическое лицо';
            case 2:
              return 'Физическое лицо';
          }
        },
      },
    ];

    return (
      <React.Fragment>
        <PageHeader title="Договоры"></PageHeader>
        {visibleCard &&
          <Modal
            title={
              <React.Fragment>
                <Text>Карточка договора № {agreement.number}</Text>
                < InfoCircleOutlined
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    GotoAccountButton.gotoAccount(agreement.uid, '_blank');
                  }}
                />
              </React.Fragment>
            }
            visible={visibleCard}
            onCancel={() => { this.setState({ visibleCard: false }) }}
            onOk={() => { this.setState({ visibleCard: false }) }}
            footer={false}
            width={'95%'}
          >
            <AgreementCard agrm_id={agreement.id} />
          </Modal>}
        <FloatButton.BackTop />
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='Номер договора:'
                labelCol={{ span: 8 }}
                style={{marginBottom: '5px'}}
              >
                <Input
                  name="number"
                  value={search.number}
                  placeholder="Номер договора"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              <Form.Item
                label='ФИО:'
                labelCol={{ span: 8 }}
                style={{marginBottom: '5px'}}
              >
                <Input
                  name="name"
                  value={search.name}
                  placeholder="ФИО"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              <Form.Item
                label='Телефон:'
                labelCol={{ span: 8 }}
                style={{marginBottom: '5px'}}
              >
                <Input
                  controls={false}
                  name="phone"
                  value={search.phone}
                  placeholder="Телефон"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Тип договора:'
                labelCol={{ span: 8 }}
                style={{marginBottom: '5px'}}
              >
                <Select
                  value={selectedType}
                  onChange={this.handleTypeSelect}
                  placeholder="Тип договора"
                  allowClear
                >
                  <Select.Option value={2}>Физическое лицо</Select.Option>
                  <Select.Option value={1}>Юридическое лицо</Select.Option>
                </Select>
              </Form.Item>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label='Улица:'
                    labelCol={{ span: 8 }}
                    //wrapperCol={{ span: 20 }}
                    style={{ marginBottom: '5px' }}
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
                <Col span={12}>
                  <Form.Item
                    label='Дом:'
                    labelCol={{ span: 8 }}
                    style={{ marginBottom: '5px' }}
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
                {/* <Col span={8}>
                  <Form.Item
                    label='Под.:'
                    labelCol={{ span: 8 }}
                    style={{ marginBottom: '5px' }}
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
                </Col> */}
                <Col span={12}>
                  <Form.Item
                    label='Кв.:'
                    labelCol={{ span: 8 }}
                    style={{ marginBottom: '5px' }}
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
            <Col span={6}>
              <Form.Item
                label="Баланс:"
                labelCol={{ span: 8 }}
                style={{marginBottom: '5px'}}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <InputNumber
                    style={{ width: '50%', marginRight: '5px' }}
                    value={this.state.search.balanceFrom}
                    onChange={this.handleBalanceFromChange}
                    placeholder="от"
                    controls={false}
                  />
                  <InputNumber
                    style={{ width: '50%', marginRight: '5px' }}
                    value={this.state.search.balanceTo}
                    onChange={this.handleBalanceToChange}
                    placeholder="до"
                    controls={false}
                  />
                </div>
              </Form.Item>
              <Form.Item
                label="Статус ЛК"
                labelCol={{ span: 8 }}
                style={{ marginBottom: '5px' }}
              >
                <Select
                  value={this.state.search.lkStatus}
                  onChange={this.handleLkStatusChange}
                  placeholder="Выберите статус ЛК"
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="confirmed_lk">ПЛК</Select.Option>
                  <Select.Option value="unconfirmed_lk">ЛК</Select.Option>
                  <Select.Option value="no_lk">БЕЗ ЛК</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Способ счета"
                labelCol={{ span: 8 }}
                style={{ marginBottom: '5px' }}
              >
                <Select
                  value={this.state.search.billDelivery}
                  onChange={this.handleBillDeliveryChange}
                  placeholder="Способ счета"
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="all">Электронный+Бумажный</Select.Option>
                  <Select.Option value="email">Электронный</Select.Option>
                  <Select.Option value="receipt">Бумажный</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label='Тарифы:'
                labelCol={{ span: 8 }}
                style={{marginBottom: '5px'}}
              >
                <Select
                  allowClear
                  showSearch
                  value={search.tar_id == '' ? undefined : search.tar_id}
                  placeholder='тариф'
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={this.lb_tarifs}
                  onChange={this.handleTarifToChange}
                />
              </Form.Item>
              <Form.Item
                label='Только активные:'
                labelCol={{ span: 12 }}
                style={{marginBottom: '5px'}}>
                <Checkbox
                  checked={search.unblocked == true ? true : false}
                  onChange={(e) => {
                    this.setState({
                      search: {
                        ...search,
                        unblocked: e.target.checked ? true : null
                      }
                    })
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Preloader loading={this.state.loading}>
          <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            rowKey={(record) => record.id}
            loading={loading}
            columns={columns}
            dataSource={this.state.lb_agreements}
            hideOnSinglePage={true}
            onChange={this.handleTableChange}
            pagination={pagination}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => { this.setState({ visibleCard: true, agreement: record }) },
              };
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

export default withStyles(styles)(Agreements);
