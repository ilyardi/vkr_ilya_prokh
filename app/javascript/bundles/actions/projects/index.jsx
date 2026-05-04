import React, { Component } from 'react';
import Rest from 'tools/rest';
import {
  debounce,
  isEqual as _isEqual,
  replace as _replace,
  map as _map,
  forEach as _forEach,
  find as _find,
  includes as _includes,
} from 'lodash';
import dayjs from 'dayjs';
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
  DatePicker,
  Typography,
  Button,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { InfoCircleOutlined } from '@ant-design/icons';
import { parseISO as _parseISO, format } from 'date-fns';

import QueryMixin from 'components/query_mixin';
import Preloader from 'components/preloader';
import ProjectCard from 'components/project_card';
import SearchTemplatesPanel from 'components/search_templates_panel'

const { Text } = Typography;
const { RangePicker } = DatePicker;

class Projects extends QueryMixin {
  state = {
    projects: [
      {
        number: 1,
        name: 'Проект',
        description: "",
        project_type: null,
        project_status: null,
        responsible_user: null,
        created_at: '2023-01-01',
        plan_started_at: '2023-01-01',
        plan_finished_at: '2023-01-01',
      }
    ],
    meta: {
      page: 1,
      per: 10,
      total: 0,
    },
    search: {
      number: this.getQuery('number'),
      name: this.getQuery('name'),
      project_type_id: this.getQuery('request_type_id'),
      responsible_user_id: this.getQuery('responsible_user_id'),
      created_at: [this.getQuery('created_at_from'), this.getQuery('created_at_to')],
      doned_at: [this.getQuery('doned_at_from'), this.getQuery('doned_at_to')],
      archive: this.getQuery('archive'),
      decline: this.getQuery('decline'),
      description: this.getQuery('description'),
      // statuses: this.getQuery('statuses') || ['at_work'],
      // street_id: this.getQuery('street_id'),
      // building_id: this.getQuery('building_id'),
      // entrance_id: this.getQuery('entrance_id'),
      // flat_id: this.getQuery('flat_id'),
    },
    loading: false,
    useDebounce: false,
    visibleCard: false,
    project: {},
    data_relevance: null,
  };

  project_types = []
  users = []

  loadProjects = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      filter: this.state.search,
    };

    this.handleSetQuery(this.state.meta)

    this.setState({ loading: true, useDebounce: false });

    Rest.get('/api/v1/projects.json', { params: params }).then(
      (response) => {
        const { projects, meta } = response.data;
        this.setState({
          projects,
          meta,
          loading: false,
        });
      },
    );
  };

  componentDidMount() {
    this.loadProjectTypes();
    this.loadUsers();
    this.loadProjects()
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
        this.loadProjects();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
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

  handleChangeText = (e) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, [e.target.name]: e.target.value },
    });
  };


  handleDescriptionChange = (e) => {
    this.setState({
        useDebounce: true,
        meta: { ...this.state.meta, page: 1 },
        search: {...this.state.search, description: e.target.value },
      });
    };


  handleChangeType = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        project_type_id: value,
      },
    });
  }

  handleChangeResponsibleUser = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, responsible_user_id: value },
    })
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
      }
    });
  };

  handleCloseModal = () => {
    this.setState({
      data_relevance: new Date(),
      visibleCard: false,
    })
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
      projects,
      search,
      loading,
      visibleCard,
      project,
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
      { title: '№ проекта', dataIndex: 'number', key: 'number', width: '7%' },
      { title: 'Название', dataIndex: 'name', key: 'name', width: '10%', },
      {
        title: 'Описание',
        dataIndex: 'description',
        key: 'description',
        render: (value) => {
          return (value ? value.slice(0, 110) + '...' : null)
        }
      },
      {
        title: 'Тип проекта',
        dataIndex: 'project_type',
        key: 'project_type',
        width: '10%',
        render: (value, record) => {
          return _find(this.project_types, { value: record.project_type_id })?.label
        }
      },
      {
        title: 'Автор',
        dataIndex: 'responsible_user',
        key: 'responsible_user',
        width: '20%',
        render: (value, record) => {
          return _find(this.users, { value: record.responsible_user_id })?.label
        }
      },
      {
        title: 'Дата начала',
        dataIndex: 'plan_started_at',
        key: 'plan_started_at',
        width: '10%',
        render: (value) => {
          return (value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null)
        }
      },
      {
        title: 'Дата конца',
        dataIndex: 'plan_finished_at',
        key: 'plan_finished_at',
        width: '10%',
        render: (value) => {
          return (value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null)
        }
      },
      {
        title: 'Создан',
        dataIndex: 'created_at',
        key: 'created_at',
        width: '10%',
        render: (value) => {
          return (value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null)
        }
      },
    ];

    return (
      <React.Fragment>
        <FloatButton.BackTop />
        <PageHeader title="Проекты"></PageHeader>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Row gutter={5}>
            <Col span={6}>
              <Form.Item
                label={'Номер:'}
                style={{marginBottom: '5px'}}
              >
                <Input
                  name="number"
                  value={search.number}
                  placeholder="Номер проекта"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              <Form.Item
                label={'Название:'}
                style={{marginBottom: '5px'}}
              >
                <Input
                  name="name"
                  value={search.name}
                  placeholder="Название"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
              <Form.Item
                label={'Описание:'}
                style={{marginBottom: '5px'}}
              >
                <Input
                  name="description"
                  value={search.description}
                  placeholder="Описание"
                  onChange={this.handleDescriptionChange}
                />
              </Form.Item>


            </Col>
            <Col span={6}>
              <Form.Item
                label={'Тип:'}
                style={{marginBottom: '5px'}}
              >
                <Select
                  allowClear
                  showSearch
                  value={search.project_type_id == '' ? undefined : search.project_type_id}
                  placeholder='Тип проекта'
                  optionFilterProp="children"
                  filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                  options={this.project_types}
                  onChange={this.handleChangeType}
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
            </Col>
            <Col span={6}>
              <Form.Item
                label={'Период:'}
                style={{marginBottom: '5px'}}
              >
                <RangePicker
                  value={search.doned_at[0] && search.doned_at[1] ?
                    _map(search.doned_at, (item) => { return dayjs(item, 'DD.MM.YYYY') })
                    :
                    null
                  }
                  placeholder={['с', 'по']}
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
              <Form.Item
                label={'Создана:'}
                style={{marginBottom: '5px'}}
              >
                <RangePicker
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
            </Col>
            <Col span={3}>
              <Form.Item
                label='Архив:'
                labelCol={{ span: 16 }}
                style={{marginBottom: '5px'}}
              >
                <Checkbox
                  checked={search.archive == true ? true : false}
                  onChange={(e) => {
                    this.setState({
                      search: {
                        ...search,
                        archive: e.target.checked ? true : null
                      }
                    })
                  }}
                />
              </Form.Item>
              <Form.Item
                label='Отмененные:'
                labelCol={{ span: 16 }}
                style={{marginBottom: '5px'}}
              >
                <Checkbox
                  checked={search.decline == true ? true : false}
                  onChange={(e) => {
                    this.setState({
                      search: {
                        ...search,
                        decline: e.target.checked ? true : null
                      }
                    })
                  }}
                />
              </Form.Item>
            
            </Col>
          </Row>
        </Form>
        <Row>
          <SearchTemplatesPanel searchParams={search} setSearchParams={this.handleSetSearch} searchableType="project"/>
        </Row>
        <Preloader loading={this.state.loading}>
          {visibleCard &&
            <Modal
              title={`Проект № ${project ? project.number : ''}`}
              visible={visibleCard}
              onCancel={this.handleCloseModal}
              onOk={this.handleCloseModal}
              footer={false}
              width={'80%'}
            >
              {project ?
                <ProjectCard
                  project_id={project.number}
                />
                :
                <ProjectCard />
              }
            </Modal>}

          <Row gutter={20}>
            <Col>
              <Button
                key="add_project"
                type="button"
                onClick={() => this.setState({ visibleCard: true, project: null })}
                style={{ backgroundColor: 'limegreen' }}
              >
                Создать проект
              </Button>
            </Col>
            <Col
              style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}
            >
              <Text>
                Общее кол-во: {meta.total} шт.
              </Text>
            </Col>
          </Row>
          <Table
            style={{ marginTop: '10px' }}
            rowKey={(record) => record.number}
            loading={loading}
            columns={columns}
            dataSource={projects}
            hideOnSinglePage={true}
            onChange={this.handleTableChange}
            pagination={pagination}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => { this.setState({ visibleCard: true, project: record }) }, // click row
              };
            }}
            rowClassName={(record, index) => {
              let row_classes = []
              row_classes.push(classes[record.status]);
              return row_classes.join(" ")
            }}
          />
        </Preloader>
      </React.Fragment >
    );
  }
}

const styles = (theme) => ({
  archive: {
    backgroundColor: '#d9f7be',
  },
  decline: {
    backgroundColor: '#d9d9d9',
  },
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

export default withStyles(styles)(Projects);
