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
  Checkbox as MCheckbox,
} from 'antd-mobile'
import { SmileFill, SmileOutline } from 'antd-mobile-icons'
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
    actual: props.search['actual'] || null,
    show_all: props.search['show_all'],
    created_at: props.search['created_at'] || [null, null],
    request_type_id: props.search['request_type_id'] || null,
    request_statuses: props.search['request_statuses'] || [],
    responsible_user_id: props.search['responsible_user_id'] || null,
    executor_user_id: props.search['executor_user_id'] || null,
    doned_at: props.search['doned_at'] || [null, null],
    do_today: props.search['do_today'] || null,
    street_id: props.search['street_id'] || null,
    building_id: props.search['building_id'] || null,
    entrance_id: props.search['entrance_id'] || null,
    flat_id: props.search['flat_id'] || null,
    request_reasons: props.search['request_reasons'] || [],
    request_subtypes: props.search['request_subtypes'] || [],
  });

  const [users, setUsers] = useState([]);
  const [requestReasons, setRequestReasons] = useState([])
  const [requestTypes, setRequestTypes] = useState([])
  const [requestSubtypes, setRequestSubtypes] = useState([])
  const [requestStatuses, setRequestStatuses] = useState([])
  const [streets, setStreets] = useState([])
  const [buildings, setBuildings] = useState([])
  const [entrances, setEntrances] = useState([])
  const [flats, setFlats] = useState([])

  const [expenseTypes, setExpenseTypes] = useState([])
  const [expensePurposes, setExpensePurposes] = useState([]);
  const [expenseCompanies, setExpenseCompanies] = useState([]);
  const [expenseCounterparties, setExpenseCounterparties] = useState([]);

  const [createdAtVisible, setCreatedAtVisible] = useState(false);
  const [donedAtVisible, setDonedAtVisible] = useState(false);
  const [datePaymentVisible, setDatePaymentVisible] =  useState(false);
  const [planDatePaymentVisible, setPlanDatePaymentVisible] = useState(false);

  const loadUsers = () => {
    Rest.get(`/api/v1/users/help_desk_users`).then(
      (response) => {
        const { users } = response.data
        setUsers(_map(users, (user) => {
          return { label: user.name, value: user.id }
        }))
      });
  };

  const loadReasons = () => {
    Rest.get(`/api/v1/request_reasons.json`).then(
      (response) => {
        const { request_reasons } = response.data
        setRequestReasons(_map(request_reasons, (reason) => {
          if (!reason.active) {
            return { label: reason.description, value: reason.id, disabled: true }
          }
          return { label: reason.description, value: reason.id }
        }))
      });
  };

  const loadRequestTypes = () => {
    Rest.get(`/api/v1/request_types.json`).then(
      (response) => {
        const { request_types } = response.data
        setRequestTypes(_map(request_types, (type) => {
          return { label: type.name, value: type.id }
        }))
      });
  };

  const loadSubtypes = () => {
    const params = {
      request_type_id: search.request_type_id,
    }
    Rest.get(`/api/v1/request_subtypes.json`, { params: params }).then(
      (response) => {
        const { request_subtypes } = response.data
        setRequestSubtypes(_map(request_subtypes, (subtype) => {
          return { label: subtype.name, value: subtype.id }
        }))
      });
  };

  const loadRequestStatuses = () => {
    Rest.get(`/api/v1/request_statuses/for_searching.json`).then(
      (response) => {
        const { request_statuses } = response.data
        setRequestStatuses(_map(request_statuses, (status) => {
          return { label: status, value: status }
        }))
      });
  };

  const loadStreets = () => {
    Rest.get(`/api/v1/addresses.json`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setStreets(_map(suggestions, (s) => {
          return { label: s.value, value: s.id, key: s.id }
        }))
      });
  };

  const loadBuildings = (street_id) => {
    Rest.get(`/api/v1/addresses/houses.json?street_id=${street_id}`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setBuildings(_map(suggestions, (s) => {
          return { label: s.value, value: s.id };
        }));
      });
  };

  const loadEntrances = (building_id) => {
    Rest.get(`/api/v1/addresses/entrances.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        setEntrances(_map(data, (v) => {
          return { label: v.name, value: v.entrance_id };
        }));
      });
  };

  const loadFlats = (building_id) => {
    Rest.get(`/api/v1/addresses/flats.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        setFlats(_map(data, (v) => {
          return { label: v.name, value: v.flat_id };
        }));
      });
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
      actual: null,
      show_all: null,
      created_at: [null, null],
      request_type_id: null,
      request_statuses: [],
      responsible_user_id: null,
      executor_user_id: null,
      doned_at: [null, null],
      do_today: null,
      street_id: null,
      building_id: null,
      entrance_id: null,
      flat_id: null,
      request_reasons: [],
      request_subtypes: [],
    })
    props.closeFilters()
  };

  useEffect(() => {
    loadUsers();
    loadReasons();
    loadRequestTypes();
    loadRequestStatuses();
  }, []);

  useEffect(() => {
    loadSubtypes();
  }, [search.request_type_id]);

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
              label={<Text className={classes.menuItemLabel}>Автор</Text>}
              style={{ marginBottom: '5px' }}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.responsible_user_id ? search.responsible_user_id : undefined }
                placeholder='Автор'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={users}
                onChange={(value, options) => { handleChangeField(value, 'responsible_user_id') }}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Исполнитель</Text>}
              style={{ marginBottom: '5px' }}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.executor_user_id ? search.executor_user_id : undefined}
                placeholder='Исполнитель'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={users}
                onChange={(value, options) => { handleChangeField(value, 'executor_user_id') }}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Тип</Text>}
              style={{ marginBottom: '5px' }}
            >
              <Select
                size={size}
                allowClear
                showSearch
                value={search.request_type_id ? search.request_type_id : undefined}
                placeholder='Тип'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={requestTypes}
                onChange={(value, options) => { handleChangeField(value, 'request_type_id') }}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Подтип</Text>}
              style={{ marginBottom: '5px' }}
            >
              <Select
                size={size}
                allowClear
                showSearch
                mode='multiple'
                disabled={search.request_type_id ? false : true}
                value={search.request_subtypes}
                placeholder='Подтип'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={requestSubtypes}
                onChange={(values) => { handleChangeField(values, 'request_subtypes') }}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Статус</Text>}
              style={{ marginBottom: '5px' }}
            >
              <Select
                size={size}
                allowClear
                // showSearch
                mode='multiple'
                // disabled={search.request_type_id ? false : true}
                value={search.request_statuses}
                placeholder='Статус'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={requestStatuses}
                onChange={(values) => { handleChangeField(values, 'request_statuses') }}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Причины закрытия</Text>}
              style={{ marginBottom: '5px' }}
            >
              <Select
                size={size}
                allowClear
                showSearch
                mode='multiple'
                // disabled={search.request_type_id ? false : true}
                value={search.request_reasons}
                placeholder='Причины закрытия'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={requestReasons}
                onChange={(values) => { handleChangeField(values, 'request_reasons') }}
              />
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Создана</Text>}
              style={{ marginBottom: '5px' }}
            >
              <div
                style={{ display: 'flex' }}
                onClick={() => { setCreatedAtVisible(true) }}
              >
                <Input
                  size={size}
                  name="created_at"
                  value={`с ${search.created_at[0] || '...'} по ${search.created_at[1] || '...'}`}
                  placeholder="с ... по ..."
                  readOnly
                  suffix={
                    <ClearOutlined onClick={(e) => {
                      e.stopPropagation()
                      setSearch({ ...search, created_at: [null, null] })
                    }} />
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
                      created_at: [format(val[0], 'dd.MM.yyyy'), format(val[1], 'dd.MM.yyyy')],
                    })
                  }}
                />
              </div>
            </Form.Item>
            <Form.Item
              label={<Text className={classes.menuItemLabel}>Создана</Text>}
              style={{ marginBottom: '5px' }}
            >
              <div
                style={{ display: 'flex' }}
                onClick={() => { setDonedAtVisible(true) }}
              >
                <Input
                  size={size}
                  name="created_at"
                  value={`с ${search.doned_at[0] || '...'} по ${search.doned_at[1] || '...'}`}
                  placeholder="с ... по ..."
                  readOnly
                  suffix={
                    <ClearOutlined onClick={(e) => {
                      e.stopPropagation()
                      setSearch({ ...search, doned_at: [null, null] })
                    }} />
                  }
                />
                <CalendarPicker
                  allowClear
                  visible={donedAtVisible}
                  selectionMode='range'
                  onClose={() => setDonedAtVisible(false)}
                  onMaskClick={() => setDonedAtVisible(false)}
                  confirmText='Подтвердить'
                  title='Создан с ... по ...'
                  onConfirm={val => {
                    setSearch({
                      ...search,
                      doned_at: [format(val[0], 'dd.MM.yyyy'), format(val[1], 'dd.MM.yyyy')],
                    })
                  }}
                />
              </div>
            </Form.Item>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'column'}}>
              <MCheckbox
                checked={search.do_today ? true : null}
                style={{
                  margin: '8px 0px',
                  '--icon-size': '24px',
                  '--font-size': '14px',
                  '--gap': '6px',
                }}
                onChange={(value) => {
                  setSearch({
                    ...search,
                    do_today: value ? true : null
                  })
                }}
              >
                На сегодня
              </MCheckbox>
              <MCheckbox
                checked={search.actual ? true : null}
                style={{
                  margin: '8px 0px',
                  '--icon-size': '24px',
                  '--font-size': '14px',
                  '--gap': '6px',
                }}
                onChange={(value) => {
                    setSearch({
                        ...search,
                        actual: value ? true : null
                      })
                  }}
              >
                Актуальные(+2д):
              </MCheckbox>
            </div>
          </Form>
        </div>
        <div className={classes.actionBlock}>
          <Button className={classes.actionButton} onClick={(e) => { handleApplaySearch() }}>Применить</Button>
          <Button className={classes.actionButton} style={{backgroundColor: 'white'}} onClick={(e) => { handleClearSearch() }}>Сбросить</Button>
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
