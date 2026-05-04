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
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  last as _last,
  includes as _includes,
  isEqual as _isEqual,
  range as _range,
  difference as _difference,
} from 'lodash';
import dayjs from 'dayjs';
import { parseISO as _parseISO, format } from 'date-fns';
import Preloader from 'components/preloader';
import { toast } from 'react-toastify';

import RequestsList from './components/requests_list'
import EventList from './components/events_list';
import FilesUploader from 'components/files_uploader';

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

class ProjectCard extends React.Component {
  state = {
    project: {
      id: null,
      number: null,
      name: null,
      description: null,
      project_type_id: null,
      responsible_user_id: null,
      project_managers_ids: null,
      plan_started_at: null,
      plan_finished_at: null,
      created_at: null,
      requests: [],
      events: [],
      status: null,
    },
    requests: [],
    project_types: [],
    project_id: null,
    fieldsChanged: false,
    loading: false,
    errors: {},
    activeKey: 'tasks',
    data_relevance: null,
  };

  constructor(props) {
    super(props);
    if (props.project_id) {
      this.state = {
        ...this.state,
        project_id: props.project_id
      };
    }
  };

  project_types = [];
  statuses = [
    { label: "В работе" ,value: "at_work" },
    { label: "Архив" ,value: "archive" },
    { label: "Отменена" ,value: "decline" },
  ];
  users = [];

  componentDidMount() {
    this.loadUsers();
    this.loadProjectTypes();
    if (this.state.project_id) {
      this.loadData()
    };
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.data_relevance !== this.state.data_relevance) {
      this.loadData()
    }
  }

  loadData() {
    const { project_id } = this.state
    this.setState({ loading: true });
    Rest.get(`/api/v1/projects/${project_id}.json`).then(
      (response) => {
        const { project } = response.data
        this.setState({ project })
      }).catch((e) => {
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

  loadProjectTypes() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/project_types.json`).then(
      (response) => {
        const { project_types } = response.data
        this.project_types = _map(project_types, (type) => {
          return { label: type.name, value: type.id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleCreateProject = (object) => {
    const { project } = this.state
    this.setState({ loading: true });
    Rest.post(`/api/v1/projects.json`, { project: project }).then(
      (response) => {
        const { project } = response.data
        const project_id = project.id
        this.setState({
          fieldsChanged: false,
          project_id,
          project,
        })
        toast.success('Задача создана успешно');
      }).catch((e) => {
        this.setState({ errors: e.response.data.project.errors })
        toast.error('Ошибка создания задачи');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  handleUpdateProject = (object) => {
    const { project_id } = this.state
    const { project } = this.state
    this.setState({ loading: true });
    Rest.put(`/api/v1/projects/${project_id}.json`, { project: project }).then(
      (response) => {
        const { project } = response.data
        this.setState({
          fieldsChanged: false,
          project,
        })
        toast.success('Изменения сохранены');
      }).catch((e) => {
        this.setState({ errors: e.response.data.project.errors })
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleCloseModal = () => {
    this.setState({ data_relevance: new Date() })
  }

  render() {
    const {
      project,
      project_id,
      loading,
      errors,
      fieldsChanged,
      activeKey,
      visibleRequestCard
    } = this.state;

    const { current_user } = this.props

    const isCreate = project_id ? false : true;

    let fields = []
    _forEach(project, (value, key) => {
      fields = [...fields, {
        name: ['project', key],
        value: value,
        errors: errors ? errors[key] : [],
      }]
    });

    return (
      <Preloader loading={loading}>
        <Row gutter={40}>
          <Col span={12} >
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              fields={fields}
              onFinish={isCreate ? this.handleCreateProject : this.handleUpdateProject}
              onFieldsChange={(changedFields, allFields) => {
                _map(changedFields, (v) => {
                  this.setState((prevState) => {
                    prevState.project[_last(v.name)] = v.value || null;
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
                <Text>{project.number}</Text>
              </Form.Item>
              <Form.Item
                name={['project', 'name']}
                label="Название:"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={['project', 'project_type_id']}
                label="Тип:"
              >
                {isCreate ?
                  <Select
                    options={this.project_types}
                  />
                  :
                  <Text>{_find(this.project_types, { value: project.project_type_id })?.label}</Text>
                }
              </Form.Item>
              <Form.Item
                name={['project', 'description']}
                label="Описание:"
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name={['project', 'project_managers_ids']}
                label="МП:"
              >
                <Select
                  mode='multiple'
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                  options={this.users}
                />
              </Form.Item>
              <Form.Item
                name={['project', 'responsible_user_id']}
                label="Автор:"
                initialValue={_find(this.users, { value: current_user.id })?.label}
              >
                <Text>{_find(this.users, { value: project.responsible_user_id })?.label}</Text>
              </Form.Item>
              <Form.Item
                label='Плановые даты:'
              >
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'nowrap' }}>
                  <DatePicker
                    style={{ width: '100%' }}
                    format={'DD.MM.YYYY HH:mm'}
                    placeholder={'начало'}
                    showTime={{
                      hideDisabledOptions: true,
                      format: 'HH:mm',
                      defaultValue: dayjs('09:00', 'HH:mm'),
                    }}
                    disabledDate={(current) => {
                      return (current > dayjs(project.plan_finished_at))
                    }}
                    value={project.plan_started_at ? dayjs(project.plan_started_at) : null}
                    onChange={(date, dateString) => {
                      this.setState({
                        project: {
                          ...project,
                          plan_started_at: date
                        },
                        fieldsChanged: true
                      })
                    }}
                  />
                  <DatePicker
                    style={{ width: '100%' }}
                    format={'DD.MM.YYYY HH:mm'}
                    placeholder={'завершение'}
                    showTime={{
                      hideDisabledOptions: true,
                      format: 'HH:mm',
                      defaultValue: dayjs('09:00', 'HH:mm'),
                    }}
                    disabledDate={(current) => {
                      return (current < dayjs(project.plan_started_at))
                    }}
                    value={project.plan_finished_at ? dayjs(project.plan_finished_at) : null}
                    onChange={(date, dateString) => {
                      this.setState({
                        project: {
                          ...project,
                          plan_finished_at: date
                        },
                        fieldsChanged: true
                      })
                    }}
                  />
                </div>
              </Form.Item>
              <Form.Item
                label="Статус"
                name={['project', 'status']}
              >
                <Select
                  allowClear
                  showSearch
                  options={this.statuses}
                  optionFilterProp="children"
                  filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                />
              </Form.Item>
              <Form.Item
                label="Дата создания:"
              >
                <Text>{project.created_at ? format(_parseISO(project.created_at), 'dd.MM.yyyy HH:mm') : null}</Text>
              </Form.Item>
              <Form.Item
                wrapperCol={{ offset: 8, span: 16 }}
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
              defaultActiveKey='tasks'
              onChange={(activeKey) => {
                this.setState({ activeKey: activeKey })
              }}
            >
              <TabPane key='tasks' tab='Задачи'>
                {project.id &&
                  <RequestsList
                    project_id={project.id}
                  />
                }
              </TabPane>
              <TabPane key='documents' tab='Документы'>
                <FilesUploader
                  related_obj_type='Project'
                  related_obj_id={project_id}
                />
              </TabPane>
              <TabPane key='history' tab='История'>
                {(project.events.length > 0) ?
                  <EventList events={project.events} />
                  :
                  <Empty style={{ marginBottom: '30px' }} />}
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

export default connect(
  mapStateToProps,
  null,
)(ProjectCard)
