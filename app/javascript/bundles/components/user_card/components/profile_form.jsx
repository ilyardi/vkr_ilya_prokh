import React, { useState, useEffect, useContext } from 'react';
import Rest from 'tools/rest';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Button,
  Row,
  Col,
  Form,
  Input,
  Typography,
  Select,
  Switch,
  Modal,
} from 'antd';
import {
  find as _find,
  includes as _includes,
  map as _map,
  isEqual as _isEqual,
} from 'lodash';
import { toast } from 'react-toastify';
import { AbilityContext } from 'tools/ability';
import ChangePasswordForm from './change_password_form';

const { Text } = Typography;
let roles = [];
let departments = [];

const ProfileForm = (props) => {
  const [user, setUser] = useState({
    id: null,
    name: null,
    email: null,
    role: null,
    department_id: null,
    active: true,
    chat_id: null,
    lb_manager_id: null,
    password: null,
    check_password: null,
  })
  const [currentUser, setCurrentUser] = useState({})
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({})
  const [visibleChangePassword, setVisibleChangePassword] = useState(false)
  const context = useContext(AbilityContext)
  const can_manage = context.can('manage', 'User')

  const { user_id } = props

  useEffect(() => {
    loadRoles();
    loadDepartments();
    loadUser();
  }, []);

  const loadUser = () => {
    if (!user_id) {return}
    Rest.get(`/api/v1/users/${user_id}`).then((response) => {
      const current_user = {...user, ...response.data.user}
      setUser(current_user);
      setCurrentUser(current_user);
    });
  };

  const updateUser = () => {
    setErrors({})
    const params = {
      user: user,
    }
    Rest.put(`/api/v1/users/${user_id}`, params).then(
      (response) => {
        const { user } = response.data;
        setUser(user);
        setCurrentUser(user);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        setErrors(e.response.data.user.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createUser = () => {
    setErrors({})
    const params = {
      user: user,
    }
    Rest.post(`/api/v1/users.json`, params).then(
      (response) => {
        const { user } = response.data;
        setUser(user);
        setCurrentUser(user);
        toast.success('Пользователь создан');
      }).catch((e) => {
        setErrors(e.response.data.user.errors)
        toast.error('Ошибка создания пользователя');
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

  const handleChangeText = (e) => {
    const text = e.target.value?.trim() ? e.target.value : null
    setUser({ ...user, [e.target.name]: text })
    setErrors({ ...errors, [e.target.name]: null })
  };

  const handleChangeSelector = (value, option_name) => {
    setUser({ ...user, [option_name]: value });
  };

  return (
    <>
    {visibleChangePassword && user?.id &&
      <Modal
        title="Смена пароля"
        open={visibleChangePassword}
        onCancel={() => setVisibleChangePassword(false)}
        footer={false}
        width={'50%'}
      >
        <ChangePasswordForm
          userId={user.id}
          onSuccess={() => setVisibleChangePassword(false)}
        />
      </Modal>
    }
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Row>
        {user.pass_is_old &&
          <div style={{ textAlign: 'center', margin: '0px 15%' }}>
            <Text style={{ fontSize: '22px' }} type='danger'>
              <b>Внимание! До 15 сентября </b> необходимо сменить пароль, иначе доступ к учетной записи будет заблокирован!
              <br />
              Новый пароль должен отвечать требованиям безопасности: сожержать хотя бы одну цифру, строчную и заглавную буквы, спецсимвол и быть длиной не менее 8 символов.
            </Text>
          </div>
        }
      </Row>
      <Form.Item
        label="Имя"
        help={errors?.name && errors?.name.join(", ")}
        validateStatus={errors?.name && "error"}
      >
        <Input
          controls={false}
          name="name"
          value={user?.name}
          onChange={handleChangeText}
        />
      </Form.Item>
      <Form.Item
        label="Логин"
        help={errors?.email && errors?.email.join(", ")}
        validateStatus={errors?.email && "error"}
      >
        <Input
          controls={false}
          name="email"
          value={user?.email}
          onChange={handleChangeText}
        />
      </Form.Item>

      <Form.Item
        label="Пароль"
        help={errors?.email && errors?.email.join(", ")}
        validateStatus={errors?.password && "error"}
      >
        <Input
          controls={false}
          name="password"
          value={user?.password}
          onChange={handleChangeText}
        />
      </Form.Item>
      
      <Form.Item
        label="Роль"
        help={errors?.role && errors?.role.join(", ")}
        validateStatus={errors?.role && "error"}
      >
        {can_manage ?
          <Select
            allowClear
            showSearch
            value={user.role == '' ? undefined : user.role}
            placeholder='роль'
            optionFilterProp="children"
            filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
            options={roles}
            onChange={(value)=> {handleChangeSelector(value, 'role')}}
          />
          :
          <Text>{user.role}</Text>
        }
      </Form.Item>
      <Form.Item
        label="Отдел"
        help={errors?.department_id && errors?.department_id.join(", ")}
        validateStatus={errors?.department_id && "error"}
      >
        {can_manage ?
          <Select
            allowClear
            showSearch
            value={user.department_id == '' ? undefined : user.department_id}
            placeholder='отдел'
            optionFilterProp="children"
            filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
            options={departments}
            onChange={(value)=> {handleChangeSelector(value, 'department_id')}}
          />
          :
          <Text>{_find(departments, { value: user.department_id })?.label}</Text>
        }
      </Form.Item>
      <Form.Item
        label="ID ТГ"
        help={errors?.chat_id && errors?.chat_id.join(", ")}
        validateStatus={errors?.chat_id && "error"}
      >
        <Input
          controls={false}
          name="chat_id"
          value={user?.chat_id}
          onChange={handleChangeText}
        />
      </Form.Item>
      <Form.Item
        label="ID LB"
        help={errors?.lb_manager_id && errors?.lb_manager_id.join(", ")}
        validateStatus={errors?.lb_manager_id && "error"}
      >
        <Input
          controls={false}
          name="lb_manager_id"
          value={user?.lb_manager_id}
          onChange={handleChangeText}
        />
      </Form.Item>
      <Form.Item
        label="Статус"
        help={errors?.active && errors?.active.join(", ")}
        validateStatus={errors?.active && "error"}
      >
        <Switch
          style={{width: '120px'}}
          checked={user.active}
          checkedChildren={'Аткивен'}
          unCheckedChildren={'Не активен'}
          onChange={(checked) => { setUser({...user, active: checked}) }}
          disabled={!can_manage}
        />
      </Form.Item>
      <Row justify={'center'}>
        <Button
          style={{ width: '350px' }}
          type='primary'
          htmlType="submit"
          onClick={user?.id ? updateUser : createUser}
          disabled={_isEqual(user, currentUser)}
        >
          {user?.id ? 'Сохранить' : 'Создать'}
        </Button>
      </Row>
      {user?.id &&
        <Row justify={'center'} style={{ marginTop: '10px' }}>
          <Button
            style={{ width: '350px' }}
            onClick={() => setVisibleChangePassword(true)}
          >
            Изменить пароль
          </Button>
        </Row>
      }
    </Form>
    </>
  );
};

export default ProfileForm;
