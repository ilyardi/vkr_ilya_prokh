import React, { useState, useEffect, useContext } from 'react';
import Rest from 'tools/rest';
import { AbilityContext, Can } from 'tools/ability';
import { connect } from 'react-redux';
import { CheckCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Table,
  Typography,
  Card,
  Modal,
  Form,
  Row,
  Col,
  Input,
  Select,
  Checkbox,
  Tag,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  debounce,
  find as _find,
  forEach as _forEach,
  map as _map,
  reject as _reject,
} from 'lodash';
import { toast } from 'react-toastify';
import UserCard from 'components/user_card';

const { Text } = Typography;
const { Meta } = Card;
let debounceLoad = null;
let roles = [];
let departments = [];

const ManagmentUsers = (props) => {
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState({
    show_all: true,
    role: null,
    department_id: null,
  })
  const [meta, setMeta] = useState({ page: 1, per: 20, total: 0 })
  const [user, setUser] = useState({})
  const [useDebounce, setUseDebounce] = useState(false)
  const context = useContext(AbilityContext)

  useEffect(() => {
    loadRoles();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (debounceLoad) {
      debounceLoad.cancel();
    }
    debounceLoad = debounce(() => {
      loadUsers();
    }, 500);

    debounceLoad();

    if (!useDebounce) {
      debounceLoad.flush();
    }
  }, [meta.page, meta.per, filter]);

  const loadUsers = () => {
    const params = {
      ...meta,
      filter: filter,
    };
    setLoading(true)
    Rest.get(`/api/v1/users.json`, { params: params }).then((response) => {
      const { users, meta } = response.data;
      setMeta(meta)
      setUsers(users);
      setLoading(false);
    });
  }

  const loadRoles = () => {
    Rest.get(`/api/v1/directory/user_roles`).then((response) => {
      const { user_roles } = response.data;
      roles = _map(user_roles, (_, role) => {
        return { label: role, value: role }
      })
    });
  };

  const loadDepartments = () => {
    Rest.get(`/api/v1/departments.json`).then((response) => {
      departments = _map(response.data.departments, (department) => {
        return { label: department.name, value: department.id }
      })
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const meta = {
      page: pagination.current,
      per: pagination.pageSize,
      total: pagination.total,
    }
    setMeta(meta);
  };

  const handleChangeText = (e) => {
    setUseDebounce(true)
    setFilter({ ...filter, [e.target.name]: e.target.value });
    setMeta({ ...meta, page: 1 })
  };

  const handleChangeSelector = (value, filter_name) => {
    setFilter({ ...filter, [filter_name]: value });
    setMeta({ ...meta, page: 1 })
  };

  const handleCloseModal = ()=> {
    setSettingsVisible(false);
    loadUsers();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Логин',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Отдел',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Чат ID',
      dataIndex: 'chat_id',
      key: 'chat_id',
    },
    {
      title: 'LB ID',
      dataIndex: 'lb_manager_id',
      key: 'lb_manager_id',
    },
    {
      title: 'Статус',
      dataIndex: 'active',
      key: 'active',
      render: (value) => {
        return (value ?
          <Tag icon={<CheckCircleOutlined />} color="success">
            Активный
          </Tag>
          :
          <Tag icon={<MinusCircleOutlined />} color="default">
            Не Активный
          </Tag>
      )
      }
    },
  ]

  return (
    <>
      <PageHeader title="Управление пользователями"></PageHeader>
      {settingsVisible &&
        <Modal
          title={"Настройки аккаунта"}
          onCancel={handleCloseModal}
          onOk={handleCloseModal}
          footer={false}
          width={'40%'}
          open={settingsVisible}
        >
          <UserCard user_id={user?.id} />
        </Modal>
      }
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Row gutter={5}>
          <Col span={6}>
            <Form.Item
              label={'Имя:'}
              style={{marginBottom: '5px'}}
            >
              <Input
                name="name"
                value={filter.name}
                placeholder="Имя"
                onChange={handleChangeText}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={'Роль:'}
              style={{marginBottom: '5px'}}
            >
              <Select
                allowClear
                showSearch
                value={filter.role == '' ? undefined : filter.role}
                placeholder='роль'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={roles}
                onChange={(value)=> {handleChangeSelector(value, 'role')}}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={'Отдел:'}
              style={{marginBottom: '5px'}}
            >
              <Select
                allowClear
                showSearch
                value={filter.department_id == '' ? undefined : filter.department_id}
                placeholder='отдел'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={departments}
                onChange={(value)=> {handleChangeSelector(value, 'department_id')}}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label='Не активные:'
              labelCol={{ span: 16 }}
              style={{marginBottom: '5px'}}
            >
              <Checkbox
                checked={filter.show_all == true ? true : false}
                onChange={(e) => { setFilter({...filter, show_all: e.target.checked ? true : undefined}) }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {/* <Button
        key="add_user"
        type="button"
        // onClick={() => this.setState({ visibleCard: true, request: null })}
        style={{ backgroundColor: 'limegreen' }}
      >
        Создать пользователя
      </Button> */}
      <Table
        style={{ marginTop: '10px' }}
        dataSource={users}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{
          current: meta.page,
          pageSize: meta.per,
          total: meta.total,
          showSizeChanger: true,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => {
              setUser(record)
              setSettingsVisible(true)
            },
          };
        }}
        onChange={handleTableChange}
        loading={loading}
        title={()=>(
          context.can('manage', 'User') ?
          <div style={{display: 'flex', justifyContent: 'end', alignItems: 'center'}}>
            <Button
              key="add_user"
              type="button"
              icon={<PlusOutlined />}
              onClick={() => {
                setUser(null)
                setSettingsVisible(true)
              }}
              // disabled={false}
            >
              Добавить
            </Button>
          </div>
          :
          null
        )}
      />
    </>
  );
};

const mapStateToProps = (state) => {
  return { user: state.user };
};

export default connect(
  mapStateToProps,
)(ManagmentUsers);
