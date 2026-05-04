import React from 'react';
import { connect } from 'react-redux';
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
  Empty,
  DatePicker,
  message,
  Radio,
  Modal,
  Checkbox,
  Popconfirm,
} from 'antd';
import { InfoCircleOutlined, CalendarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  find as _find,
  findIndex as _findIndex,
  forEach as _forEach,
  map as _map,
  last as _last,
  includes as _includes,
  isEqual as _isEqual,
  range as _range,
  difference as _difference,
  remove as _remove,
} from 'lodash';
import dayjs from 'dayjs';
import { parseISO as _parseISO, format } from 'date-fns';
import Preloader from 'components/preloader';
import { toast } from 'react-toastify';
import { AbilityContext } from 'tools/ability';

import UserSearchModal from 'components/user_search_modal';
import DeviceSearchModal from 'components/device_search_modal';
import ProjectSearchModal from 'components/project_search_modal';
import Events from './components/events'
import TimeSlotsTable from 'components/time_slots_table';
import AgreementCard from 'components/agreement_card';
import GotoAccountButton from 'components/widget/goto_account_button';
import FilesUploader from 'components/files_uploader';

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

class RequestCard extends React.Component {
  state = {
    request: {
      description: null,
      plan_do_daterange: this.props.plan_do_daterange || [null, null],
      request_type_id: null,
      request_subtype_id: null,
      request_status_id: null,
      request_reason_id: null,
      request_first_reason_id: null,
      responsible_user_id: null,
      executor_user_id: this.props.executor_user_id || null,
      car_id: this.props.car_id || null,
      project_id: null,
      resource_id: null,
      resource_type: null,
      resource: {
        identifier: null,
        address: null,
        name: null,
        phone: null,
        uid: null,
      },
      created_at: null,
      events: [],
      can_submit: null,
      project_managers: [],
    },
    helper_users: [],
    request_subtypes: [],
    request_statuses: [],
    request_first_reasons: [],
    request_reasons: [],
    request_id: null,
    blocking_service_id: null,
    comment: null,
    loading: false,
    fieldsChanged: false,
    visible_search_agreement: false,
    visible_search_device: false,
    visible_search_project: false,
    has_description: false,
    visible_search_timeslot: false,
    visible_search_timeslot_helper: false,
    visible_agreement_card: false,
    department: null,
    activeKey: 'logs',
    errors: {},
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
    if (props.project_id) {
      this.state.request = {
        ...this.state.request,
        project_id: props.project_id,
      }
    }
    if (props.blocking_service_id) {
      this.state = {
        ...this.state,
        blocking_service_id: props.blocking_service_id,
      }
    }
  };

  request_types = [];

  users = [];
  cars = [];

  componentDidMount() {
    if (this.state.request_id) {
      this.loadData()
    };
    this.loadUsers();
    this.loadRequestTypes();
  };

  componentDidUpdate(prevProps, prevState) { }

  loadData() {
    const { request_id } = this.state
    this.setState({ loading: true });
    Rest.get(`/api/v1/requests/${request_id}.json`).then(
      (response) => {
        const { request, request_statuses, request_subtypes, helper_users } = response.data
        if (request) {
          this.setState({
            request,
            helper_users,
            request_statuses: _map(request_statuses, (status) => {
              return { label: status.name, value: status.id }
            }),
            request_subtypes: _map(request_subtypes, (subtype) => {
              return { label: subtype.name, value: subtype.id }
            }),
            has_description: request.description ? true : false
          })
        }
        if (request?.request_type_id) {
          this.loadReasons(request.request_type_id);
        }
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadUsers() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/users/help_desk_users.json`).then(
      (response) => {
        const { users } = response.data
        let new_users = [];
        let new_cars = [];
        _forEach(users, (user) => {
          user.department == 'car_park' ?
            new_cars.push({ label: user.name, value: user.id }) :
            new_users.push({ label: user.name, value: user.id })
        })
        this.cars = new_cars
        this.users = new_users
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
        if (!this.state.request_id && this.request_types.length > 0) {
          const default_type_id = this.request_types[0].value;
           this.setState({
            request: {
              ...this.state.request,
              request_type_id: default_type_id
            }
          });
          this.loadStatuses(default_type_id);
          this.loadSubtypes(default_type_id);
          this.loadReasons(default_type_id);
        }
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadReasons(request_type_id) {
    if (!request_type_id) {
      this.setState(prevState => ({
        request_first_reasons: [],
        request: { ...prevState.request, request_first_reason_id: null }
      }));
      return
    };
    const params = {
      request_type_id: request_type_id,
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_reasons.json`, { params: params }).then(
      (response) => {
        const { request_reasons, request_first_reasons } = response.data
        this.setState({
          request_first_reasons: _map(request_first_reasons, (first_reason) => ({
            label: first_reason.name,
            value: first_reason.id,
          })),
          request_reasons: _map(request_reasons, (reason) => {
            if (!reason.active) {
              return { 
                label: reason.description,
                value: reason.id,
                disabled: true,
              };
            }
            return { label: reason.description, value: reason.id }
          }),
        });
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadStatuses(request_type_id) {
    if (!request_type_id) {
      this.setState(prevState => ({
        request_statuses: [],
        request: { ...prevState.request, request_status_id: null }
      }));
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
        this.setState(prevState => ({
          request_statuses: _map(request_statuses, (status) => ({
            label: status.name,
            value: status.id,
          })),
          request: {
            ...prevState.request,
            request_status_id: default_status ? default_status.id : null
          }
        }));

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadSubtypes(request_type_id) {
    if (!request_type_id) {
      this.setState(prevState => ({
        request_subtypes: [],
        request: { ...prevState.request, request_subtype_id: null }
      }));
      return
    };
    const params = {
      request_type_id: request_type_id,
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_subtypes.json`, { params: params }).then(
      (response) => {
        const { request_subtypes } = response.data
        this.setState(prevState => ({
          request_subtypes: _map(request_subtypes, (subtype) => ({
            label: subtype.name,
            value: subtype.id,
          })),
          request: {
            ...prevState.request,
            request_subtype_id: null
          },
        }));

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleChangeComment = (e) => {
    const comment = e.target.value
    this.setState({
      comment: comment && comment.trim() ? comment : null,
      fieldsChanged: true,
    })
  };

  validateComment = () => {
    const { request, request_statuses, comment, errors } = this.state
    let not_valid = ((_find(request_statuses, { value: request.request_status_id })?.label == 'Выполнена') && !comment)
    if (not_valid) {
      this.setState({
        errors: { ...errors, comment: ['не может быть пустым если статус Выполнена'] }
      })
      return false
    }
    return true
  }

  handleCreateRequest = (object) => {
    if (!this.validateComment()) { return }
    const { request } = this.state
    const params = {
      request: {
        ...request,
        plan_started_at: request.plan_do_daterange ? request.plan_do_daterange[0] : null,
        plan_finished_at: request.plan_do_daterange ? request.plan_do_daterange[1] : null,
      },
      comment: this.state.comment,
      blocking_service_id: this.state.blocking_service_id,
      helper_users: this.state.helper_users,
    };
    this.setState({ loading: true });
    Rest.post(`/api/v1/requests.json`, params).then(
      (response) => {
        const { request, helper_users, children_errors } = response.data
        const request_id = request.id
        this.setState({
          fieldsChanged: false,
          request,
          helper_users,
          request_id: request_id,
          comment: null,
          has_description: request.description ? true : false
        })
        toast.success('Задача создана успешно');
        if (children_errors) {
          _forEach(children_errors, (children)=>{
            toast.warn(`Невозможно создать задачу для ${_find(this.users, { value: children[0] })?.label}`);
          })
        }
      }).catch((e) => {
        this.setState({ errors: e.response.data.request.errors })
        toast.error('Ошибка создания задачи');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleUpdateRequest = (object) => {
    if (!this.validateComment()) { return }
    const { request_id } = this.state
    const { request } = this.state
    const params = {
      request: {
        ...request,
        plan_started_at: request.plan_do_daterange ? request.plan_do_daterange[0] : null,
        plan_finished_at: request.plan_do_daterange ? request.plan_do_daterange[1] : null,
      },
      comment: this.state.comment,
      helper_users: this.state.helper_users,
    }
    this.setState({ loading: true, errors: {} });
    Rest.put(`/api/v1/requests/${request_id}.json`, params).then(
      (response) => {
        const { request, helper_users, children_errors, update_errors } = response.data
        this.setState({
          fieldsChanged: false,
          request,
          helper_users,
          comment: null,
          has_description: request.description ? true : false
        })
        toast.success('Изменения сохранены');
        if (children_errors) {
          _forEach(children_errors, (children) => {
            toast.warn(`Невозможно создать задачу для ${_find(this.users, { value: children[0] })?.label}`);
          })
        }
        if (update_errors) {
          _forEach(update_errors, (children) => {
            toast.warn(`Невозможно обновить задачу для ${_find(this.users, { value: children[0] })?.label}`);
          })
        }
      }).catch((e) => {
        this.setState({ errors: e.response.data.request.errors })
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleDestroyHelper = (user_id) => {
    const {request_id} = this.state
    this.setState({ loading: true });
    Rest.post(`/api/v1/requests/${request_id}/destroy_helper.json`, {user_id: user_id}).then(
      (response) => {
        const { current_helpers } = response.data
        this.setState({ helper_users: current_helpers })
        toast.success('Задача помощника удалена успешно');
      }).catch((e) => {
        toast.error('Ошибка удаления задачи помощника');
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
  handleCloseSearchProject = () => {
    this.setState({ visible_search_project: false });
  };
  handleCloseSearchTimeslot = () => {
    this.setState({ visible_search_timeslot: false });
  };
  handleCloseSearchTimeslotHelper = () => {
    this.setState({ visible_search_timeslot_helper: false });
  };

  handleChoiceAgreement = (v) => {
    this.setState({
      request: {
        ...this.state.request,
        resource_id: v.id,
        resource_type: 'LbAgreement',
        resource: {
          uid: v.uid,
          identifier: v.agreement_number,
          address: v.address,
          name: v.name,
          phone: v.phone,
        },
        errors: {
          ...this.state.errors,
          plan_started_at: []
        }
      },
      fieldsChanged: true,
    })
  };

  handleChoiceDevice = (v) => {
    this.setState({
      request: {
        ...this.state.request,
        resource_id: v.device_id,
        resource_type: 'LbDevice',
        resource: {
          identifier: v.device_name,
          address: v.address,
        },
        errors: {
          ...this.state.errors,
          plan_started_at: []
        },
      },
      fieldsChanged: true,
    })
  };

  handleChoiceProject = (v) => {
    this.setState({
      request: {
        ...this.state.request,
        project_id: v.number,
        project: v,
        errors: {
          ...this.state.errors,
          plan_started_at: []
        },
      },
      fieldsChanged: true,
    })
  };

  handleChooseTimeslots = (v) => {
    let new_request = {
      ...this.state.request,
      plan_do_daterange: [dayjs(v.time_range[0]), dayjs(v.time_range[1])],
    }

    v.department == 'car_park' ?
    new_request["car_id"] = v.user_id :
    new_request["executor_user_id"] = v.user_id

    this.setState({
      request: new_request,
      visible_search_timeslot: false,
      fieldsChanged: true,
    })
  };

  handleChooseHelper = (v) => {
    if (!(_findIndex(this.state.helper_users, v.user_id) == -1) || v.user_id == this.state.request.executor_user_id) {
      toast.error('Пользователь уже добавлен');
      return
    };

    this.setState({
      helper_users: [...this.state.helper_users, v.user_id],
      fieldsChanged: true,
      visible_search_timeslot_helper: false,
    });
  };

  render() {
    const {
      request,
      request_id,
      request_statuses,
      request_subtypes,
      comment,
      loading,
      fieldsChanged,
      errors,
      helper_users,
      visible_search_agreement,
      visible_search_device,
      visible_search_project,
      has_description,
      visible_search_timeslot,
      visible_search_timeslot_helper,
      visible_agreement_card,
      department,
      request_first_reasons,
    } = this.state;

    const { current_user } = this.props
    const close_desc = ((current_user.role == 'manager' || current_user.role == 'main_manager') && (_find(this.request_types, { value: request.request_type_id })?.label == 'Сервис'));
    const isExecutorUser = current_user.role == 'service_engineer'

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

    fields.push({
      name: ['comment'],
      value: comment,
      errors: errors ? errors['comment'] : []
    })

    return (
      <Preloader loading={loading} >
        {visible_search_agreement && (
          <UserSearchModal
            isSearchUserModalVisible={visible_search_agreement}
            handleCancelShowSearchUserModal={this.handleCloseSearchAgreement}
            handleCloseModal={this.handleCloseSearchAgreement}
            handleLocationAgreements={this.handleChoiceAgreement}
          />
        )}
        {visible_search_device && (
          <DeviceSearchModal
            isSearchDeviceModalVisible={visible_search_device}
            handleCancelShowSearchDeviceModal={this.handleCloseSearchDevice}
            handleCloseModal={this.handleCloseSearchDevice}
            handleLocationDevice={this.handleChoiceDevice}
          />
        )}
        {visible_search_project && (
          <ProjectSearchModal
            isSearchModalVisible={visible_search_project}
            handleCancelShowSearchModal={this.handleCloseSearchProject}
            handleCloseModal={this.handleCloseSearchProject}
            handleLocationProject={this.handleChoiceProject}
          />
        )}
        {visible_agreement_card &&
          <Modal
            title={
              <React.Fragment>
                <Text>Карточка договора № {request.resource.identifier}</Text>
                < InfoCircleOutlined
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    GotoAccountButton.gotoAccount(request.resource.uid, '_blank');
                  }}
                />
              </React.Fragment>
            }
            visible={visible_agreement_card}
            onCancel={() => { this.setState({ visible_agreement_card: false }) }}
            onOk={() => { this.setState({ visible_agreement_card: false }) }}
            footer={false}
            width={'95%'}
          >
            <AgreementCard agrm_id={request.resource_id} />
          </Modal>
        }
        {visible_search_timeslot &&
          <Modal
            title={`Временные слоты`}
            visible={visible_search_timeslot}
            onCancel={this.handleCloseSearchTimeslot}
            onOk={this.handleCloseSearchTimeslot}
            footer={false}
            width={'90%'}
          >
            <TimeSlotsTable
              handleTakeTimeSlots={this.handleChooseTimeslots}
              department_disabled={department ? true : false}
              department={department}
              time_range={request.plan_do_daterange}
            />
          </Modal>
        }
        {visible_search_timeslot_helper &&
          <Modal
            title={`Временные слоты`}
            visible={visible_search_timeslot_helper}
            onCancel={this.handleCloseSearchTimeslotHelper}
            onOk={this.handleCloseSearchTimeslotHelper}
            footer={false}
            width={'90%'}
          >
            <TimeSlotsTable
              handleTakeTimeSlots={this.handleChooseHelper}
              department_disabled={department ? true : false}
              department={department}
              time_range={request.plan_do_daterange}
            />
          </Modal>
        }
        <Row gutter={[24]}>
          <Col span={12}>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              fields={fields}
              onFinish={isCreate ? this.handleCreateRequest : this.handleUpdateRequest}
              onFieldsChange={(changedFields, allFields) => {
                _map(changedFields, (v) => {
                  const fieldName = _last(v.name);
                  if (fieldName === 'request_type_id') {
                    this.loadStatuses(v.value)
                    this.loadSubtypes(v.value)
                    this.loadReasons(v.value)
                  };
                  this.setState((prevState) => ({
                    request: {
                      ...prevState.request,
                      [fieldName]: v.value || null,
                    },
                    errors: {
                      ...prevState.errors,
                      [fieldName]: [],
                    },
                    fieldsChanged: true,
                  }));
                });
              }}
            >
              <Form.Item
                label="Номер:"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{request.id}</Text>
                  {!isCreate && !isExecutorUser && <a
                    href={`/api/v1/requests/${request_id}/report`}
                    target='_blank'
                    onClick={(event) => {
                      let errors = {}
                      if (fieldsChanged) { message.error('Необходимо сохранить изменения!!!') }
                      if (!request.request_subtype_id) { errors['request_subtype_id'] = ['Не может быть пустым'] };
                      if (!request.description) { errors['description'] = ['Не может быть пустым'] };
                      if (!(request.plan_do_daterange[0] && request.plan_do_daterange[1])) { errors['plan_do_daterange'] = ['Не может быть пустым'] };
                      if (!request.executor_user_id) { errors['executor_user_id'] = ['Не может быть пустым'] };
                      if (!request.resource) {
                        message.error('Необходимо добавить договор!!!');
                      }
                      else {
                        if (!request.resource.identifier) { errors['identifier'] = ['Не может быть пустым'] }
                        if (!request.resource.address) { errors['address'] = ['Не может быть пустым'] }
                        if (!request.resource.name) { errors['name'] = ['Не может быть пустым'] }
                        if (!request.resource.phone) { errors['phone'] = ['Не может быть пустым'] }
                      }
                      if ((Object.keys(errors).length > 0) || fieldsChanged || !request.resource) {
                        event.preventDefault()
                        this.setState({ errors: errors })
                        toast.error('Ошибка печати заказ наряда');
                      }
                    }}
                  >
                    Печать заказ наряда
                  </a>}
                </div>
              </Form.Item>
              <Form.Item
                name={['request', 'request_type_id']}
                label="Тип:"
              >
                {isCreate || _find(this.request_types, { value: request.request_type_id })?.label == 'Служебная' ?
                  <Select
                    options={this.request_types}
                  />
                  :
                  <Text>{_find(this.request_types, { value: request.request_type_id })?.label}</Text>
                }
              </Form.Item>
              <Form.Item
                name={['request', 'request_subtype_id']}
                label='Подтип:'
              >
                {!isExecutorUser ?
                  <Select
                    options={request_subtypes}
                  />
                  :
                  <Text>{_find(request_subtypes, { value: request.request_subtype_id })?.label}</Text>
                }
              </Form.Item>
              <Form.Item
                name={['request', 'request_status_id']}
                label="Статус:"
              >
                <Select
                  // allowClear
                  options={request_statuses}
                />
              </Form.Item>
              <Form.Item
                name={['request', 'request_first_reason_id']}
                label="Причина обращения:"
              >
                <Select
                  options={request_first_reasons}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                />
              </Form.Item>
              <Form.Item
                name={['request', 'description']}
                label="Описание:"
              >
                <TextArea
                  rows={4}
                  disabled={close_desc || !request.request_type_id}
                />
              </Form.Item>
              {request.project_managers &&
                <Form.Item
                  // name={['request', 'project_managers']}
                  label="МП:"
                >
                  <React.Fragment>
                    {_map(request.project_managers, (value) => (
                      <React.Fragment>
                        <Text>{value}</Text><br />
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                  {/* <Text>{request.project_id}</Text> */}
                </Form.Item>
              }
              <Form.Item
                name={['request', 'project_id']}
                label="Проект:"
              >
                {
                  <div>
                    {request.project_id &&
                      <Text>№ {request.project_id} - {request.project?.name}</Text>
                    }
                    <Button
                      style={{ marginLeft: '20px' }}
                      type="button"
                      onClick={() => {
                        this.setState({ visible_search_project: true });
                      }}
                    >
                      Изменить
                    </Button>
                  </div>
                }
              </Form.Item>
              {!isExecutorUser &&
                <Form.Item
                  label="Исполнитель:"
                >
                  <div style={{display: 'flex'}}>
                    <Select
                      value={request.executor_user_id}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.users}
                      onChange={(value) => {
                        this.setState({
                          request: {
                            ...request,
                            executor_user_id: value ? value : null,
                          },
                          fieldsChanged: true,
                        })
                      }}
                    />
                    {(!request.parent_id) &&
                      <>
                        <Button
                          icon={<CalendarOutlined />}
                          style={{marginLeft: '5px', width: '50px'}}
                          onClick={() => {
                            this.setState({ visible_search_timeslot: true, department: null });
                          }}
                        />
                        <Button
                          icon={<PlusOutlined />}
                          style={{ marginLeft: '5px', width: '50px' }}
                          disabled={!(request.executor_user_id && request.plan_do_daterange[0])}
                          onClick={() => {
                            this.setState({ visible_search_timeslot_helper: true, department: null });
                          }}
                        />
                      </>
                    }
                  </div>
                </Form.Item>}
              {(helper_users.length > 0) &&
                <Form.Item
                  label="Помощники:"
                >
                  <React.Fragment>
                    {_map(helper_users, (user_id)=>{
                      return (
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <Text style={{ lineHeight: '30px' }}>
                            {`${_find(this.users, { value: user_id })?.label}`}
                          </Text>
                          <Popconfirm
                            title="Удаление помощника"
                            description="Вы уверены что хотите удалить задачу помощника?"
                            onConfirm={(e) => { this.handleDestroyHelper(user_id) }}
                            onCancel={(e)=>{e.preventDefault()}}
                            okText="Да"
                            cancelText="Нет"
                          >
                            <DeleteOutlined style={{ fontSize: '22px' }} />
                          </Popconfirm>
                        </div>
                        // <>
                        //   <Text style={{ lineHeight: '30px' }}>
                        //     {`${_find(this.users, { value: user_id })?.label}`}
                        //   </Text>
                        //   <br/>
                        // </>
                      )
                    })}
                  </React.Fragment>
                </Form.Item>
              }
              {!isExecutorUser &&
                <Form.Item
                  label="Автомобиль:"
                >
                  <div style={{display: 'flex'}}>
                    <Select
                      value={request.car_id}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.cars}
                      onChange={(value)=>{
                        this.setState({
                          request: {
                            ...request,
                            car_id: value ? value : null,
                          },
                          fieldsChanged: true,
                        })
                      }}
                    />
                    <Button
                      icon={<CalendarOutlined />}
                      style={{ marginLeft: '5px', width: '50px' }}
                      onClick={() => {
                        this.setState({ visible_search_timeslot: true, department: 'car_park' });
                      }}
                    />
                  </div>
                </Form.Item>
              }
              <Form.Item
                label='Время выполнения:'
              >
                {!isExecutorUser ?
                  <RangePicker
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf('day');
                    }}
                    format={'DD.MM.YYYY HH:mm'}
                    disabledTime={(selected_time, type) => {
                      if (type === 'start') {
                        return {
                          disabledHours: () => [..._range(21, 24), ..._range(0, 9)],
                          disabledMinutes: () => _difference(_range(0, 60), [0, 15, 30, 45]),
                        }
                      }
                      const selected_hour = selected_time ? selected_time.hour() : 9
                      const excluded_minutes_range = selected_hour == 21 ? _range(1, 60) : _difference(_range(0, 60), [0, 15, 30, 45])
                      return {
                        disabledHours: () => [..._range(22, 24), ..._range(0, 9)],
                        disabledMinutes: () => excluded_minutes_range,
                      }
                    }}
                    showTime={{
                      hideDisabledOptions: true,
                      format: 'HH:mm',
                      defaultValue: [dayjs('09:00', 'HH:mm'), dayjs('10:00', 'HH:mm')],
                    }}
                    value={request.plan_do_daterange[0] ? [dayjs(request.plan_do_daterange[0]), dayjs(request.plan_do_daterange[1])] : [null, null]}
                    onChange={(dates, dateStrings)=>{
                      this.setState({
                        request: {
                          ...request,
                          plan_do_daterange: dates ? dates : [null, null]
                        },
                        fieldsChanged: true,
                      })
                    }}
                  />
                  :
                  <React.Fragment>
                    <Text>c {request.plan_do_daterange[0] ? format(_parseISO(request.plan_do_daterange[0]), 'dd.MM.yyyy HH:mm') : null} - </Text>
                    <Text>до {request.plan_do_daterange[1] ? format(_parseISO(request.plan_do_daterange[1]), 'dd.MM.yyyy HH:mm') : null}</Text>
                  </React.Fragment>
                }
              </Form.Item>
              {!isExecutorUser &&
                <Form.Item
                  name={['request', 'responsible_user_id']}
                  label="Автор:"
                >
                  {isCreate && (current_user.role == 'manager' || current_user.role == 'main_manager') ?
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      options={this.users}
                    />
                    :
                    <Text>{_find(this.users, { value: request.responsible_user_id })?.label}</Text>
                  }
                </Form.Item>}
              {!isExecutorUser &&
                <Form.Item
                  label="Задача создана:"
                >
                  <React.Fragment>
                    <Text>{request.created_at ? format(_parseISO(request.created_at), 'dd.MM.yyyy HH:mm') : null}</Text>
                  </React.Fragment>
                </Form.Item>}
              <Form.Item
                label={resource_type_ru}
                name={['request', 'resource', 'identifier']}
              >
                <div>
                  {request.resource ?
                    <React.Fragment>
                      <Text>{request.resource.identifier}</Text>
                      {request.resource_type == 'LbAgreement' &&
                        < InfoCircleOutlined
                          style={{ marginLeft: '10px' }}
                          onClick={() => {
                            this.setState({ visible_agreement_card: true });
                          }}
                        />
                      }
                    </React.Fragment>
                    :
                    'отсутствует'}
                  {(!request.resource || isCreate) &&
                    !isExecutorUser &&
                    <React.Fragment>
                      <Button
                        style={{ marginLeft: '20px' }}
                        type="button"
                        onClick={() => {
                          this.setState({ visible_search_agreement: true });
                        }}
                      >
                        Договор
                      </Button>
                      <Button
                        style={{ marginLeft: '20px' }}
                        type="button"
                        onClick={() => {
                          this.setState({ visible_search_device: true });
                        }}
                      >
                        Оборудование
                      </Button>
                    </React.Fragment>
                  }
                </div>
              </Form.Item>
              {request.resource &&
                <React.Fragment>
                  <Form.Item
                    label="Адрес:"
                    name={['request', 'resource', 'address']}
                  >
                    <Text>{request.resource.address}</Text>
                  </Form.Item>
                  {request.resource_type == "LbAgreement" &&
                    <Form.Item
                      label="ФИО абонента:"
                      name={['request', 'resource', 'name']}
                    >
                      <Text>{request.resource.name}</Text>
                    </Form.Item>
                  }
                  {request.resource_type == "LbAgreement" &&
                    <Form.Item
                      label="Телефон:"
                      name={['request', 'resource', 'phone']}
                    >
                      <Text>{request.resource.phone}</Text>
                    </Form.Item>
                  }
                </React.Fragment>
              }
              <Form.Item
                name={['request', 'request_reason_id']}
                label='Причина закрытия:'
              >
                <Select
                  // allowClear
                  options={this.state.request_reasons}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                />
              </Form.Item>
              <Form.Item
                label='Комментарий:'
              >
                <TextArea
                  rows={4}
                  onChange={this.handleChangeComment}
                  value={comment}
                />
              </Form.Item>
              <Form.Item
                name={['request', 'can_submit']}
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
              >
                <Button
                  style={{ width: '100%' }}
                  type='primary'
                  htmlType="submit"
                  disabled={!fieldsChanged}
                >
                  {isCreate ? 'Создать' : 'Сохранить'}
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={12}>
            <Tabs
              defaultActiveKey='logs'
              onChange={(activeKey) => {
                this.setState({ activeKey: activeKey })
              }}
            >
              <TabPane key='logs' tab='События'>
                {(request.events.length > 0) ?
                  <Events events={request.events} />
                  :
                  <Empty style={{ marginBottom: '30px' }} />}
              </TabPane>
              <TabPane key='documents' tab='Файлы'>
                <FilesUploader
                  related_obj_type='Request'
                  related_obj_id={request_id}
                />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Preloader >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    current_user: state.user,
  };
};
RequestCard.contextType = AbilityContext;

export default connect(
  mapStateToProps,
  null,
)(RequestCard)
