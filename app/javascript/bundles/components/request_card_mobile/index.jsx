import React from 'react';
import Rest from 'tools/rest';
import {
  Tabs,
  Button,
  Input,
  Select,
  Row,
  Col,
  Form,
  Typography,
  InputNumber,
  Empty,
  DatePicker,
  Radio,
  Modal,
} from 'antd';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  last as _last,
  includes as _includes,
  isEqual as _isEqual,
} from 'lodash';
import dayjs from 'dayjs';
import { parseISO as _parseISO, format } from 'date-fns';
import Preloader from 'components/preloader';
import { toast } from 'react-toastify';

import UserSelect from 'components/user_search';
import UserSearchModal from 'components/user_search_modal';
import DeviceSearchModal from 'components/device_search_modal';
import Events from './components/events'
import TimeSlotsTable from 'components/time_slots_table';

const { Text } = Typography;
const { TextArea } = Input;

class RequestCardMobile extends React.Component {
  state = {
    request: {
      description: null,
      plan_do_daterange: [null, null],
      request_type_id: null,
      request_status_id: null,
      request_reason_id: null,
      responsible_user: null,
      executor_user_id: null,
      resource_id: null,
      resource_type: null,
      resource: {
        identifier: null,
        address: null,
        name: null,
        phone: null,
      },
      created_at: null,
      events: [],
    },
    request_statuses: [],
    request_id: null,
    comment: null,
    loading: false,
    fieldsChanged: false,
    visible_search_agreement: false,
    visible_search_device: false,
    visible_search_timeslot: false,
    activeKey: 'logs',
    errors: [],
  };

  constructor(props) {
    super(props);
    if (props.request_id) {
      this.state = {
        ...this.state,
        request_id: props.request_id
      };
    }
    if (props.resource) {
      this.state.request = {
        ...this.state.request,
        ...props.resource,
      }
    }
  };

  request_reasons = [];
  request_types = [];

  executor_users = [];

  componentDidMount() {
    if (this.state.request_id) {
      this.loadData()
    };
    this.loadReasons();
    this.loadUsers();
    this.loadRequestTypes();
  };

  componentDidUpdate(prevProps, prevState) { }

  loadData() {
    const { request_id } = this.state
    this.setState({ loading: true });
    Rest.get(`/api/v1/requests/${request_id}.json`).then(
      (response) => {
        const { request, request_statuses } = response.data
        if (request) {
          this.setState({
            request,
            request_statuses: _map(request_statuses, (status) => {
              return { label: status.name, value: status.id }
            })
          })
        }
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

  loadUsers() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/users/executors_of_requests.json`).then(
      (response) => {
        const { users } = response.data
        this.executor_users = _map(users, (user) => {
          return { label: user.name, value: user.id }
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

  loadStatuses(request_type_id) {
    if (!request_type_id) {
      this.setState({
        request_statuses: [],
        request: { ...this.state.request, request_status_id: null }
      })
      return
    };
    const params = {
      request_type_id: request_type_id,
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_statuses.json`, { params: params }).then(
      (response) => {
        const { request_statuses } = response.data
        const default_status = _find(request_statuses, { 'priority': 1 })
        this.setState({
          request_statuses: _map(request_statuses, (status) => {
            return { label: status.name, value: status.id }
          }),
          request: {
            ...this.state.request,
            request_status_id: default_status ? default_status.id : null
          }
        })

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false, data_relevant: true });
      });
  };

  handleChangeComment = (e) => {
    const comment = e.target.value
    this.setState({
      comment: comment && comment.trim() ? comment : null,
      fieldsChanged: true,
    })
  };

  handleCreateRequest = (object) => {
    const { request } = this.state
    const params = {
      request: {
        ...request,
        plan_started_at: request.plan_do_daterange[0],
        plan_finished_at: request.plan_do_daterange[1],
      },
      comment: this.state.comment
    }
    this.setState({ loading: true });
    Rest.post(`/api/v1/requests.json`, params).then(
      (response) => {
        const { request, request_events, agreement } = response.data
        const request_id = request.id
        this.setState({
          fieldsChanged: false,
          request,
          request_id: request_id,
          comment: null
        })
        toast.success('Задача создана успешно');
      }).catch((e) => {
        this.setState({ errors: e.response.data.request.errors })
        toast.error('Ошибка создания задачи');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  handleUpdateRequest = (object) => {
    const { request_id } = this.state
    const { request } = this.state
    const params = {
      request: {
        ...request,
        plan_started_at: request.plan_do_daterange[0],
        plan_finished_at: request.plan_do_daterange[1],
      },
      comment: this.state.comment
    }
    this.setState({ loading: true });
    Rest.put(`/api/v1/requests/${request_id}.json`, params).then(
      (response) => {
        const { request, request_events, agreement } = response.data
        this.setState({
          fieldsChanged: false,
          request,
          comment: null
        })
        toast.success('Изменения сохранены');
      }).catch((e) => {
        this.setState({ errors: e.response.data.request.errors })
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleCloseSearchAgreement = () => {
    this.setState({ visible_search_agreement: false });
  };
  handleCloseSearchDevice = () => {
    this.setState({ visible_search_device: false });
  };
  handleCloseSeatchTimeslot = () => {
    this.setState({ visible_search_timeslot: false });
  };

  handleChoiceAgreement = (v) => {
    this.setState({
      request: {
        ...this.state.request,
        resource_id: v.id,
        resource_type: 'LbAgreement',
        resource: {
          identifier: v.agreement_number,
          address: v.address,
          name: v.name,
          phone: v.phone,
        },
      },
      fieldsChanged: true,
    })
  };

  handleChoiceDevice = (v) => {
    this.setState({
      request: {
        ...this.state.request,
        resource_id: v.id,
        resource_type: 'LbDevice',
        resource: {
          identifier: v.name,
          address: v.address,
        },
      },
      fieldsChanged: true,
    })
  };

  handleChooseTimeslots = (v) => {
    this.setState({
      request: {
        ...this.state.request,
        executor_user_id: v.executor_user_id,
        plan_do_daterange: v.date_range,
      },
      visible_search_timeslot: false,
      fieldsChanged: true,
    })
  }

  render() {
    const {
      request,
      request_id,
      request_statuses,
      comment,
      loading,
      fieldsChanged,
      errors,
      visible_search_agreement,
      visible_search_device,
      visible_search_timeslot,
    } = this.state;

    const isCreate = request_id ? false : true;

    let resource_type_ru = "Назначение"
    switch (request.resource_type) {
      case "LbAgreement":
        resource_type_ru = "Договор"
        break;
      case "LbDevice":
        resource_type_ru = "Оборудование"
        break;
    }

    let fields = []
    _forEach(request, (value, key) => {
      fields = [...fields, {
        name: ['request', key],
        value: (key == 'plan_do_daterange') ?
          _map(value, (date) => {
            return date ? dayjs(date) : null
          })
          :
          value,
        errors: errors ? errors[key] : [],
      }]
    });

    return (
      <Preloader loading={loading} >
        <Form
          fields={fields}
          onFinish={isCreate ? this.handleCreateRequest : this.handleUpdateRequest}
          onFieldsChange={(changedFields, allFields) => {
            _map(changedFields, (v) => {
              if (v.name[1] == 'request_type_id') this.loadStatuses(v.value);
              this.setState((prevState) => {
                prevState.request[_last(v.name)] = v.value;
                prevState.errors ? prevState.errors[_last(v.name)] = [] : null;
                return prevState;
              })
            })
            this.setState({ fieldsChanged: true })
          }}
        >
          <Form.Item
            label="Номер:"
          >
            <Text>{request.id}</Text>
          </Form.Item>
          <Form.Item
            name={['request', 'request_type_id']}
            label="Тип:"
          >
            <Text>{_find(this.request_types, { value: request.request_type_id })?.label}</Text>
          </Form.Item>
          <Form.Item
            label="Описание:"
          >
            <Text>{request.description}</Text>
          </Form.Item>
          <Form.Item
            label='Время выполнения:'
          >
            <Text>c {request.plan_do_daterange[0] ? format(_parseISO(request.plan_do_daterange[0]), 'dd.MM.yyyy HH:mm') : null} - </Text>
            <Text>до {request.plan_do_daterange[1] ? format(_parseISO(request.plan_do_daterange[1]), 'dd.MM.yyyy HH:mm') : null}</Text>
          </Form.Item>
          {request.resource &&
            <React.Fragment>
              {request.resource.address &&
                <Form.Item
                  label="Адрес:"
                >
                  <Text>{request.resource.address}</Text>
                </Form.Item>
              }
              {request.resource.name &&
                <Form.Item
                  label="ФИО абонента:"
                >
                  <Text>{request.resource.name}</Text>
                </Form.Item>
              }
              {request.resource.phone &&
                <Form.Item
                  label="Телефон:"
                >
                  <Text>{request.resource.phone}</Text>
                </Form.Item>
              }
            </React.Fragment>}
          <Form.Item
            name={['request', 'request_status_id']}
            label="Статус:"
          >
            <Select
              // allowClear
              className='mobile_selector'
              dropdownClassName='mobile_dropdown_menu'
              options={request_statuses}
              style={{ fontSize: '30pt' }}
            />
          </Form.Item>
          <Form.Item
            name={['request', 'request_reason_id']}
            label='Причина обращения:'
          >
            <Select
              // allowClear
              className='mobile_selector'
              dropdownClassName='mobile_dropdown_menu'
              options={this.request_reasons}
              style={{ fontSize: '30pt' }}
            />
          </Form.Item>
          <Form.Item
            label="Комментарий:"
          >
            <TextArea
              placeholder="Комментарий"
              rows={4}
              onChange={this.handleChangeComment}
              value={comment}
              style={{ fontSize: '16px' }}
              autoSize={true}
            />
          </Form.Item>
          <Button
            style={{ width: '100%', marginBottom: '40px', height: '40px' }}
            type='primary'
            htmlType="submit"
            disabled={!fieldsChanged}
          >
            {isCreate ? 'Создать' : 'Сохранить'}
          </Button>
        </Form>

        {(request.events.length > 0) ?
          <Events events={request.events} />
          :
          <Empty style={{ marginBottom: '30px' }} />}
      </Preloader >
    );
  }
}


export default RequestCardMobile
