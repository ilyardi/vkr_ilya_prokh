import React, { useState, useEffect, useContext } from 'react';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  Button,
  message,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Steps,
  Checkbox,
  Divider,
  Collapse,
  ConfigProvider,
  FloatButton,
  Space,
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ClearOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import {
  CalendarPicker,
  Checkbox as MCheckbox,
  DatePicker as MDatePicker,
} from 'antd-mobile'
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
  range as _range,
  difference as _difference,
} from 'lodash';
import { toast, useToastContainer } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

import MobileFilesUploader from 'components/mobile_files_uploader';
import History from './components/history';

const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MobileRequestCard = (props) => {
  const { match, classes } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const toastify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const [request, setRequest] = useState({
    id: null,
    description: null,
    plan_started_at: null,
    plan_finished_at: null,
    request_type_id: null,
    request_subtype_id: null,
    request_status_id: null,
    request_reason_id: null,
    request_first_reason_id: null,
    responsible_user_id: null,
    executor_user_id: props.executor_user_id || null,
    car_id: props.car_id || null,
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
  });
  const [currentRequest, setCurrentRequest] = useState({});
  const [requestTypes, setRequestTypes] = useState([]);
  const [requestSubtypes, setRequestSubtypes] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [requestFirstReasons, setRequestFirstReasons] = useState([]);
  const [requestReasons, setRequestReasons] = useState([]);
  const [requestId, setRequestId] = useState(match.params.request_id || null);
  const [blockingServiceId, setBlockingServiceId] = useState(null);
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleSearchAgreement, setVisibleSearchAgreement] = useState(false);
  const [visibleSearchDevice, setVisibleSearchDevice] = useState(false);
  const [visibleSearchProject, setVisibleSearchProject] = useState(false);
  const [visibleSearchTimeslot, setVisibleSearchTimeslot] = useState(false);
  const [visibleAgreementCard, setVisibleAgreementCard] = useState(false);
  const [visiblePlanDate, setVisiblePlanDate] = useState(false);
  const [visiblePlanStarted, setVisiblePlanStarted] = useState(false);
  const [visiblePlanFinished, setVisiblePlanFinished] = useState(false);
  const [visibleHistory, setVisibleHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [errors, setErrors] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [projects, setProjects] = useState([])
  const [resources, setResources] = useState([])

  const context = useContext(AbilityContext)
  const current_user = useSelector(state => state.user)

  const getRequest = () => {
    if (!requestId) { return }
    setLoading(true)
    Rest.get(`/api/v1/requests/${requestId}`).then(
      (response) => {
        const { request } = response.data;
        setRequest(request);
        setCurrentRequest(request);
        if (request.resource_id) {
          setResources([{ label: `${request.resource_type == 'LbAgreement' ? "📃" : "🖥️"} - ${request.resource.identifier}`, value: request.resource_id, resource_type: request.resource_type }])
        };
        if (request.project_id) {
          setProjects([{ label: request.project.name, value: request.project.id }])
        };
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createRequest = (actionAfterSave = 'noting') => {
    setErrors({})
    const params = {
      request: request,
      comment: comment,
    }
    setLoading(true);
    Rest.post(`/api/v1/requests.json`, params).then(
      (response) => {
        const { request } = response.data;
        setRequest(request);
        setCurrentRequest(request);
        setRequestId(request.id)
        setComment(null);
        toastify('success', 'Задача создана')
        if (actionAfterSave == 'close') {
          history.back()
        }
      }).catch((e) => {
        setErrors(e.response.data.request.errors)
        toastify('error', 'Ошибка создания')
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateRequest = (actionAfterSave='noting') => {
    setErrors({})
    const params = {
      request: request,
      comment: comment
    }
    setLoading(true);
    Rest.put(`/api/v1/requests/${requestId}`, params).then(
      (response) => {
        const { request } = response.data;
        setRequest(request);
        setCurrentRequest(request);
        setComment(null);
        toastify('success', 'Изменения сохранены')
        if (actionAfterSave == 'close'){
          history.back()
        }
      }).catch((e) => {
        setErrors(e.response.data.request.errors)
        toastify('error', 'Ошибка сохранения')
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUsers = () => {
    setLoading(true);
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
        setUsers(new_users);
        setCars(new_cars);
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getRequestTypes = () => {
    setLoading(true);
    Rest.get(`/api/v1/request_types.json`).then(
      (response) => {
        const { request_types } = response.data
        setRequestTypes(_map(request_types, (type) => {
          return { label: type.name, value: type.id }
        }));
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getSubtypes = () => {
    const params = {
      request_type_id: request.request_type_id,
    }
    setLoading(true);
    Rest.get(`/api/v1/request_subtypes.json`, { params: params }).then(
      (response) => {
        const { request_subtypes } = response.data
        setRequestSubtypes(_map(request_subtypes, (subtype) => {
          return { label: subtype.name, value: subtype.id }
        }));
        // setRequest({ ...request, request_subtype_id: null });
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getReasons = () => {
    const params = {
      request_type_id: request.request_type_id,
    }
    setLoading(true);
    Rest.get(`/api/v1/request_reasons.json`, { params: params }).then(
      (response) => {
        const { request_reasons, request_first_reasons } = response.data
        setRequestReasons(_map(request_reasons, (reason) => {
          if (!reason.active) {
            return { label: reason.description, value: reason.id, disabled: true }
          }
          return { label: reason.description, value: reason.id }
        }));
        setRequestFirstReasons(_map(request_first_reasons, (first_reason) => {
          return { label: first_reason.name, value: first_reason.id }
        }));
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getStatuses = () => {
    const params = {
      request_type_id: request.request_type_id,
    }
    setLoading(true);
    Rest.get(`/api/v1/request_statuses.json`, { params: params }).then(
      (response) => {
        const { request_statuses } = response.data
        const default_status = _find(request_statuses, { 'priority': 1 })
        setRequestStatuses(_map(request_statuses, (status) => {
          return { label: status.name, value: status.id }
        }));
        // setRequest({ ...request, request_status_id: default_status ? default_status.id : null });
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getProjects = (context) => {
    const params = {
      context: context
    }
    Rest.get('/api/v1/projects/context_search.json', { params: params }).then((response) => {
      const { projects } = response.data;
      setProjects(_map(projects, (project) => {
        return { label: project.name, value: project.id }
      }))
    });
  };

  const getResources = (context) => {
    const params = {
      context: context
    }
    Rest.get('/api/v1/requests/resource_search.json', { params: params }).then((response) => {
      const { resources } = response.data;
      console.log(resources)
      setResources(_map(resources, (resource) => {
        return { label: `${resource.resource_type == 'LbAgreement' ? "📃" : "🖥️"} - ${resource.name}`, value: resource.id, resource_type: resource.resource_type }
      }))
    });
  };

  const save_and_close = (handleSaveReq) => {
    handleSaveReq('close');
  };
  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  };

  const handleChangeText = (e) => {
    const text = e.target.value?.trim() ? e.target.value : null
    setRequest({ ...request, [e.target.name]: text })
    setErrors({ ...errors, [e.target.name]: null })
  };

  const handleChangeComment = (e) => {
    const comment = e.target.value?.trim() ? e.target.value : null
    setComment(comment);
  };

  const handleChangeField = (value, field_name) => {
    let new_field = {
      ...request,
      [field_name]: value
    }
    if (field_name == 'request_type_id') {
      new_field['request_status_id'] = null
      new_field['request_subtype_id'] = null
      new_field['request_first_reason_id'] = null
    }
    setRequest(new_field)
    setErrors({
      ...errors,
      [field_name]: null
    })
  };

  useEffect(() => {
    getRequestTypes();
    getUsers();
    getRequest();
  }, []);

  useEffect(() => {
    if (request.request_type_id) {
      getReasons();
      getSubtypes();
      getStatuses();
    };
  }, [request.request_type_id]);

  useEffect(() => {
    setIsReadOnly(request.id ? true : false)
  }, [request.id]);

  const size = 'large'

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#8f00ff82',
            itemSelectedColor: '#FFFFFF',
            itemColor: '#FFFFFF',
          },
          Form: {
            labelHeight: '18px',
            lineHeight: '18px',
            labelFontSize: '12px',
            verticalLabelPadding: '0'
          },
          Input: {
            borderRadiusLG: '25px',
            paddingLG: '40px',
          },
          InputNumber: {
            borderRadiusLG: '25px',
            paddingLG: '40px',
          },
          Select: {
            borderRadiusLG: '25px',
            paddingLeft: '20px',
          },
          Collapse: {
            borderRadiusLG: '25px',
          },
          DatePicker: {
            borderRadiusLG: '25px',
          },
          Table: {
            cellPaddingBlock: '3px',
          },
        },
      }}
    >
      {contextHolder}
      <History
        visible={visibleHistory}
        closeHistory={()=>{setVisibleHistory(false)}}
        history={request.events}
      />
      <div className={classes.buttonBack} onClick={() => { history.back() }}>
        <ArrowLeftOutlined />
      </div>
      <div className={classes.requestId}>
        {request.id ? `№ ${request.id}` : ''}
      </div>
      <div className={classes.main}>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Тип</Text>}
            help={errors?.request_type_id && errors?.request_type_id.join(", ")}
            validateStatus={errors?.request_type_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.request_type_id}
              options={requestTypes}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'request_type_id'); }}
              disabled={isReadOnly}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Подтип</Text>}
            help={errors?.request_subtype_id && errors?.request_subtype_id.join(", ")}
            validateStatus={errors?.request_subtype_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.request_subtype_id}
              options={requestSubtypes}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'request_subtype_id'); }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Статус</Text>}
            help={errors?.request_status_id && errors?.request_status_id.join(", ")}
            validateStatus={errors?.request_status_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.request_status_id}
              options={requestStatuses}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'request_status_id'); }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Причина обращения</Text>}
            help={errors?.request_first_reason_id && errors?.request_first_reason_id.join(", ")}
            validateStatus={errors?.request_first_reason_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.request_first_reason_id}
              options={requestFirstReasons}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'request_first_reason_id'); }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Описание</Text>}
            help={errors?.description && errors?.description.join(", ")}
            validateStatus={errors?.description && "error"}
          >
            <TextArea
              size={size}
              rows={4}
              name="description"
              onChange={handleChangeText}
              value={request.description}
              readOnly={isReadOnly}
            />
          </Form.Item>
          {request.project_managers &&
            <Form.Item
              label={<Text className={classes.menuItemLabel}>МП:</Text>}
            >
              <div style={{display: 'flex', flexDirection: 'column', paddingLeft: '16px'}}>
                {_map(request.project_managers, (value) => (
                  <Text>{value}</Text>
                ))}
              </div>
            </Form.Item>
          }
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Проект</Text>}
            help={errors?.project_id && errors?.project_id.join(", ")}
            validateStatus={errors?.project_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.project_id}
              options={projects}
              placeholder="Поиск..."
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => true}
              onChange={(value) => { handleChangeField(value, 'project_id'); }}
              onSearch={(value) => { getProjects(value) }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Исполнитель</Text>}
            help={errors?.executor_user_id && errors?.executor_user_id.join(", ")}
            validateStatus={errors?.executor_user_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.executor_user_id}
              options={users}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'executor_user_id'); }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Автомобиль</Text>}
            help={errors?.car_id && errors?.car_id.join(", ")}
            validateStatus={errors?.car_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.car_id}
              options={cars}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'car_id'); }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Начало</Text>}
            style={{ marginBottom: '0px' }}
          >
            <div
              style={{ display: 'flex' }}
              onClick={() => { setVisiblePlanStarted(true) }}
            >
              <Input
                size={size}
                name="plan_started_at"
                value={request.plan_started_at}
                readOnly
                suffix={
                  <ClearOutlined onClick={(e) => {
                    e.stopPropagation()
                    setRequest({ ...request, plan_started_at: null })
                  }} />
                }
              />
              <MDatePicker
                visible={visiblePlanStarted}
                onClose={() => {
                  setVisiblePlanStarted(false)
                }}
                precision='minute'
                onConfirm={val => {
                  console.log(val)
                  setRequest({ ...request, plan_started_at: format(val, 'dd.MM.yyyy HH:mm') })
                }}
              />
            </div>
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Завершение</Text>}
            help={errors?.plan_do_daterange && errors?.plan_do_daterange.join(", ")}
            validateStatus={errors?.plan_do_daterange && "error"}
          >
            <div
              style={{ display: 'flex' }}
              onClick={() => { setVisiblePlanFinished(true) }}
            >
              <Input
                size={size}
                name="plan_finished_at"
                value={request.plan_finished_at}
                readOnly
                suffix={
                  <ClearOutlined onClick={(e) => {
                    e.stopPropagation()
                    setRequest({ ...request, plan_finished_at: null })
                  }} />
                }
              />
              <MDatePicker
                visible={visiblePlanFinished}
                onClose={() => {
                  setVisiblePlanFinished(false)
                }}
                precision='minute'
                onConfirm={val => {
                  setRequest({ ...request, plan_finished_at: format(val, 'dd.MM.yyyy HH:mm') })
                }}
              />
            </div>
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Причина закрытия</Text>}
            help={errors?.request_reason_id && errors?.request_reason_id.join(", ")}
            validateStatus={errors?.request_reason_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={request.request_reason_id}
              options={requestReasons}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { handleChangeField(value, 'request_reason_id'); }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Договор / Оборудование</Text>}
            help={errors?.resource_id && errors?.resource_id.join(", ")}
            validateStatus={errors?.resource_id && "error"}
          >
            <React.Fragment>
              <Select
                size={size}
                allowClear
                value={request.resource_id}
                options={resources}
                placeholder="№ договора / назв. оборуд."
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => true}
                onChange={(value, option) => {
                  setRequest({
                    ...request,
                    resource_id: option['value'],
                    resource_type: option['resource_type']
                  })
                }}
                onSearch={(value) => { getResources(value); }}
              />
              {request.resource?.identifier &&
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px' }}>
                  <Text>{request.resource?.address}</Text>
                  {request.resource_type == "LbAgreement" &&
                    <Text>{request.resource?.name}</Text>
                  }
                  {request.resource_type == "LbAgreement" &&
                    <Text>{request.resource?.phone}</Text>
                  }
                </div>
              }
            </React.Fragment>
          </Form.Item>
          {request.created_at &&
            <Form.Item
              style={{ marginBottom: '0px' }}
              label={<Text className={classes.menuItemLabel}>Дополнительная информация</Text>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px' }}>
                {request.responsible_user_id &&
                  <Text>Автор: {_find(users, { value: request.responsible_user_id })?.label}</Text>
                }
                {request.created_at &&
                  <Text>Создана: {format(_parseISO(request.created_at), 'dd.MM.yyyy HH:mm')}</Text>
                }
              </div>
            </Form.Item>
          }
          <Form.Item>
            <TextArea
              placeholder='Оставьте комментарий'
              size={size}
              rows={4}
              onChange={handleChangeComment}
              value={comment}
            />
          </Form.Item>
        </Form>
        <MobileFilesUploader
          related_obj_type='Request'
          related_obj_id={requestId}
          // onlyFiles={true}
        />
      </div>
      <div className={classes.actions}>
        <Button
          onClick={request?.id ? updateRequest : createRequest}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={_isEqual(request, currentRequest) && !comment}
        >
          <div className={classes.actionBlock}>
            <SaveOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Сохранить</Text>
          </div>
        </Button>
        <Button
          onClick={(e)=>{setVisibleHistory(!visibleHistory)}}
          style={{ margin: '0', padding: '0', border: 'none', height: 'inherit', background: 'none' }}
          // disabled={_isEqual(request, currentRequest) && !comment}
        >
          <div className={classes.actionBlock}>
            <FieldTimeOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>История</Text>
          </div>
        </Button>
      </div>
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  main: {
    height: '100%',
    width: '100%',
    overflowY: 'scroll',
    overflowX: 'hidden',
    padding: '15px'
  },
  actions: {
    height: '8vh',
    width: '100%',
    padding: '5px 10px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 2
  },
  actionBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: '30px'
  },
  actionLable: {
    fontSize: '8px'
  },
  repeatableBlock: {
    border: '1px solid black',
    padding: '15px',
    margin: '5px 0 10px 0',
    borderRadius: '25px',
    borderColor: '#FFFFFF',
  },
  menuItemLabel: {
    marginLeft: '15px',
    fontStyle: 'italic'
  },
  buttonBack: {
    width: '80px',
    height: '8vh',
    display: 'flex',
    justifyContent: 'space-evenly',
    position: 'absolute',
    top: '0px',
    left: '0px',
    fontSize: '30px',
    color: '#59059B',
    zIndex: '2',
  },
  requestId: {
    position: 'absolute',
    top: '18px',
    color: '#59059B',
    width: '100%',
    textAlign: 'center',
    fontSize: '18px',
    lineHeight:'35px'
  },
});

const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(MobileRequestCard));
