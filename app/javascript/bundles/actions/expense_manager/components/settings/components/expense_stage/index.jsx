import React, { useState, useEffect, useReducer } from 'react';
import Rest from 'tools/rest';
import {
  Button,
  message,
  Modal,
  Table,
  Typography,
  Form,
  Input,
  Popconfirm,
  Row,
  Col,
  Select,
  Switch,
  DatePicker,
  Tabs,
  Empty,
  InputNumber,
  Divider,
} from 'antd';
import { InfoCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
  includes as _includes,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

const { Text } = Typography;

const ExpenseStage = (props) => {
  const [expenseStage, setExpenseStage] = useState({
    id: null,
    name: null,
    alert_timer: null,
    expense_type_id: props.expenseTypeId || null,
    user_id: null,
    active: true,
    priority: null,
  });
  const [expenseStageId, setExpenseStageId] = useState(props.expenseStageId);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataRelevance, setDataRelevance] = useState(null);
  const [users, setUsers] = useState([]);

  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  }

  const getExpenseStage = () => {
    if (!expenseStageId) {return}
    setLoading(true)
    Rest.get(`/api/v1/expense_stages/${expenseStageId}`).then(
      (response) => {
        const { expense_stage } = response.data;
        setExpenseStage(expense_stage)
      }).catch((e) => {
        console.error('error', e);
      }).finally(() => {
        setLoading(false);
      });
  };

  const createExpenseStage = () => {
    const expense_stage = expenseStage
    setLoading(true)
    Rest.post('/api/v1/expense_stages.json', { expense_stage })
      .then((response) => {
        const { expense_stage } = response.data
        console.log(response.data)
        setExpenseStage(expense_stage)
        if (props.closeCard) { props.closeCard() }
      }).catch((e) => {
        setErrors(e.response.data.expense_stage.errors)
        toast.error('Ошибка сохранения');
      }).finally(() => {
        setLoading(false);
      });
  };

  const updateExpenseStage = () => {
    const expense_stage = expenseStage
    setLoading(true)
    Rest.put(`/api/v1/expense_stages/${expense_stage.id}`, { expense_stage })
      .then((response) => {
        const { expense_stage } = response.data
        setExpenseStage(expense_stage)
        if (props.closeCard) { props.closeCard() }
      }).catch((e) => {
        setErrors(e.response.data.expense_stage.errors)
        toast.error('Ошибка сохранения');
      }).finally(() => {
        setLoading(false);
      });
  };

  const loadUsers = () => {
    setLoading(true)
    const params = {
      page: 1,
      per: 200,
    }
    Rest.get(`/api/v1/users.json`, {params: params}).then(
      (response) => {
        const { users } = response.data
        setUsers(_map(users, (user) => {
          return { label: user.name, value: user.id }
        }))
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(true)
      });
  };

  const handleDeleteStage = (record) => {
    Rest.delete(`api/v1/expense_stages/${record.id}.json`).then((response) => {
      dataRelevanceChange();
    });
  };

  const handleChangeText = (e) => {
    setExpenseStage({ ...expenseStage, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  };

  useEffect(() => {
    getExpenseStage();
    loadUsers();
  }, []);

  return (
    <Modal
      title={`Этап № ${expenseStage.id} - ${expenseStage.name}`}
      visible={props.visibleCard}
      onCancel={props.closeCard}
      onOk={props.closeCard}
      footer={false}
      width={'500px'}
    >
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="Имя: "
          help={errors?.name && errors?.name.join(", ")}
          validateStatus={errors?.name && "error"}
        >
          <Input
            controls={false}
            name="name"
            value={expenseStage?.name}
            onChange={handleChangeText}
          />
        </Form.Item>
        <Form.Item
          label="Исполнитель:"
          help={errors?.user_id && errors?.user_id.join(", ")}
          validateStatus={errors?.user_id && "error"}
        >
          <Select
            value={expenseStage.user_id}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
            options={users}
            onChange={(value) => {setExpenseStage({ ...expenseStage, user_id: value ? value : null })}}
          />
        </Form.Item>
        <Form.Item
          label="Таймер:"
        >
          <React.Fragment>
            <Form.Item noStyle>
              <InputNumber
                value={expenseStage.alert_timer ? parseInt(expenseStage.alert_timer/60) : null}
                style={{ width: '50%' }}
                addonAfter='ч.'
                min={0}
                controls={false}
                onChange={(value) => {
                  setExpenseStage({ ...expenseStage, alert_timer: parseInt(expenseStage.alert_timer % 60) + value * 60 })
                }}
              />
            </Form.Item>
            <Form.Item noStyle>
              <InputNumber
                value={expenseStage.alert_timer ? parseInt(expenseStage.alert_timer % 60) : null}
                style={{ width: '50%' }}
                addonAfter='м.'
                min={0}
                controls={false}
                onChange={(value) => {
                  setExpenseStage({ ...expenseStage, alert_timer: parseInt(expenseStage.alert_timer / 60)*60 + value})
                }}
              />
            </Form.Item>
          </React.Fragment>
        </Form.Item>
        <Form.Item
          label="Приоритет:"
        >
          <InputNumber
            min={0}
            value={expenseStage.priority}
            onChange={(value) => { setExpenseStage({ ...expenseStage, priority: value }) }}
          />
        </Form.Item>
        <Form.Item
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Button
            style={{ width: '100%' }}
            type='primary'
            onClick={expenseStageId ? updateExpenseStage : createExpenseStage}
          >
            {expenseStageId ? 'Сохранить' : 'Создать'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseStage;
