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
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined
} from '@ant-design/icons';
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

import MobileFilesUploader from 'components/mobile_files_uploader';

const { Text } = Typography;
const { TextArea } = Input;

const MobileExpenseCard = (props) => {
  const { match, classes } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const toastify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

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
  const [repeatable, setRepeatable] = useState(false)
  const [comment, setComment] = useState(null);
  const [expenseId, setExpenseId] = useState(match.params.expense_id || null);
  const [activeKey, setActiveKey] = useState();
  const [dataRelevance, setDataRelevance] = useState(null);
  const [errors, setErrors] = useState({});
  const [counterpartyErrors, setCounterpartyErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
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

  const [toDate, setToDate] = useState(false);

  const context = useContext(AbilityContext)
  const current_user = useSelector(state => state.user)

  const payTypes = [
    { value: 'cash', label: 'Наличный' },
    { value: 'noncash', label: 'Безналичный' },
  ];

  const statuses = [
    { label: "В работе" ,value: "at_work" },
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

  const updateExpense = (actionAfterSave='noting') => {
    setLoading(true)
    setErrors({})
    const params = {
      expense: expense,
      comment: comment
    }
    Rest.put(`/api/v1/expenses/${expenseId}`, params).then(
      (response) => {
        const { expense } = response.data;
        setExpense(expense);
        setCurrentExpense(expense);
        setComment(null);
        toastify('success', 'Изменения сохранены')
        if (actionAfterSave == 'close'){
          history.back()
        }
      }).catch((e) => {
        setErrors(e.response.data.expense.errors)
        toastify('error', 'Ошибка сохранения')
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createExpense = (actionAfterSave='noting') => {
    setErrors({})
    const params = {
      expense: expense,
      comment: comment,
      repeatable: repeatable,
      frequency: frequency,
    }
    setLoading(true)
    Rest.post(`/api/v1/expenses.json`, params).then(
      (response) => {
        const { expense } = response.data;
        setExpense(expense);
        setCurrentExpense(expense);
        setExpenseId(expense.id)
        setComment(null);
        toastify('success', 'Расход создан')
        if (actionAfterSave == 'close'){
          history.back()
        }
      }).catch((e) => {
        setErrors(e.response.data.expense.errors)
        toastify('error', 'Ошибка создания')
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const destroyExpense = () => {
    setLoading(true)
    setErrors({})
    Rest.delete(`/api/v1/expenses/${expenseId}`).then(
      (response) => {
        toastify('success', 'Расход удален')
        history.back()
      }).catch((e) => {
        setErrors(e.response.data.expense.errors)
        toastify('error', 'Ошибка удаления')
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const save_and_close = (handleSaveExp) => {
    handleSaveExp('close');
  };

  const handleCreateExpenseCounterparty = () => {
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
      <div className={classes.buttonBack} onClick={()=>{history.back()}}>
        <ArrowLeftOutlined />
      </div>
      <div className={classes.main}>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          {expense?.id &&
            <Form.Item
            label={<Text className={classes.menuItemLabel}>Номер</Text>}
            help={errors?.id && errors?.id.join(", ")}
            validateStatus={errors?.id && "error"}
          >
            <Input
              size={size}
              placeholder='Номер'
              controls={false}
              name="id"
              value={expense?.id}
              readOnly
            />
          </Form.Item>}
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Название</Text>}
            help={errors?.name && errors?.name.join(", ")}
            validateStatus={errors?.name && "error"}
          >
            <Input
              size={size}
              placeholder='Название'
              controls={false}
              name="name"
              value={expense?.name}
              onChange={handleChangeText}
              readOnly={isReadOnly}
            />
          </Form.Item>
          <Form.Item
            help={errors?.author_id && errors?.author_id.join(", ")}
            validateStatus={errors?.author_id && "error"}
            label={<Text className={classes.menuItemLabel}>Автор</Text>}
            hidden={!expense.id}
          >
            <Input
              size={size}
              placeholder='Автор'
              controls={false}
              name="name"
              value={_find(users, { value: expense.author_id })?.label}
              readOnly
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Тип</Text>}
            help={errors?.expense_type_id && errors?.expense_type_id.join(", ")}
            validateStatus={errors?.expense_type_id && "error"}
          >
            <Select
              size={size}
              allowClear
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
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Компания</Text>}
            help={errors?.expense_company_id && errors?.expense_company_id.join(", ")}
            validateStatus={errors?.expense_company_id && "error"}
          >
            <Select
              size={size}
              allowClear
              value={expense.expense_company_id}
              options={expenseCompanies}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value)=> { setExpense({ ...expense, expense_company_id: value}) }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Статья расхода</Text>}
            help={errors?.expense_purpose_id && errors?.expense_purpose_id.join(", ")}
            validateStatus={errors?.expense_purpose_id && "error"}
          >
            <Select
              size={size}
              allowClear
              showSearch
              value={expense.expense_purpose_id}
              options={expensePurposes}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { setExpense({ ...expense, expense_purpose_id: value }) }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>OPEX / CAPEX</Text>}
            help={errors?.flow_rate && errors?.flow_rate.join(", ")}
            validateStatus={errors?.flow_rate && "error"}
          >
            <div style={{display: 'flex', flexWrap: 'nowrap'}}>
              <Select
                size={size}
                value={expense.flow_rate}
                options={flowRates}
                onChange={(value) => { setExpense({ ...expense, flow_rate: value }) }}
              />
              <Button
                size={size}
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
          {expense.expense_type_id &&
            <Form.Item
              wrapperCol={{ offset: 1 }}
            >
              <Steps
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
                    title: stage.name,
                    description: stage.user?.name
                  }
                })}
              />
            </Form.Item>
          }
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Сумма</Text>}
            help={errors?.amount && errors?.amount.join(", ")}
            validateStatus={errors?.amount && "error"}
          >
            <InputNumber
              size={size}
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
          <div className={expense.repeatable ? classes.repeatableBlock : '' }>
            <Form.Item
              // label="Повторяемый"
              help={errors?.repeatable && errors?.repeatable.join(", ")}
              validateStatus={errors?.repeatable && "error"}
            >
              <Checkbox
                checked={expense.repeatable ? true : false}
                onChange={(e)=> {
                  setExpense({ ...expense, repeatable: e.target.checked ? true : undefined})
                }}
                disabled={expense.id}
              >
                Повторяемый
              </Checkbox>
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Период повторения</Text>}
              hidden={!(!expense.id && expense.repeatable)}
            >
              <InputNumber
                size={size}
                value={frequency.quantity}
                addonAfter={
                  <Select
                    placeholder="ед.изм."
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
                style={{width: '100%'}}
              />
            </Form.Item>
          </div>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Оплатить до</Text>}
            help={errors?.plan_date_payment && errors?.plan_date_payment.join(", ")}
            validateStatus={errors?.plan_date_payment && "error"}
          >
            <DatePicker
              size={size}
              style={{ width: '100%', borderRadius: '25px' }}
              format={'DD.MM.YYYY HH:mm'}
              value={expense.plan_date_payment ? dayjs(expense.plan_date_payment) : null}
              onChange={(date, dateString) => { setExpense({ ...expense, plan_date_payment: date }) }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Расчет</Text>}
            help={errors?.pay_type && errors?.pay_type.join(", ")}
            validateStatus={errors?.pay_type && "error"}
          >
            <Select
              size={size}
              value={expense.pay_type}
              options={payTypes}
              onChange={(value) => { setExpense({ ...expense, pay_type: value }) }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Контрагент</Text>}
            help={errors?.expense_counterparty && errors?.expense_counterparty.join(", ")}
            validateStatus={errors?.expense_counterparty && "error"}
          >
            <div style={{display: 'flex', flexWrap: 'nowrap'}}>
              <Select
                size={size}
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
                          children: (
                            <Form>
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
                              <Form.Item>
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
                          )
                        }
                      ]}
                    />
                  </div>
                )}
              />
              <Button
                size={size}
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
              value={expense.description}
              readOnly={isReadOnly}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Дата создания</Text>}
            hidden={!expense?.created_at}
          >
            <Input
              size={size}
              controls={false}
              value={expense?.created_at ? format(_parseISO(expense?.created_at), 'dd.MM.yyyy HH:mm') : null}
              readOnly
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Дата платежа</Text>}
            help={errors?.date_payment && errors?.date_payment.join(", ")}
            validateStatus={errors?.date_payment && "error"}
          >
            <DatePicker
              size={size}
              style={{ width: '100%', borderRadius: '25px' }}
              format={'DD.MM.YYYY HH:mm'}
              value={expense.date_payment ? dayjs(expense.date_payment) : null}
              onChange={(date, dateString) => { setExpense({ ...expense, date_payment: date }) }}
            />
          </Form.Item>
          <Form.Item
            label={<Text className={classes.menuItemLabel}>Статус</Text>}
            help={errors?.status && errors?.status.join(", ")}
            validateStatus={errors?.status && "error"}
          >
            <Select
              size={size}
              allowClear
              value={expense.status}
              options={statuses}
              optionFilterProp="children"
              filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
              onChange={(value) => { setExpense({ ...expense, status: value }) }}
              disabled={expense.status == 'plan'}
            />
          </Form.Item>
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
          related_obj_type='Expense'
          related_obj_id={expenseId}
          onlyFiles={true}
        />
      </div>
      <div className={classes.actions}>
        <Button
          onClick={(event) => {
            const index = _findIndex(expenseStages, { id: expense.expense_stage_id }) + 1
            setExpense({ ...expense, expense_stage_id: expenseStages[index]?.id })
          }}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={!canConfirm}
        >
          <div className={classes.actionBlock}>
            <CheckOutlined className={classes.actionIcon}/>
            <Text className={classes.actionLable}>Согласовать</Text>
          </div>
        </Button>
        <Button
          onClick={(e) => { save_and_close(expense?.id ? updateExpense : createExpense) }}
          style={{ margin: '0', padding: '0', border: 'none', height: 'inherit', background: 'none' }}
          disabled={_isEqual(expense, currentExpense) && !comment}
          loading={loading}
        >
          <div className={classes.actionBlock}>
            <SaveOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Сохранить</Text>
            {/* <Text className={classes.actionLable}>S & C</Text> */}
          </div>
        </Button>
        <Button
          onClick={(event) => {
            const stage_index = _findIndex(expenseStages, (stage) => { return stage.user?.id == current_user.id })
            if (stage_index >= 0) {
              setExpense({ ...expense, expense_stage_id: expenseStages[stage_index]?.id })
            }
          }}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={!canRevert}
        >
          <div className={classes.actionBlock}>
            <RollbackOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Вернуть</Text>
          </div>
        </Button>
        {/* <Button
          onClick={expense?.id ? updateExpense : createExpense}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={_isEqual(expense, currentExpense) && !comment}
        >
          <div className={classes.actionBlock}>
            <SaveOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Сохранить</Text>
          </div>
        </Button> */}
        <Button
          onClick={(event) => {
            const index = _findIndex(expenseStages, { id: expense.expense_stage_id }) - 1
            setExpense({ ...expense, expense_stage_id: expenseStages[index]?.id })
          }}
          style={{ margin: '0', padding: '0', border: 'none', height: 'inherit', background: 'none' }}
          disabled={!canDecline}
        >
          <div className={classes.actionBlock}>
            <CloseOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Отклонить</Text>
          </div>
        </Button>
        {currentExpense.status == 'plan' &&
          <Button
            onClick={destroyExpense}
            style={{ margin: '0', padding: '0', border: 'none', height: 'inherit', background: 'none' }}
            danger
          >
            <div className={classes.actionBlock}>
              <DeleteOutlined className={classes.actionIcon} />
              <Text className={classes.actionLable}>Удалить</Text>
            </div>
          </Button>
        }
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
    right: '0px',
    fontSize: '30px',
    color: '#59059B',
    zIndex: '2',
  },
});

const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(MobileExpenseCard));
