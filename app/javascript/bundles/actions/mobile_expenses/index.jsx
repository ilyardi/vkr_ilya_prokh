import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  ConfigProvider,
  Table,
  Pagination,
  List,
  Typography,
  Col,
  Row,
  Button,
  message,
} from 'antd';
import { Popup, Tabs, InfiniteScroll } from 'antd-mobile'
import { sleep } from 'antd-mobile/es/utils/sleep'
import {
  FlagOutlined,
  CheckOutlined,
  PlusOutlined,
  CloseOutlined,
  SlidersOutlined,
  DownOutlined,
  ReloadOutlined,
  FlagFilled,
} from '@ant-design/icons';
import {
  find as _find,
  remove as _remove,
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

import { QueryMixin } from 'components/mobile_query_mixin';
import FilterPanel from './filter_panel';
import MobileSearchTemplatesPanel from 'components/mobile_search_templates_panel'

const {Text} = Typography;

const MobileExpenses = (props) => {

  const [messageApi, contextHolder] = message.useMessage();

  const toastify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const query = new QueryMixin(props)

  const { classes, match } = props;
  const [expensesCashed, setExpensesCashed] = useState([]);
  const [selectedExpIds, setSelectedExpIds] = useState([]);
  const [selectable, setSelectable] = useState(false);
  const [ meta, setMeta ] = useState({
    page: 1,
    per: 20,
    total: 0,
    order: query.getParam('order'),
    order_by: query.getParam('order_by'),
  });
  const [search, setSearch] = useState({
    number: query.getParam('number'),
    name: query.getParam('name'),
    amount_min: query.getParam('amount_min'),
    amount_max: query.getParam('amount_max'),
    author_id: query.getParam('aythor_id'),
    executor_id: query.getParam('executor_id'),
    expense_type_id: query.getParam('expense_type_id'),
    expense_stage_id: query.getParam('expense_stage_id'),
    expense_purposes: query.getParam('expense_purposes'),
    pay_type: query.getParam('pay_type'),
    expense_counterparty_id: query.getParam('expense_counterparty_id'),
    created_at: query.getParam('created_at') || [null, null],
    date_payment: query.getParam('date_payment') || [null, null],
    plan_date_payment: query.getParam('plan_date_payment') || [null, null],
    status: query.getParam('status'),
    expense_company_id: query.getParam('expense_company_id'),
    show_all: query.getParam('show_all') || null,
    hide_closed: query.getParam('hide_closed') || true,
    flow_rate: query.getParam('flow_rate') || null,
  });
  const [visibleFilters, setVisibleFilters] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    const params = {
      page: meta.page,
      per: meta.per,
      order: meta.order,
      order_by: meta.order_by,
      search: search,
    };
    query.setParams({
              ...search,
              created_at: [search.created_at[0], search.created_at[1]]
            })
    setLoading(true);
    Rest.get('/api/v1/expenses.json', { params: params }).then(
      (response) => {
        const { expenses, meta, total } = response.data;
        const new_expenses = meta.page == 1 ? expenses : [...expensesCashed, ...expenses]
        setExpensesCashed(new_expenses)
        setMeta(meta)
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateSelected = (action) => {
    const params = {
      expense_ids_selected: selectedExpIds,
      operation: action,
    }
    setErrors({})
    setLoading(true)
    Rest.put(`/api/v1/expenses/batch_update.json`, params).then(
      (response) => {
        const { errors, expenses } = response.data;
        if (_isEqual(errors, {})) {
          toastify('success', 'Изменения сохранены')
        }
        else {
          toastify('error', `Невозможно ${action == 'confirm' ? "согласовать" : "отменить" } расходы: ${_map(errors, (v, k)=>(String(k))).join(", ")}`);
        }
      }).catch((e) => {
        toastify('error', 'Ошибка выполнения операции');
      })
      .finally(() => {
        setLoading(false);
        setSelectedExpIds([]);
        setSelectable(false);
        handleReloadData();
      });
  };

  const handleReloadData = () => {
    setLoading(true);
    if (meta.page == 1) {
      loadData()
    } else {
      setMeta({
        ...meta,
        page: 1
      })
    }
  };

  const loadMore = () => {
    if (!loading) {
      setMeta({
        ...meta,
        page: meta.page + 1
      })
    }
  };

  const applyFilters = (search) => {
    setSearch(search);
    setMeta({
      ...meta,
      page: 1
    })
  };

  const closeFilters = () => {
    setVisibleFilters(false)
  };

  const handleSetSearch = (searchParams) => {
    setSearch({
      // ...search,
      ...searchParams
    });
    setMeta({
      ...meta,
      page: 1
    })
  };

  useEffect(() => {
    loadData();
  }, [search, meta.page]);

  useEffect(() => {
    if (!selectable) {
      setSelectedExpIds([])
    }
  }, [selectable]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#8f00ff82',
            itemSelectedColor: '#FFFFFF',
            itemColor: '#FFFFFF',
          },
        },
      }}
    >
      {contextHolder}
      {visibleFilters &&
        <FilterPanel
          search={search}
          visible={visibleFilters}
          applyFilters={applyFilters}
          closeFilters={closeFilters}
        />
      }
      <div className={classes.reloadData} onClick={handleReloadData}>
        <ReloadOutlined />
      </div>
      <div className={classes.main}>
        <Tabs
          activeKey={search.show_all ? 'all' : 'actual'}
          onChange={(key) => {
            setSearch({
              ...search,
              show_all: key == 'all' ? true : null
            })
            setMeta({
              ...meta,
              page: 1
            })
          }}
          style={{ backgroundColor: 'inherit', borderBottom: '0px', height: '40px' }}
        >
          <Tabs.Tab title='Актуальные' key='actual'>
          </Tabs.Tab>
          <Tabs.Tab title='Все' key='all'>
          </Tabs.Tab>
        </Tabs>
        <MobileSearchTemplatesPanel searchParams={search} setSearchParams={handleSetSearch} searchableType="expense" />
        <div className={classes.expenses}>
          <List
            loading={loading}
            dataSource={expensesCashed}
            renderItem={(expense)=>(
              <Link
                onClick={(e)=>{
                  if (selectable) {
                    e.preventDefault()
                  }
                }}
                to={`/m/expenses/${expense.id}`}
              >
                <List.Item
                  key={expense.id}
                  className={`${classes.expense} ${_includes(selectedExpIds, expense.id) ? classes.hoveredExp : ''}`}
                  // style={{padding: '10px'}}
                  style={{ padding: '10px', border: '1px solid #cfb3cf' }}
                  onClick={()=>{
                    if (!selectable) {return}
                    let newSelectedExpIds = selectedExpIds
                    _includes(selectedExpIds, expense.id) ?
                    _pull(newSelectedExpIds, expense.id) :
                    newSelectedExpIds.push(expense.id)
                    setSelectedExpIds(prevState => [...newSelectedExpIds])
                  }}
                >
                  <Row style={{width: '100%'}} >
                    {/* <Col span={4} style={{textAlign: 'center'}} className={classes.expenseDesc}>{expense.id}</Col> */}
                    {/* <Col span={24} className={classes.expenseDesc}>{expense.name ? expense.name.slice(0, 27) + '...' : null}</Col> */}
                    <Col span={24} className={classes.expenseDesc}>{expense.name}</Col>
                  </Row>
                </List.Item>
              </Link>
            )}
          />
          <InfiniteScroll loadMore={loadMore} hasMore={!(expensesCashed.length == meta.total)}>
            <>{''}</>
          </InfiniteScroll>
        </div>
      </div>
      <div className={classes.actions}>
        <Button
          onClick={(e)=> { setSelectable(!selectable) }}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={search?.show_all}
        >
          <div className={classes.actionBlock}>
            {selectable ?
              <FlagFilled className={classes.actionIcon}/>
              :
              <FlagOutlined className={classes.actionIcon} />
            }
            <Text className={classes.actionLable}>Выделить</Text>
          </div>
        </Button>
        <Button
          onClick={(e)=>{handleUpdateSelected('confirm')}}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={!(selectedExpIds.length > 0)}
        >
          <div className={classes.actionBlock}>
            <CheckOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Согласовать</Text>
          </div>
        </Button>
        <Link to={`/m/expenses/create`}>
          <div className={classes.actionBlock}>
            <PlusOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Добавить</Text>
          </div>
        </Link>
        <Button
          onClick={(e)=>{handleUpdateSelected('decline')}}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
          disabled={!(selectedExpIds.length > 0)}
        >
          <div className={classes.actionBlock}>
            <CloseOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Отменить</Text>
          </div>
        </Button>
        <Button
          onClick={(e)=> { setVisibleFilters(true) }}
          style={{margin: '0', padding: '0', border:'none', height: 'inherit', background: 'none'}}
        >
          <div className={classes.actionBlock}>
            <SlidersOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Фильтр</Text>
          </div>
        </Button>
      </div>
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  main: {
    height: '100%',
    width: '100%',
    padding: '9px 10px',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
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
  expenses: {
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    height: '88%',
  },
  expense: {
    backgroundColor: '#CDA5E58F',
    margin: '4px 1px',
    borderRadius: '20px',
  },
  expenseDesc: {
    lineHeight: '24px',
    fontSize: '18px',
    minHeight: '35px',
    display: 'flex',
    alignItems: 'center',
    overflowX: 'scroll',
    textWrap: 'nowrap',
    scrollbarWidth: 'none',
  },
  hoveredExp: {
    backgroundColor: '#B54EF48F'
  },
  showLoadmore: {
    display: 'flex',
    justifyContent: 'center'
  },
  hideLoadmore: {
    display: 'none',
  },
  reloadData: {
    width: '80px',
    height: '8vh',
    display: 'flex',
    justifyContent: 'space-evenly',
    position: 'absolute',
    top: '0px',
    left: '80px',
    fontSize: '30px',
    color: '#59059B',
    zIndex: '2',
  },
  filterPanel: {
    width: '100%',
    height: '100%',
    background: "linear-gradient(180deg, #FFFFFF 0%, #CDA5E6 100%)",
  },
});


const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(MobileExpenses));
