import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  ConfigProvider,
  Typography,
  Select,
  Input,
  Form,
  DatePicker,
  InputNumber,
  Checkbox,
  Button,
} from 'antd';
import {
  Popup,
  CalendarPicker,
  FloatingBubble,
} from 'antd-mobile'
import {
  CloseOutlined,
  CalendarOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
  pull as _pull,
  concat as _concat,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

const {Text} = Typography;
const { RangePicker } = DatePicker;

const FilterPanel = (props) => {
  const { classes } = props;

  const [search, setSearch] = useState({
    number: props.search['number'] || null,
    name: props.search['name'] || null,
    amount_min: props.search['amount_min'] || null,
    amount_max: props.search['amount_max'] || null,
    author_id: props.search['author_id'] || null,
    executor_id: props.search['executor_id'] || null,
    expense_type_id: props.search['expense_type_id'] || null,
    expense_purposes: props.search['expense_purposes'] || [],
    created_at: props.search['created_at'] || [null,null],
    pay_type: props.search['pay_type'] || null,
    expense_counterparty_id: props.search['expense_counterparty_id'] || null,
    date_payment: props.search['date_payment'] || [null, null],
    plan_date_payment: props.search['plan_date_payment'] || [null, null],
    status: props.search['status'] || null,
    expense_company_id: props.search['expense_company_id'] || null,
    show_all: props.search['show_all'],
    hide_closed: props.search['hide_closed'],
    flow_rate: props.search['flow_rate'] || null,
  });

  const [expenseTypes, setExpenseTypes] = useState([])
  const [expensePurposes, setExpensePurposes] = useState([]);
  const [expenseCompanies, setExpenseCompanies] = useState([]);
  const [expenseCounterparties, setExpenseCounterparties] = useState([]);
  const [users, setUsers] = useState([]);
  const [createdAtVisible, setCreatedAtVisible] = useState(false);
  const [datePaymentVisible, setDatePaymentVisible] =  useState(false);
  const [planDatePaymentVisible, setPlanDatePaymentVisible] = useState(false);

  const statuses = [
    { label: "В работе" ,value: "at_work" },
    { label: "Выполнена" ,value: "done" },
    { label: "Отменена" ,value: "decline" },
    { label: "План" ,value: "plan" },
  ];
  const pay_types = [
    { label: 'Наличный', value: 'cash' },
    { label: 'Безналичный', value: 'noncash' },
  ];
  const flow_rates = [
    { label: 'OPEX', value: 'opex' },
    { label: 'CAPEX', value: 'capex' }
  ]

  const loadUsers = () => {
    Rest.get(`/api/v1/users.json`, {params: {order_by: 'name'}}).then(
      (response) => {
        const {users} = response.data
        setUsers(_map(users, (user) => {
          return { label: user.name, value: user.id }
        }))
      })
  };

  const loadExpensePurpose = () => {
    Rest.get('/api/v1/expense_purposes/for_searching.json').then(
      (response) => {
        const {expense_purposes} = response.data;
        setExpensePurposes(_map(expense_purposes, (purpose) => {
          return { label: purpose, value: purpose }
        }))
      })
  };

  const loadExpenseCounterparty = () => {
    Rest.get('/api/v1/expense_counterparties.json').then(
      (response) => {
        const {expense_counterparties} = response.data;
        setExpenseCounterparties(_map(expense_counterparties, (counterparty) => {
          return { label: counterparty.name, value: counterparty.id }
        }))
      })
  };

  const loadExpenseTypes = () => {
    Rest.get(`/api/v1/expense_types.json`).then(
      (response) => {
        const {expense_types, expense_companies} = response.data
        setExpenseTypes(_map(expense_types, (type) => {
          return { label: type.name, value: type.id }
        }))
        setExpenseCompanies(_map(expense_companies, (company) => {
          return { label: company.name, value: company.id }
        }))
      })
  };

  const handleChangeField = (value, field_name) => {
    setSearch({
      ...search,
      [field_name]: value
    })
  };

  const handleClosePopup = () => {
    props.closeFilters()
  };

  const handleApplaySearch = () => {
    props.applyFilters(search)
    props.closeFilters()
  };

  const handleClearSearch = () => {
    props.applyFilters({
      number: null,
      name: null,
      amount_min: null,
      amount_max: null,
      author_id: null,
      executor_id: null,
      expense_type_id: null,
      expense_purpose_id: null,
      created_at: [null, null],
      pay_type: null,
      expense_counterparty_id: null,
      date_payment: [null, null],
      plan_date_payment: [null, null],
      status: null,
      expense_company_id: null,
      show_all: null,
      hide_closed: true,
      flow_rate: null,
    })
    props.closeFilters()
  };

  useEffect(() => {
    loadUsers();
    loadExpenseTypes();
    loadExpensePurpose();
    loadExpenseCounterparty();
  }, []);

  const size = 'large'

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelHeight: '18px',
            lineHeight: '18px',
            labelFontSize: '12px',
            verticalLabelPadding: '0',
            margin:'20px 20px',
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
        },
      }}
    >
      <Popup
        visible={props.visible}
        onMaskClick={handleClosePopup}
        onClose={handleClosePopup}
        position='right'
        bodyStyle={{
          height: "100%",
          width: '100%',
          overflowY: 'scroll',
          overflowX: 'hidden',
          // background: "linear-gradient(180deg, #FFFFFF 0%, #CDA5E6 100%)",
          backgroundColor: '#CDA5E6',
        }}
      >
        <div className={classes.main}>
          <div
            style={{
              fontSize: "30px",
              color: '#59059B',
              padding: '20px 18px 10px',
            }}
          >
            <CloseOutlined onClick={handleClosePopup} />
          </div>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{
              margin: '0px 20px 18vh'
            }}
          >
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Номер</Text>}
              style={{marginBottom: '5px'}}
            >
              <Input
                size={size}
                name="number"
                defaultValue={search.number}
                placeholder="Номер"
                onChange={(e)=>{handleChangeField(e.target.value, 'number')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Название</Text>}
              style={{marginBottom: '5px'}}
            >
              <Input
                size={size}
                name="name"
                defaultValue={search.name}
                placeholder="Название"
                onChange={(e)=>{handleChangeField(e.target.value, 'name')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Контрагент</Text>}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.expense_counterparty_id == '' ? undefined : search.expense_counterparty_id}
                placeholder='Контрагент'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={expenseCounterparties}
                onChange={(value,options)=>{handleChangeField(value, 'expense_counterparty_id')}}
              />

            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Сумма</Text>}
              style={{marginBottom: '5px'}}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InputNumber
                  size={size}
                  style={{ width: '50%', marginRight: '5px' }}
                  name="amount_min"
                  min={0}
                  controls={false}
                  defaultValue={search.amount_min}
                  placeholder="от"
                  onChange={(value)=>{handleChangeField(value, 'amount_min')}}
                />
                <InputNumber
                  size={size}
                  style={{ width: '50%', marginLeft: '5px' }}
                  name="amount_max"
                  min={0}
                  controls={false}
                  defaultValue={search.amount_max}
                  placeholder="до"
                  onChange={(value)=>{handleChangeField(value, 'amount_max')}}
                />
              </div>
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Автор</Text>}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.author_id == '' ? undefined : search.author_id}
                placeholder='Автор'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={users}
                onChange={(value,options)=>{handleChangeField(value, 'author_id')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Исполнитель</Text>}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.executor_id == '' ? undefined : search.executor_id}
                placeholder='Исполнитель'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={users}
                onChange={(value,options)=>{handleChangeField(value, 'executor_id')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>OPEX / CAPEX</Text>}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.flow_rate == '' ? undefined : search.flow_rate}
                options={flow_rates}
                onChange={(value,options)=>{handleChangeField(value, 'flow_rate')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Компания</Text>}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.expense_company_id == '' ? undefined : search.expense_company_id}
                placeholder='Компания'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={expenseCompanies}
                onChange={(value,options)=>{handleChangeField(value, 'expense_company_id')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Тип</Text>}
              labelCol={{span: 6}}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.expense_type_id == '' ? undefined : search.expense_type_id}
                placeholder='Тип расхода'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={expenseTypes}
                onChange={(value,options)=>{handleChangeField(value, 'expense_type_id')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Вид</Text>}
              labelCol={{ span: 6 }}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.pay_type == '' ? undefined : search.pay_type}
                placeholder='Вид расхода'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={pay_types}
                onChange={(value,options)=>{handleChangeField(value, 'pay_type')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Статья</Text>}
              labelCol={{span: 6}}
              style={{marginBottom: '5px'}}
            >
              <Select
                mode='multiple'
                size={size}
                allowClear
                showSearch
                value={search.expense_purposes}
                placeholder='Статья расхода'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={expensePurposes}
                onChange={(values)=>{handleChangeField(values, 'expense_purposes')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Статус</Text>}
              labelCol={{span: 6}}
              style={{marginBottom: '5px'}}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.status == '' ? undefined : search.status}
                placeholder='Статус'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={statuses}
                onChange={(value,options)=>{handleChangeField(value, 'status')}}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Создана</Text>}
              style={{marginBottom: '5px'}}
            >
              <div
                style={{display: 'flex'}}
                onClick={()=>{setCreatedAtVisible(true)}}
              >
                <Input
                  size={size}
                  name="created_at"
                  value={`с ${search.created_at[0] || '...'} по ${search.created_at[1] || '...'}`}
                  placeholder="с ... по ..."
                  readOnly
                  suffix={
                    <ClearOutlined  onClick={(e)=> {
                      e.stopPropagation()
                      setSearch({...search, created_at: [null, null]})
                    }}/>
                  }
                />
                <CalendarPicker
                  allowClear
                  visible={createdAtVisible}
                  selectionMode='range'
                  onClose={() => setCreatedAtVisible(false)}
                  onMaskClick={() => setCreatedAtVisible(false)}
                  confirmText='Подтвердить'
                  title='Создан с ... по ...'
                  onConfirm={val => {
                    setSearch({
                      ...search,
                      created_at: [format(val[0] ,'dd.MM.yyyy'), format(val[1] ,'dd.MM.yyyy')],
                    })
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Совершен</Text>}
              style={{marginBottom: '5px'}}
            >
              <div
                style={{display: 'flex'}}
                onClick={()=>{setDatePaymentVisible(true)}}
              >
                <Input
                  size={size}
                  name="date_payment"
                  value={`с ${search.date_payment[0] || '...'} по ${search.date_payment[1] || '...'}`}
                  placeholder="с ... по ..."
                  readOnly
                  suffix={
                    <ClearOutlined  onClick={(e)=> {
                      e.stopPropagation()
                      setSearch({...search, date_payment: [null, null]})
                    }}/>
                  }
                />
                <CalendarPicker
                  allowClear
                  visible={datePaymentVisible}
                  selectionMode='range'
                  onClose={() => setDatePaymentVisible(false)}
                  onMaskClick={() => setDatePaymentVisible(false)}
                  confirmText='Подтвердить'
                  title='Совершен с ... по ...'
                  onConfirm={val => {
                    setSearch({
                      ...search,
                      date_payment: [format(val[0] ,'dd.MM.yyyy'), format(val[1] ,'dd.MM.yyyy')],
                    })
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Запланирован</Text>}
              style={{marginBottom: '5px'}}
            >
              <div
                style={{display: 'flex'}}
                onClick={()=>{setPlanDatePaymentVisible(true)}}
              >
                <Input
                  size={size}
                  name="plan_date_payment"
                  value={`с ${search.plan_date_payment[0] || '...'} по ${search.plan_date_payment[1] || '...'}`}
                  placeholder="с ... по ..."
                  readOnly
                  suffix={
                    <ClearOutlined  onClick={(e)=> {
                      e.stopPropagation()
                      setSearch({...search, plan_date_payment: [null, null]})
                    }}/>
                  }
                />
                <CalendarPicker
                  allowClear
                  visible={planDatePaymentVisible}
                  selectionMode='range'
                  onClose={() => setPlanDatePaymentVisible(false)}
                  onMaskClick={() => setPlanDatePaymentVisible(false)}
                  confirmText='Подтвердить'
                  title='Запланирован с ... по ...'
                  onConfirm={val => {
                    setSearch({
                      ...search,
                      plan_date_payment: [format(val[0] ,'dd.MM.yyyy'), format(val[1] ,'dd.MM.yyyy')],
                    })
                  }}
                />
              </div>
            </Form.Item>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'column'}}>
              {/* <Checkbox
                checked={search.show_all ? true : null}
                onChange={(e) => {
                    setSearch({
                        ...search,
                        show_all: e.target.checked ? true : null
                      })
                  }}
              >
                ПОКАЗАТЬ ВСЕ
              </Checkbox> */}
              <Checkbox
                checked={search.hide_closed ? true : null}
                onChange={(e) => {
                    setSearch({
                        ...search,
                        hide_closed: e.target.checked ? true : null
                      })
                  }}
              >
                СКРЫТЬ ОТМЕНЕННЫЕ
              </Checkbox>
            </div>
          </Form>
        </div>
        <div className={classes.actionBlock}>
          <Button className={classes.actionButton} onClick={(e) => { handleApplaySearch() }}>Применить</Button>
          <Button className={classes.actionButton} style={{ backgroundColor: 'white' }} onClick={(e) => { handleClearSearch() }}>Сбросить</Button>
        </div>
      </Popup>
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  filterBack: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #CDA5E6 100%)",
  },
  main: {
    height: '100%',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
  },
  menuItemLabel: {
    marginLeft: '15px',
    fontStyle: 'italic'
  },
  actionBlock: {
    display: 'flex',
    width: '100%',
    position: 'absolute',
    bottom: '0px',
    height: '12vh',
    flexDirection: 'column',
    marginBottom: '20px'
  },
  actionButton: {
    borderRadius: '20px',
    width: '90%',
    backgroundColor: '#cda5e5c2',
    margin: 'auto auto',
    height: '4.5vh',
    border: '2px solid #ad6ed373',
    fontSize: '20px',
    color: "#59059B",
  },
});


const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(FilterPanel));
