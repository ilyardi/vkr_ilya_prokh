import React, { Component } from 'react';
import Rest from 'tools/rest';
import { AbilityContext, Can } from 'tools/ability';
import dayjs from 'dayjs';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  FloatButton,
  Select,
  Input,
  Row,
  Col,
  Form,
  Modal,
  Typography,
  DatePicker,
  Button,
  InputNumber,
  Checkbox,
  Radio,
  Statistic,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { SettingOutlined, CheckOutlined } from '@ant-design/icons';
import { red, volcano, green, yellow } from '@ant-design/colors';
import { parseISO as _parseISO, format } from 'date-fns';
import {
  debounce,
  isEqual as _isEqual,
  replace as _replace,
  find as _find,
  map as _map,
  includes as _includes,
  remove as _remove,
  forEach as _forEach
} from 'lodash'
import { toast } from 'react-toastify';

import ExpenseCard from 'components/expense_card';
import QueryMixin from 'components/query_mixin';
import ExpenseManagerSettings from './components/settings';
import SearchTemplatesPanel from 'components/search_templates_panel'
import { string } from 'prop-types';

const { Text } = Typography;
const { RangePicker } = DatePicker;

class ExpenseManager extends QueryMixin {
  state = {
    expenses: [],
    expense: {},
    expense_stages: [],
    expense_ids_selected: [],
    meta: {
      page: this.getQuery('page') || 1,
      per: this.getQuery('per') || 50,
      total: 0,
      order: this.getQuery('order'),
      order_by: this.getQuery('order_by'),
    },
    search: {
      number: this.getQuery('number'),
      name: this.getQuery('name'),
      amount_min: this.getQuery('amount_min'),
      amount_max: this.getQuery('amount_max'),
      author_id: this.getQuery('author_id'),
      executor_id: this.getQuery('executor_id'),
      expense_type_id: this.getQuery('expense_type_id'),
      expense_stage_id: this.getQuery('expense_stage_id'),
      expense_purpose_id: this.getQuery('expense_purpose_id'),
      created_at: this.getQuery('created_at'),
      pay_type: this.getQuery('pay_type'),
      expense_counterparty_id: this.getQuery('expense_counterparty_id'),
      date_payment: this.getQuery('date_payment'),
      plan_date_payment: this.getQuery('plan_date_payment'),
      status: this.getQuery('status'),
      expense_company_id: this.getQuery('expense_company_id'),
      show_all: this.getQuery('show_all'),
      hide_closed: this.getQuery('hide_closed') || true,
      expense_purposes: this.getQuery('expense_purposes') || []
    },
    total: {
      count: 0,
      amount: 0,
    },
    errors: {},
    loading: false,
    useDebounce: false,
    visibleCard: false,
    visibleSettings: false,
    data_relevance: null,
  };

  expense_types = [];
  expense_purposes = [];
  expense_companies = [];
  expense_counterparties = [];
  users = [];

  statuses = [
    { label: "В работе" ,value: "at_work" },
    { label: "Выполнена" ,value: "done" },
    { label: "Отменена" ,value: "decline" },
    { label: "План" ,value: "plan" },
  ];
  pay_types = [
    { label: 'Наличный', value: 'cash' },
    { label: 'Безналичный', value: 'noncash' },
  ];
  flow_rates = [
    { label: 'OPEX', value: 'opex' },
    { label: 'CAPEX', value: 'capex' }
  ]

  loadData = () => {
    const { meta, search } = this.state
    const params = {
      page: meta.page,
      per: meta.per,
      order: meta.order,
      order_by: meta.order_by,
      search: search,
    };

    this.setQuery({
      ...search,
      page: meta.page,
      per: meta.per,
      order: meta.order,
      order_by: meta.order_by,
    });

    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true, useDebounce: false });

    this.loadRequest = Rest.get('/api/v1/expenses.json', { params: params }).then(
      (response) => {
        const { expenses, meta, total } = response.data;
        this.setState({
          total,
          expenses,
          meta: {
            ...this.state.meta,
            ...meta,
          },
          errors: {},
          loading: false,
        });
      },
    );
  };

  updateExpenses = () => {
    const {expense_ids_selected} = this.state
    const params = {
      expense_ids_selected: expense_ids_selected,
      operation: 'confirm',
    }
    this.setState({ loading: true })
    Rest.put(`/api/v1/expenses/batch_update.json`, params).then(
      (response) => {
        const { errors, expenses } = response.data;
        if (_isEqual(errors, {})) {
          toast.success('Операция выполнена успешно');
        }
        else {
          toast.warn(`Невозможно согласовать расходы: ${_map(errors, (v, k)=>(String(k))).join(", ")}`);
        }
        let approved = []
        _forEach(expenses, (expense)=>{
          if (errors[expense.id]) { return }
          approved.push(expense.id)
        })
        let new_expenses = this.state.expenses
        _remove(new_expenses, (value)=>{
          return _includes(approved, value.id)
        })
        this.setState({
          expenses: new_expenses,
          errors: errors,
        })
      }).catch((e) => {
        toast.error('Ошибка выполнения операции');
      })
      .finally(() => {
        this.setState({
          loading: false,
          expense_ids_selected: []
        })
      });
  };

  handleSwitchChecked = (expenseId)=>{
    Rest.put(`/api/v1/expenses/${expenseId}/switch_checked`).then(
        (response) => {
          const { expense } = response.data;
          const new_expenses = _map(this.state.expenses, (item)=>{
            const new_expense = item.id == expense.id ? expense : item
            return new_expense
          })
          this.setState({expenses: new_expenses})
          toast.success('Успешная операция');
        }).catch((e) => {
          // setErrors(e.response.data.expense.errors)
          toast.error('Ошибка операции');
        })
  };

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
    document.title = _replace(document.title, ' | Расходы', '')
  };

  componentDidMount() {
    document.title += ' | Расходы'
    this.loadUsers();
    this.loadExpenseTypes();
    this.loadExpensePurpose();
    this.loadExpenseCounterparty();
    this.loadData();
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per) ||
      !_isEqual(prevState.meta.order, this.state.meta.order) ||
      !_isEqual(prevState.meta.order_by, this.state.meta.order_by) ||
      prevState.data_relevance !== this.state.data_relevance
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadData();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  };

  loadUsers() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/users.json`, {params: {order_by: 'name'}}).then(
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

  loadExpensePurpose() {
    this.setState({ loading: true });
    Rest.get('/api/v1/expense_purposes/for_searching.json').then(
      (response) => {
        const { expense_purposes } = response.data;
        this.expense_purposes = _map(expense_purposes, (purpose) => {
          return { label: purpose, value: purpose }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadExpenseCounterparty() {
    this.setState({ loading: true });
    Rest.get('/api/v1/expense_counterparties.json').then(
      (response) => {
        const { expense_counterparties } = response.data;
        this.expense_counterparties = _map(expense_counterparties, (counterparty) => {
          return { label: counterparty.name, value: counterparty.id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadExpenseTypes() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/expense_types.json`).then(
      (response) => {
        const { expense_types, expense_companies } = response.data
        this.expense_types = _map(expense_types, (type) => {
          return { label: type.name, value: type.id }
        })
        this.expense_companies = _map(expense_companies, (company) => {
          return { label: company.name, value: company.id }
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadExpenseStages(expense_type_id) {
    const params = {
      search: {
        expense_type_id: expense_type_id,
      }
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/expense_stages.json`, { params: params }).then(
      (response) => {
        const { expense_stages } = response.data
        this.setState({
          expense_stages: _map(expense_stages, (stage) => {
            return { label: stage.name, valexpense_counterpartiesue: stage.id }
          })
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

  handleChangeAmountMin = (value) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, amount_min: value },
    });
  };

  handleChangeAmountMax = (value) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, amount_max: value },
    });
  };

  handleChangeAuthor = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, author_id: value },
    })
  };

  handleChangeExecutorUser = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, executor_id: value },
    })
  };

  handleChangeType = (value, option) => {
    this.loadExpenseStages(value);
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        expense_type_id: value,
        expense_stage_id: undefined,
      },
    });
  };

  handleChangeStage = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        expense_stage_id: value,
      },
    });
  };

  handleChangeExpenseComapny = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        expense_company_id: value,
      },
    });
  };

  handleChangePayType = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        pay_type: value,
      },
    });
  };

  handleChangePurposes = (values) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        expense_purposes: values,
      },
    });
  };

  handleChangeExpenseCounterparty = (value) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        expense_counterparty_id: value,
      },
    });
  };

  handleChangeStatus = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        status: value,
      }
    });
  };

  handleChangeFlowRate = (value, option) => {
    this.setState({
      meta: { ...this.state.meta, page: 1  },
      search: {
        ...this.state.search,
        flow_rate: value,
      },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
        order: sorter.order == undefined ? null : sorter.order.replace('end', ''),
        order_by: sorter.column == undefined ? null : sorter.field,
      },
    });
  };

  handleCloseCard = () => {
    this.setState({ visibleCard: false, data_relevance: new Date() })
  };

  handleClickOnRow = (record, rowIndex) => {
    return {
      onClick: event => { this.setState({ visibleCard: true, expense: record }) },
    };
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
      loading,
      search,
      visibleCard,
      visibleSettings,
      expense,
      expenses,
      meta,
      expense_stages,
      expense_ids_selected,
      total,
      errors,
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
      {
        title: '',
        dataIndex: 'checked_at',
        key: 'checked_at',
        align: 'center',
        hidden: search.show_all,
        render: (value, record)=> {
          const marker_color = value ? 'darkgray' : 'black'
          return (
            <span
              style={{fontSize: '26px', color: marker_color, cursor: 'pointer'}}
              onClick={()=>{this.handleSwitchChecked(record.id)}}
            >
              &bull;
            </span>
          )
        }
      },
      {
        title: '№',
        dataIndex: 'id',
        key: 'id',
        width: '30px',
        align: 'center',
        sorter: true,
        sortOrder: meta.order_by === 'id' ? meta.order + 'end' : null,
        onCell: this.handleClickOnRow
      },
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
        width: '500px',
        sorter: true,
        sortOrder: meta.order_by === 'name' ? meta.order + 'end' : null,
        onCell: this.handleClickOnRow
      },
      {
        title: 'Сумма',
        dataIndex: 'amount',
        key: 'amount',
        width: '120px',
        render: (value) => {
          return (new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value))
        },
        sorter: true,
        sortOrder: meta.order_by === 'amount' ? meta.order + 'end' : null,
        onCell: this.handleClickOnRow
      },
      {
        title: 'Компания',
        dataIndex: 'expense_company',
        key: 'expense_company',
        width: '120px',
        onCell: this.handleClickOnRow
      },
      {
        title: 'План',
        dataIndex: 'plan_date_payment',
        key: 'plan_date_payment',
        width: '100px',
        align: 'center',
        render: (value) => {
          return (value ? dayjs(value).format("DD.MM.YYYY") : null)
        },
        sorter: true,
        sortOrder: meta.order_by === 'plan_date_payment' ? meta.order + 'end' : null,
        onCell: this.handleClickOnRow
      },
      {
        title: 'Факт',
        dataIndex: 'date_payment',
        key: 'date_payment',
        width: '100px',
        align: 'center',
        render: (value) => {
          return (value ? dayjs(value).format("DD.MM.YYYY") : null)
        },
        sorter: true,
        sortOrder: meta.order_by === 'date_payment' ? meta.order + 'end' : null,
        onCell: this.handleClickOnRow
      },
      {
        title: 'Исполнитель',
        dataIndex: 'executor',
        key: 'executor',
        width: '150px',
        onCell: this.handleClickOnRow
      },
      {
        title: 'OPEX / CAPEX',
        dataIndex: 'flow_rate',
        key: 'flow_rate',
        width: '80px',
        align: 'center',
        render: (value) => {
          return (value ? value.toUpperCase() : null)
        },
        onCell: this.handleClickOnRow
      },
      {
        title: 'Статья расхода',
        dataIndex: 'expense_purpose',
        key: 'expense_purpose',
        onCell: this.handleClickOnRow
      },
      {
        title: 'Тип',
        dataIndex: 'expense_type',
        key: 'expense_type',
        onCell: this.handleClickOnRow
      },
      {
        title: 'Вид',
        dataIndex: 'pay_type',
        key: 'pay_type',
        align: 'center',
        width: '130px',
        onCell: this.handleClickOnRow
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: '130px',
        onCell: this.handleClickOnRow
      },
    ];

    return (
      <React.Fragment>
        
        <FloatButton.BackTop />
        <PageHeader
          title="Менеджер расходов"
          extra={[
            <Can do="manage" on="Expense" key={0}>
              <Button
                type="button"
                onClick={() => this.setState({ visibleSettings: true })}
                icon={<SettingOutlined />}
              />
            </Can>,
          ]}
        />
        {visibleSettings &&
          <ExpenseManagerSettings
            closeCard={() => { this.setState({ visibleSettings: false }) }}
            visibleCard={visibleSettings}
          />
        }
        {visibleCard &&
          <ExpenseCard
            visibleCard={visibleCard}
            expenseId={expense?.id}
            closeCard={this.handleCloseCard}
          />
        }
        <div style={{width: '97%'}}>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={'Номер:'}
                  style={{marginBottom: '5px'}}
                >
                  <Input
                    name="number"
                    defaultValue={search.number}
                    placeholder="Номер"
                    onChange={this.handleChangeText}
                  />
                </Form.Item>
                <Form.Item
                  label={'Название:'}
                  style={{marginBottom: '5px'}}
                >
                  <Input
                    name="name"
                    defaultValue={search.name}
                    placeholder="Название"
                    onChange={this.handleChangeText}
                  />
                </Form.Item>
                <Form.Item
                  label={'Контрагент:'}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.expense_counterparty_id == '' ? undefined : search.expense_counterparty_id}
                    placeholder='Контрагент'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.expense_counterparties}
                    onChange={this.handleChangeExpenseCounterparty}
                  />

                </Form.Item>
                <Form.Item
                  label={'Сумма:'}
                  style={{marginBottom: '5px'}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <InputNumber
                      style={{ width: '50%', marginRight: '5px' }}
                      name="amount_min"
                      min={0}
                      controls={false}
                      defaultValue={search.amount_min}
                      placeholder="от"
                      onChange={this.handleChangeAmountMin}
                    />
                    <InputNumber
                      style={{ width: '50%', marginLeft: '5px' }}
                      name="amount_max"
                      min={0}
                      controls={false}
                      defaultValue={search.amount_max}
                      placeholder="до"
                      onChange={this.handleChangeAmountMax}
                    />
                  </div>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={'Автор:'}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.author_id == '' ? undefined : search.author_id}
                    placeholder='Автор'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.users}
                    onChange={this.handleChangeAuthor}
                  />
                </Form.Item>
                <Form.Item
                  label={'Исполнитель:'}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.executor_id == '' ? undefined : search.executor_id}
                    placeholder='Исполнитель'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.users}
                    onChange={this.handleChangeExecutorUser}
                  />
                </Form.Item>
                <Form.Item
                  label={'OPEX / CAPEX'}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.flow_rate == '' ? undefined : search.flow_rate}
                    options={this.flow_rates}
                    onChange={this.handleChangeFlowRate}
                  />
                </Form.Item>
                <Form.Item
                  label={'Компания:'}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.expense_company_id == '' ? undefined : search.expense_company_id}
                    placeholder='Компания'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.expense_companies}
                    onChange={this.handleChangeExpenseComapny}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={'Тип:'}
                  labelCol={{span: 6}}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.expense_type_id == '' ? undefined : search.expense_type_id}
                    placeholder='Тип расхода'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.expense_types}
                    onChange={this.handleChangeType}
                  />
                </Form.Item>
                <Form.Item
                  label={'Вид:'}
                  labelCol={{ span: 6 }}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.pay_type == '' ? undefined : search.pay_type}
                    placeholder='Вид расхода'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.pay_types}
                    onChange={this.handleChangePayType}
                  />
                </Form.Item>
                <Form.Item
                  label={'Статья:'}
                  labelCol={{span: 6}}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    mode='multiple'
                    allowClear
                    showSearch
                    value={search.expense_purposes}
                    placeholder='Статья расхода'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.expense_purposes}
                    onChange={this.handleChangePurposes}
                  />
                </Form.Item>
                <Form.Item
                  label={'Статус:'}
                  labelCol={{span: 6}}
                  style={{marginBottom: '5px'}}
                >
                  <Select
                    allowClear
                    showSearch
                    value={search.status == '' ? undefined : search.status}
                    placeholder='Статус'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={this.statuses}
                    onChange={this.handleChangeStatus}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
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
                <Form.Item
                  label={'Совершен:'}
                  style={{marginBottom: '5px'}}
                >
                  <RangePicker
                    value={(search.date_payment[0] && search.date_payment[1]) ?
                      _map(search.date_payment, (item) => { return dayjs(item, 'DD.MM.YYYY') })
                      :
                      null}
                    placeholder={['Выполнена с', 'по']}
                    format={'DD.MM.YYYY'}
                    onChange={(dates, dateStrings) => {
                      this.setState({
                        search: {
                          ...search,
                          date_payment: dateStrings
                        }
                      })
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={'Запланирован:'}
                  style={{marginBottom: '5px'}}
                >
                  <RangePicker
                    value={(search.plan_date_payment[0] && search.plan_date_payment[1]) ?
                      _map(search.plan_date_payment, (item) => { return dayjs(item, 'DD.MM.YYYY') })
                      :
                      null}
                    placeholder={['Выполнена с', 'по']}
                    format={'DD.MM.YYYY'}
                    onChange={(dates, dateStrings) => {
                      this.setState({
                        search: {
                          ...search,
                          plan_date_payment: dateStrings
                        }
                      })
                    }}
                  />
                </Form.Item>
                <div style={{height: '30px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'flex-end'}}>
                  <Checkbox
                    checked={search.show_all ? true : null}
                    onChange={(e) => {
                        this.setState({
                          search: {
                            ...search,
                            show_all: e.target.checked ? true : null
                          }
                        })
                      }}
                  >
                    ПОКАЗАТЬ ВСЕ
                  </Checkbox>
                  <Checkbox
                    checked={search.hide_closed ? true : null}
                    onChange={(e) => {
                        this.setState({
                          search: {
                            ...search,
                            hide_closed: e.target.checked ? true : null
                          }
                        })
                      }}
                  >
                    СКРЫТЬ ОТМЕНЕННЫЕ
                  </Checkbox>
                </div>
              </Col>
            </Row>
          </Form>
          <Row>
            <SearchTemplatesPanel searchParams={search} setSearchParams={this.handleSetSearch} searchableType="expense"/>
          </Row>
          <Row gutter={20}>
            <Col>
              <Button
                key="add_expense"
                type="button"
                onClick={() => this.setState({ visibleCard: true, expense: null })}
                style={{ backgroundColor: 'limegreen' }}
              >
                Создать новый
              </Button>
            </Col>
            {expense_ids_selected?.length > 0 && !search.show_all &&
              <Col>
                <Button
                  key="approve"
                  type="button"
                  onClick={this.updateExpenses}
                  style={{ backgroundColor: 'lightskyblue' }}
                >
                  Согласовать
                  <CheckOutlined />
                </Button>
              </Col>
            }
            <Col
              style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}
            >
              <Statistic title="Общее кол-во" value={total.count} />
            </Col>
            <Col>
              <Statistic
                title="Сумма"
                value={new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(total.amount)}
                style={{
                  margin: '0 32px',
                }}
              />
            </Col>
          </Row>
        </div>
        <Table
          style={{ marginTop: '10px' }}
          rowKey={(record) => record.id}
          loading={loading}
          columns={columns}
          dataSource={expenses}
          hideOnSinglePage={true}
          onChange={this.handleTableChange}
          pagination={pagination}
          rowSelection={search.show_all ? null : {
            selectedRowKeys: expense_ids_selected,
            preserveSelectedRowKeys: false,
            onChange:(selected_row_keys)=> {
              this.setState({
                expense_ids_selected: selected_row_keys
              })
            },
            onCell: (record, rowIndex)=>{
              return {
                onClick: (event) => {
                  event.stopPropagation();
                }
              }
            },
          }}
          expandable={{
            showExpandColumn: !search.show_all && (errors.length > 0),
            defaultExpandAllRows: true,
            expandedRowRender: (record) => (
              <>
                {
                  _map(errors[record.id], (value, key)=> {
                    return(<p>{key} - {value.join(', ')}</p>)
                  })
                }
              </>
            ),
            rowExpandable: (record) => errors[record.id] && !search.show_all,
            onCell: (record, rowIndex)=>{
              return {
                onClick: (event) => {
                  event.stopPropagation()
                }
              }
            },
          }}
          rowClassName={(record, index) => {
            let row_classes = []
            if (!record.checked_at && !search.show_all) {
              row_classes.push(classes['not_checked'])
            }
            switch (record.status) {
              case 'Выполнена':
                row_classes.push(classes['success']);
              case 'Отменена':
                row_classes.push(classes['declined']);
            }
            return row_classes.join(" ")
          }}
        />
      </React.Fragment >
    );
  }
}

const styles = (theme) => ({
  not_checked: {
    fontWeight: 800,
  },
  declined: {
    backgroundColor: '#d9d9d9',
  },
  success: {
    backgroundColor: '#d9f7be',
  },
  danger: {
    backgroundColor: red[1],
  },
  warning: {
    backgroundColor: yellow[1],
  },
  error: {
    backgroundColor: volcano[1],
  },
});

ExpenseManager.contextType = AbilityContext;

export default withStyles(styles)(ExpenseManager);
