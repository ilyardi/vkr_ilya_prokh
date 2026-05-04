import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  ConfigProvider,
  List,
  Typography,
  Col,
  Row,
  Button,
  message,
} from 'antd';
import {
  Popup,
  Tabs,
  Selector,
  InfiniteScroll,
  Ellipsis,
  Swiper,
} from 'antd-mobile'
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

const MobileRequests = (props) => {

  const [messageApi, contextHolder] = message.useMessage();

  const toastify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const query = new QueryMixin(props)

  const { classes, match } = props;
  const [requestsCashed, setRequestsCashed] = useState([]);
  const [ meta, setMeta ] = useState({
    page: 1,
    per: 20,
    total: 0,
    order: query.getParam('order'),
    order_by: query.getParam('order_by'),
  });
  const [search, setSearch] = useState({
    number: query.getParam('number'),
    actual: query.getParam('actual'),
    show_all: query.getParam('show_all') || null,
    request_type_id: query.getParam('request_type_id'),
    request_statuses: query.getParam('request_statuses') || [],
    responsible_user_id: query.getParam('responsible_user_id'),
    executor_user_id: query.getParam('executor_user_id'),
    created_at: query.getParam('created_at') || [null, null],
    doned_at: query.getParam('doned_at') || [null, null],
    do_today: query.getParam('do_today'),
    street_id: query.getParam('street_id'),
    building_id: query.getParam('building_id'),
    entrance_id: query.getParam('entrance_id'),
    flat_id: query.getParam('flat_id'),
    request_reasons: query.getParam('request_reasons') || [],
    request_subtypes: query.getParam('request_subtypes') || [],
  });
  const [visibleFilters, setVisibleFilters] = useState(false);
  const [errors, setErrors] = useState({});
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
    Rest.get('/api/v1/requests.json', { params: params }).then(
      (response) => {
        const { requests, meta, total } = response.data;
        const new_requests = meta.page == 1 ? requests : [...requestsCashed, ...requests]
        setRequestsCashed(new_requests)
        setMeta(meta)
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleReloadData = () => {
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
        page: meta.page+1
      })
    }
  };

  // const handleCloseFilters = (search) => {
  //   setVisibleFilters(false)
  //   setSearch(search);
  //   setMeta({
  //     ...meta,
  //     page: 1
  //   })
  // }

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
        },
      }}
    >
      {contextHolder}
      <div className={classes.reloadData} onClick={handleReloadData}>
        <ReloadOutlined />
      </div>
      {visibleFilters  &&
        <FilterPanel
          search={search}
          visible={visibleFilters}
          applyFilters={applyFilters}
          closeFilters={closeFilters}
        />
      }
      <div className={classes.main}>
        <Tabs
          activeKey={search.show_all ? 'all' : 'actual'}
          onChange={(key) => {
            setSearch({
              ...search,
              show_all: key == 'all' ? true : null,
            })
            setMeta({
              ...meta,
              page: 1
            })
          }}
          style={{ backgroundColor: 'inherit', height: '40px' }}
        >
          <Tabs.Tab title='Основные' key='actual'>
          </Tabs.Tab>
          <Tabs.Tab title='Все' key='all'>
          </Tabs.Tab>
        </Tabs>
        <MobileSearchTemplatesPanel searchParams={search} setSearchParams={handleSetSearch} searchableType="request" />
        <div className={classes.requests}>
          <List
            loading={loading}
            dataSource={requestsCashed}
            renderItem={(request) => (
              <Link to={`/m/requests/${request.id}`}>
                <List.Item
                  key={request.id}
                  className={`${classes.request}`}
                  style={{ padding: '10px', border: '1px solid #cfb3cf' }}
                >
                  <Row style={{ width: '100%' }}>
                    {/* <Col span={24} className={classes.requestDesc}>{request.description ? request.description.slice(0, 27) + '...' : null}</Col> */}
                    <Col span={24} className={classes.requestDesc}>{request.description}</Col>
                    {/* <Ellipsis className={classes.requestDesc} direction='end' content={request.description ? request.description : ''} /> */}
                  </Row>
                </List.Item>
              </Link>
            )}
          // className={classes.requests}
          // footer={
          //   <div
          //     onClick={()=>{
          //       setMeta({
          //         ...meta,
          //         page: meta.page+1
          //       })
          //     }}
          //     className={requestsCashed.length == meta.total ? classes.hideLoadmore : classes.showLoadmore}
          //   >
          //     <DownOutlined />
          //   </div>
          // }
          />
          <InfiniteScroll loadMore={loadMore} hasMore={!(requestsCashed.length == meta.total)}>
            <>{''}</>
          </InfiniteScroll>
        </div>
      </div>
      <div className={classes.actions}>
        <Link to={`/m/requests/create`}>
          <div className={classes.actionBlock}>
            <PlusOutlined className={classes.actionIcon} />
            <Text className={classes.actionLable}>Добавить</Text>
          </div>
        </Link>
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
  requests: {
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    height: '88%',
  },
  request: {
    backgroundColor: '#CDA5E58F',
    margin: '2px 1px',
    borderRadius: '20px',
  },
  requestDesc: {
    lineHeight: '24px',
    fontSize: '18px',
    minHeight: '35px',
    display: 'flex',
    alignItems: 'center',
    overflowX: 'scroll',
    textWrap: 'nowrap',
    scrollbarWidth: 'none',
  },
  hoveredReq: {
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

export default connect(mapStateToProps, null)(withStyles(styles)(MobileRequests));
