import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { AbilityContext, Can } from 'tools/ability';
import { withStyles } from '@material-ui/core/styles';
import Rest from 'tools/rest';
import {
  ConfigProvider,
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
  DatePicker,
  Tabs,
  Empty,
  InputNumber,
  Steps,
  Checkbox,
  Divider,
  Collapse,
  Radio,
  Space,
  Tooltip,
} from 'antd';
import { RetweetOutlined, PlusOutlined, CopyOutlined, DollarOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import FilesUploader from 'components/files_uploader';
import EventList from './components/events_list';
import { text } from '@fortawesome/fontawesome-svg-core';

const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ExpenseCard = (props) => {

  const { classes } = props;

  const [expense, setExpense] = useState({
    id: null,
    name: null,
    description: null,
    amount: null,
    author_id: null,
    expense_type_id: null,
    expense_stage_id: null,
    expense_purpose_id: null,
    expense_company_id: null,
    pay_type: 'noncash',
    counterparty: null,
    expense_counterparty_id: null,
    date_payment: null,
    plan_date_payment: null,
    flow_rate: 'opex',
    status: 'at_work',
  });
  const [currentExpense, setCurrentExpense] = useState({});
  const [frequency, setFrequency] = useState({
    unit: null,
    quantity: null,
  })
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [repeatable, setRepeatable] = useState(false)
  const [comment, setComment] = useState(null);
  const [expenseId, setExpenseId] = useState(props.expenseId || null);
  const [activeKey, setActiveKey] = useState();
  const [dataRelevance, setDataRelevance] = useState(null);
  const [errors, setErrors] = useState({});
  const [counterpartyErrors, setCounterpartyErrors] = useState({})
  const [loading, setLoading] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseCompanies, setExpenseCompanies] = useState([]);
  const [expensePurposes, setExpensePurposes] = useState([]);
  const [expenseCounterparties, setExpenseCounterparties] = useState([]);
  const [expenseCounterparty, setExpenseCounterparty] = useState({
    name: null,
    inn: null,
  });
  const [expenseStages, setExpenseStages] = useState([]);
  const [users, setUsers] = useState([]);
  const [canRevert, setCanRevert] = useState(false);
  const [canDecline, setCanDecline] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);

  const context = useContext(AbilityContext)
  const current_user = useSelector(state => state.user)


  const payTypes = [
    { value: 'cash', label: 'Наличный' },
    { value: 'noncash', label: 'Безналичный' },
  ];

  const statuses = [
    { label: "В работе" ,value: "at_work" },
    { label: "Оплачен", value: "paid" },
    { label: "Выполнена" ,value: "done" },
    { label: "Отменена" ,value: "decline" },
    { label: "План" ,value: "plan" },
  ];

  const flowRates = [
    { label: 'OPEX', value: 'opex' },
    { label: 'CAPEX', value: 'capex' }
  ];

  const units = [
    { label: 'День', value: 'day' },
    { label: 'Месяц', value: 'month' }
  ];

  const getExpense = () => {
    if (!expenseId) { return }
    setLoading(true)
    Rest.get(`/api/v1/expenses/${expenseId}`).then(
      (response) => {
        const { expense } = response.data;
        setExpense(expense);
        setCurrentExpense(expense);
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateExpense = () => {
    setErrors({})
    const params = {
      expense: expense,
      comment: comment
    }
    setLoading(true);
    Rest.put(`/api/v1/expenses/${expenseId}`, params).then(
      (response) => {
        const { expense } = response.data;
        setExpense(expense);
        setCurrentExpense(expense);
        setComment(null);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        setErrors(e.response.data.expense.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createExpenseByPlan = () => {
    setLoading(true);
    Rest.post(`/api/v1/expenses/${expenseId}/create_by_plan.json`).then(
      (response) => {
        const { expense } = response.data;
        toast.success('Расход на основе плана создан');
      }).catch((e) => {
        toast.error('Ошибка создания расхода');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createExpense = () => {
    setErrors({})
    const params = {
      expense: expense,
      comment: comment,
      repeatable: repeatable,
      frequency: frequency,
    }
    setLoading(true);
    Rest.post(`/api/v1/expenses.json`, params).then(
      (response) => {
        const { expense } = response.data;
        setExpense(expense);
        setCurrentExpense(expense);
        setExpenseId(expense.id)
        setComment(null);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        setErrors(e.response.data.expense.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const destroyExpense = () => {
    setErrors({})
    setLoading(true);
    Rest.delete(`/api/v1/expenses/${expenseId}`).then(
      (response) => {
        toast.success('Расход удален');
        props.closeCard();
      }).catch((e) => {
        setErrors(e.response.data.expense.errors)
        toast.error('Ошибка удаления');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const save_and_close = (handleSaveExp) => {
    handleSaveExp();
    props.closeCard();
  };

  const handleCreateExpenseCounterparty = () => {
    // if (!expenseCounterparty?.name || !expenseCounterparty?.inn) { return; };
    const expense_counterparty = {
      name: expenseCounterparty?.name,
      inn: expenseCounterparty?.inn
    };
    Rest.post('/api/v1/expense_counterparties.json', { expense_counterparty })
      .then((response) => {
        const { expense_counterparty } = response.data
        setExpenseCounterparties([...expenseCounterparties, { label: expense_counterparty.name, value: expense_counterparty.id }])
        clearCounterparty()
      }).catch((e) => {
        setCounterpartyErrors(e.response.data.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const clearCounterparty = () => {
    setExpenseCounterparty({
      name: null,
      inn: null,
    })
    setCounterpartyErrors({})
  };

  const getExpenseTypes = () => {
    setLoading(true)
    Rest.get('/api/v1/expense_types.json').then(
      (response) => {
        const { expense_types, expense_companies } = response.data;
        setExpenseTypes(_map(expense_types, (expenseType) => {
          return { label: expenseType.name, value: expenseType.id }
        }))
        setExpenseCompanies(_map(expense_companies, (expenseCompany) => {
          return { label: expenseCompany.name, value: expenseCompany.id }
        }))
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getExpenseCounterparties = () => {
    setLoading(true)
    Rest.get('/api/v1/expense_counterparties.json').then(
      (response) => {
        const { expense_counterparties } = response.data;
        setExpenseCounterparties(_map(expense_counterparties, (expenseCouterparty) => {
          return { label: expenseCouterparty.name, value: expenseCouterparty.id }
        }))
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getExpenseStages = () => {
    if (!expense?.expense_type_id) { return }
    const params = {
      search: {
        expense_type_id: expense?.expense_type_id,
      },
      author_id: expense?.author_id ? expense?.author_id : current_user.id
    };
    setLoading(true)
    Rest.get('/api/v1/expense_stages.json', { params: params }).then(
      (response) => {
        const { expense_stages } = response.data;
        setExpenseStages(expense_stages);
        if (!expense.expense_stage_id) {
          setExpense({ ...expense, expense_stage_id: expense_stages[1]?.id});
        }
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getExpensePurpose = () => {
    if (!expense?.expense_type_id) { return }
    const params = {
      search: {
        expense_type_id: expense?.expense_type_id,
      },
    };
    setLoading(true)
    Rest.get('/api/v1/expense_purposes.json', { params: params }).then(
      (response) => {
        const { expense_purposes } = response.data;
        setExpensePurposes(_map(expense_purposes, (expensePurpose) => {
          return { label: expensePurpose.name, value: expensePurpose.id }
        }))
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadUsers = () => {
    setLoading(true);
    Rest.get(`/api/v1/users.json`).then(
      (response) => {
        const {users} = response.data
        setUsers(_map(users, (user) => {
          return { label: user.name, value: user.id }
        }));
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  }

  const handleChangeText = (e) => {
    const text = e.target.value?.trim() ? e.target.value : null
    setExpense({ ...expense, [e.target.name]: text })
    setErrors({ ...errors, [e.target.name]: null })
  };

  const handleChangeComment = (e) => {
    const comment = e.target.value?.trim() ? e.target.value : null
    setComment(comment);
  };

  useEffect(() => {
    getExpenseTypes();
    getExpensePurpose();
    loadUsers();
    getExpense();
    getExpenseCounterparties();
  }, []);

  useEffect(() => {
    setIsReadOnly(expense.id && (expense.status != 'plan'))
  }, [expense.id, expense.status]);

  useEffect(() => {
    getExpenseStages();
    getExpensePurpose();
  }, [expense.expense_type_id]);

  useEffect(() => {
    checkActionRules();
  }, [expense.expense_stage_id, expenseStages.length]);

  const checkActionRules = () => {
    const not_last_stage = _findIndex(expenseStages, { id: expense.expense_stage_id }) + 1 != expenseStages.length
    const not_first_stage = _findIndex(expenseStages, { id: expense.expense_stage_id }) > 0
    const user_is_responsible = (current_user.id == _find(expenseStages, { id: expense.expense_stage_id })?.user?.id)
    const currIndex = _findIndex(expenseStages, { id: expense.expense_stage_id })
    const targetIndex = _findIndex(expenseStages, (stage) => {return stage.user?.id == current_user.id})
    const difference = currIndex >= 0 && targetIndex >= 0 ? currIndex - targetIndex : -1

    setCanRevert(not_last_stage && (difference > 0 && difference <= 2))
    setCanConfirm(not_last_stage && user_is_responsible)
    setCanDecline(not_last_stage && not_first_stage && user_is_responsible)
  };

  return (
    <Modal
      title={
        <div style={{display: 'flex', justifyContent: 'space-between', marginRight: '40px'}}>
          <Text>{expense?.id ? `№ ${expense.id} - ${expense.name}` : 'Новый расход '}{expense.repeatable && <RetweetOutlined style={{margin: '0 15px'}}/>}</Text>
          <Text style={{ marginLeft: '15px', fontStyle: 'italic', fontWeight: '400' }}>{expense?.created_at ? `Создан: ${format(_parseISO(expense?.created_at), 'dd.MM.yyyy HH:mm')}` : null}</Text>
        </div>
      }
      open={props.visibleCard}
      onCancel={props.closeCard}
      onOk={props.closeCard}
      footer={false}
      width={'80%'}
      style={{ top: 20 }}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelHeight: '18px',
              lineHeight: '18px',
              labelFontSize: '12px',
              verticalLabelPadding: '0'
            },
          },
        }}
      >
        <Row gutter={40}>
          <Col span={12} >
            <Form layout='vertical' >
              <Form.Item
                label="Название: "
                help={errors?.name && errors?.name.join(", ")}
                validateStatus={errors?.name && "error"}
                style={errors?.name ? {} : {marginBottom: '5px'}}
              >
                <Input
                  controls={false}
                  name="name"
                  value={expense?.name}
                  onChange={handleChangeText}
                  readOnly={isReadOnly}
                />
              </Form.Item>
              <Form.Item
                label="Описание:"
                help={errors?.description && errors?.description.join(", ")}
                validateStatus={errors?.description && "error"}
                style={errors?.description ? {} : {marginBottom: '5px'}}
              >
                <TextArea
                  rows={2}
                  name="description"
                  onChange={handleChangeText}
                  value={expense.description}
                  readOnly={isReadOnly}
                />
              </Form.Item>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    label="Тип:"
                    help={errors?.expense_type_id && errors?.expense_type_id.join(", ")}
                    validateStatus={errors?.expense_type_id && "error"}
                    style={errors?.expense_type_id ? {} : {marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      value={expense.expense_type_id}
                      options={expenseTypes}
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      onChange={(value)=> {
                        setExpense({
                          ...expense,
                          expense_type_id: value,
                          expense_stage_id: null,
                          expense_purpose_id: null,
                        })
                      }}
                      disabled={isReadOnly}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Компания:"
                    help={errors?.expense_company_id && errors?.expense_company_id.join(", ")}
                    validateStatus={errors?.expense_company_id && "error"}
                    style={errors?.expense_company_id ? {} : {marginBottom: '5px'}}
                  >
                    <Select
                      allowClear
                      showSearch
                      value={expense.expense_company_id}
                      options={expenseCompanies}
                      optionFilterProp="children"
                      filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                      onChange={(value)=> { setExpense({ ...expense, expense_company_id: value}) }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    label='Статья расхода'
                    help={errors?.expense_purpose_id && errors?.expense_purpose_id.join(", ")}
                    validateStatus={errors?.expense_purpose_id && "error"}
                    style={errors?.expense_purpose_id ? {} : {marginBottom: '5px'}}
                  >
                    <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                      <Select
                        allowClear
                        showSearch
                        value={expense.expense_purpose_id}
                        options={expensePurposes}
                        optionFilterProp="children"
                        filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                        onChange={(value) => { setExpense({ ...expense, expense_purpose_id: value }) }}
                      />
                      <Button
                        style={{ marginLeft: '5px' }}
                        icon={<CopyOutlined />}
                        disabled={!expense.expense_purpose_id}
                        onClick={() => {
                          const text = _find(expensePurposes, { value: expense.expense_purpose_id })?.label
                          navigator.clipboard.writeText(text)
                          toast.success(`${text} успешно скопирован`);
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label='OPEX / CAPEX'
                    help={errors?.flow_rate && errors?.flow_rate.join(", ")}
                    validateStatus={errors?.flow_rate && "error"}
                    style={errors?.flow_rate ? {} : {marginBottom: '5px'}}
                  >
                    <div style={{display: 'flex', flexWrap: 'nowrap'}}>
                      <Select
                        value={expense.flow_rate}
                        options={flowRates}
                        onChange={(value) => { setExpense({ ...expense, flow_rate: value }) }}
                      />
                      <Button
                        style={{marginLeft: '5px'}}
                        icon={<CopyOutlined/>}
                        disabled={!expense.flow_rate}
                        onClick={()=>{
                          const text = _find(flowRates, { value: expense.flow_rate })?.label
                          navigator.clipboard.writeText(text)
                          toast.success(`${text} успешно скопирован`);
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={12}>
                   <Form.Item
                      label="Сумма:"
                      help={errors?.amount && errors?.amount.join(", ")}
                      validateStatus={errors?.amount && "error"}
                      style={errors?.amount ? {} : {marginBottom: '5px'}}
                    >
                      <InputNumber
                        value={expense.amount}
                        addonAfter="₽"
                        controls={false}
                        onChange={(value) => {
                          setExpense({ ...expense, amount: value }) }}
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        parser={(value) => value.replace(/\\s?|( *)/g, '')}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Оплатить до"
                      help={errors?.plan_date_payment && errors?.plan_date_payment.join(", ")}
                      validateStatus={errors?.plan_date_payment && "error"}
                      style={errors?.plan_date_payment ? {} : {marginBottom: '5px'}}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format={'DD.MM.YYYY HH:mm'}
                        value={expense.plan_date_payment ? dayjs(expense.plan_date_payment) : null}
                        onChange={(date, dateString) => { setExpense({ ...expense, plan_date_payment: date }) }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Дата платежа"
                      help={errors?.date_payment && errors?.date_payment.join(", ")}
                      validateStatus={errors?.date_payment && "error"}
                      style={errors?.date_payment ? {} : {marginBottom: '5px'}}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format={'DD.MM.YYYY HH:mm'}
                        value={expense.date_payment ? dayjs(expense.date_payment) : null}
                        onChange={(date, dateString) => { setExpense({ ...expense, date_payment: date }) }}
                      />
                    </Form.Item>
                    <Form.Item
                      label='Расчет'
                      help={errors?.pay_type && errors?.pay_type.join(", ")}
                      validateStatus={errors?.pay_type && "error"}
                      style={errors?.pay_type ? {} : {marginBottom: '5px'}}
                    >
                      <Select
                        value={expense.pay_type}
                        options={payTypes}
                        onChange={(value) => { setExpense({ ...expense, pay_type: value }) }}
                      />
                    </Form.Item>
                </Col>
                <Col span={12} style={{display: 'flex', justifyContent: 'center'}}>
                  {expense.expense_type_id &&
                    <Form.Item
                      wrapperCol={{ span: 24 }}
                      style={{
                        margin: 'auto 0px'
                      }}
                    >
                      <Steps
                        size='small'
                        progressDot
                        direction="vertical"
                        current={_findIndex(expenseStages, { id: expense.expense_stage_id })}
                        onChange={(value) => {
                          if (!context.can('manage', 'Expense')) { return }
                          if (value > _findIndex(expenseStages, { id: currentExpense.expense_stage_id })) { return }
                          setExpense({ ...expense, expense_stage_id: expenseStages[value]?.id })
                        }}
                        items={_map(expenseStages, (stage) => {
                          return {
                            title: <p style={{margin: 0}}><b>{stage.name}</b> - {stage.user?.name}</p>
                          }
                        })}
                      />
                    </Form.Item>
                  }
                </Col>
              </Row>
              {(!expense.id || expense.repeatable) &&
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      label="Повторяемый"
                      help={errors?.repeatable && errors?.repeatable.join(", ")}
                      validateStatus={errors?.repeatable && "error"}
                      style={errors?.repeatable ? {} : {marginBottom: '5px'}}
                    >
                      <Checkbox
                        checked={expense.repeatable ? true : false}
                        onChange={(e)=> {
                          setExpense({ ...expense, repeatable: e.target.checked ? true : undefined})
                        }}
                        disabled={expense.id}
                      >
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    {!expense.id && expense.repeatable &&
                      <Form.Item
                        label="Период повторения"
                        style={{marginBottom: '5px'}}
                      >
                        <InputNumber
                          value={frequency.quantity}
                          width={'100%'}
                          addonAfter={
                            <Select
                              value={frequency.unit}
                              options={units}
                              style={{
                                width: 100,
                              }}
                              allowClear
                              onChange={(value) => {
                                setFrequency({ ...frequency, unit: value })
                              }}
                            />
                          }
                          placeholder="кол-во"
                          controls={false}
                          onChange={(value) => {
                            setFrequency({ ...frequency, quantity: value })
                          }}
                          min={1}
                        />
                      </Form.Item>
                    }
                  </Col>
                </Row>
              }
              <Row gutter={10}>
                <Col span={8} >
                  <Form.Item
                    label="Статус"
                    help={errors?.status && errors?.status.join(", ")}
                    validateStatus={errors?.status && "error"}
                    style={errors?.status ? {} : { marginBottom: '5px' }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                      <Select
                        allowClear
                        showSearch
                        value={expense.status}
                        options={statuses}
                        optionFilterProp="children"
                        filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                        onChange={(value) => { setExpense({ ...expense, status: value }) }}
                        disabled={expense.status == 'plan'}
                      />
                      {currentExpense.status == 'plan' &&
                        <Tooltip title='В работу' color='green'>
                          <Button
                            style={{ marginLeft: '5px' }}
                            icon={<DollarOutlined />}
                            onClick={createExpenseByPlan}
                          />
                        </Tooltip>
                      }
                    </div>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    label="Контрагент:"
                    help={errors?.expense_counterparty && errors?.expense_counterparty.join(", ")}
                    validateStatus={errors?.expense_counterparty && "error"}
                    style={errors?.expense_counterparty ? {} : {marginBottom: '5px'}}
                  >
                    <div style={{display: 'flex', flexWrap: 'nowrap'}}>
                      <Select
                        allowClear
                        showSearch
                        value={expense?.expense_counterparty_id}
                        onChange={(value, option) => {
                          setExpense({
                          ...expense,
                          expense_counterparty_id: value
                          })
                          clearCounterparty()
                        }}
                        options={expenseCounterparties}
                        optionFilterProp="children"
                        filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                        dropdownRender={(menu) => (
                          <div>
                            {menu}
                            <Divider style={{ margin: '4px 0' }} />
                            <Collapse
                              expandIcon={(panelProps) => <PlusOutlined />}
                              items={[
                                {
                                  key: 'formCreateCounterparty',
                                  label: "Добавить",
                                  children: <Form
                                      labelCol={{ span: 6 }}
                                      wrapperCol={{ span: 18 }}
                                    >
                                      <Form.Item
                                        label="Название: "
                                        help={counterpartyErrors?.name && counterpartyErrors?.name.join(", ")}
                                        validateStatus={counterpartyErrors?.name && "error"}
                                      >
                                        <Input
                                          style={{ flex: 'auto' }}
                                          value={expenseCounterparty?.name}
                                          onChange={(event)=>{
                                            setExpenseCounterparty({...expenseCounterparty, name: event.target.value})
                                            setCounterpartyErrors({...counterpartyErrors, name: null})
                                          }}
                                        />
                                      </Form.Item>
                                      <Form.Item
                                        label="Инн: "
                                        help={counterpartyErrors?.inn && counterpartyErrors?.inn.join(", ")}
                                        validateStatus={counterpartyErrors?.inn && "error"}
                                      >
                                        <Input
                                          style={{ flex: 'auto' }}
                                          value={expenseCounterparty?.inn}
                                          onChange={(event)=>{
                                            setExpenseCounterparty({...expenseCounterparty, inn: event.target.value})
                                            setCounterpartyErrors({...counterpartyErrors, inn: null})
                                          }}
                                        />
                                      </Form.Item>
                                      <Form.Item
                                        wrapperCol={{ offset: 2, span: 20 }}
                                      >
                                        <Button
                                          style={{ width: '100%' }}
                                          type='primary'
                                          htmlType="submit"
                                          onClick={handleCreateExpenseCounterparty}
                                        >
                                          Сохранить
                                        </Button>
                                      </Form.Item>
                                    </Form>
                                }
                              ]}
                            />
                          </div>
                        )}
                      />
                      <Button
                        style={{marginLeft: '5px'}}
                        icon={<CopyOutlined/>}
                        disabled={!expense.expense_counterparty_id}
                        onClick={()=>{
                          const text = _find(expenseCounterparties, { value: expense.expense_counterparty_id })?.label
                          navigator.clipboard.writeText(text)
                          toast.success('Контрагент успешно скопирован');
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label='Комментарий:'
                style={{marginBottom: '5px'}}
              >
                <TextArea
                  rows={2}
                  onChange={handleChangeComment}
                  value={comment}
                />
              </Form.Item>
              <Form.Item
                wrapperCol={{ span: 24 }}
                style={{marginBottom: '5px', marginTop: '15px'}}
              >
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Button
                    onClick={(event) => {
                      const index = _findIndex(expenseStages, { id: expense.expense_stage_id }) + 1
                      setExpense({ ...expense, expense_stage_id: expenseStages[index]?.id })
                    }}
                    disabled={!canConfirm}
                  >
                    Согласовать
                  </Button>
                  <Button
                    onClick={(event) => {
                      const index = _findIndex(expenseStages, { id: expense.expense_stage_id }) - 1
                      setExpense({ ...expense, expense_stage_id: expenseStages[index]?.id })
                    }}
                    disabled={!canDecline}
                  >
                    Отклонить
                  </Button>
                  <Button
                    onClick={(event) => {
                      const stage_index = _findIndex(expenseStages, (stage) => { return stage.user?.id == current_user.id })
                      if (stage_index >= 0) {
                        setExpense({ ...expense, expense_stage_id: expenseStages[stage_index]?.id })
                      }
                    }}
                    disabled={!canRevert}
                  >
                    Вернуть себе
                  </Button>
                  <Button
                    type='primary'
                    htmlType="submit"
                    onClick={expense?.id ? updateExpense : createExpense}
                    disabled={(_isEqual(expense, currentExpense) && !comment) || loading}
                  >
                    {'Сохранить'}
                  </Button>
                  <Button
                    type='primary'
                    htmlType="submit"
                    onClick={(e)=> {save_and_close(expense?.id ? updateExpense : createExpense)}}
                    disabled={(_isEqual(expense, currentExpense) && !comment) || loading}
                  >
                    {'Сохранить и закрыть'}
                  </Button>
                  {currentExpense.status == 'plan' &&
                    <Button
                      type='primary'
                      onClick={destroyExpense}
                      danger
                    >
                      Удалить
                    </Button>
                  }
                </div>
              </Form.Item>
            </Form>
          </Col>
          <Col span={12}>
            <Divider orientation="left">Лог событий</Divider>
            <Row style={{maxHeight: '300px', height: '50%', overflowY: 'scroll'}}>
              {(expense?.events?.length > 0) ?
                <EventList events={expense?.events} />
                :
                <Empty style={{ marginBottom: '30px', width: '100%' }} />}
            </Row>
            <Divider orientation="left">Файлы</Divider>
            <Row style={{ height: '50%'}}>
              <FilesUploader
                related_obj_type='Expense'
                related_obj_id={expenseId}
                onlyFiles={true}
              />
            </Row>
          </Col>
        </Row>
      </ConfigProvider>
    </Modal>
  );
};

const styles = (theme) => ({
  stepDevider: {
    height: '10px',
    marginLeft: '7px',
    borderLeft: '2px solid black',
  },
});

export default withStyles(styles)(ExpenseCard);
