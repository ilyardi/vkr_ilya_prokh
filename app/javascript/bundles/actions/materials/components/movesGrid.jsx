import React from 'react';
import Rest from 'tools/rest';
import { Table, Input, Select, Tag, DatePicker, Row, Col, Form } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import Preloader from 'components/preloader';
import { parseISO as _parseISO, format } from 'date-fns';
import UserSelect from 'components/user_search';

const { Option } = Select;
const { RangePicker } = DatePicker;

class MaterialMovesGrid extends React.Component {
  state = {
    material_moves: [],
    warehouse_users: [],
    meta: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sorter: {
      order: 'desc',
      order_by: 'created_at',
    },
    search: {},
    loading: false,
    useDebounce: false,
  };

  constructor(props) {
    super(props);
    if (props.material && props.material.id) {
      this.state = {
        ...this.state,
        search: {
          material_id: props.material.id,
        },
        material_name: props.material.name,
      };
    }
  }

  loadMaterialMoves = () => {
    const params = {
      current: this.state.meta.current,
      page_size: this.state.meta.pageSize,
      order: this.state.sorter.order,
      order_by: this.state.sorter.order_by,
      search: {
        material_id: this.state.search.material_id,
        operation_type: this.state.search.operation_type,
        warehouse_material: this.state.search.warehouse_material,
        created_by: this.state.search.created_by,
        user: this.state.search.user,
        time_range: {
          start: this.state.search.start_time_range,
          end: this.state.search.end_time_range,
        },
      },
    };
    this.setState({ loading: true, useDebounce: false });
    Rest.get('/api/v1/warehouse_material_moves.json', { params: params }).then((response) => {
      this.setState({
        material_moves: response.data.material_moves,
        meta: {
          current: response.data.meta.current,
          pageSize: response.data.meta.pageSize,
          total: response.data.meta.total,
        },
        sorter: {
          order: response.data.meta.order,
          order_by: response.data.meta.orderBy,
        },
        loading: false,
      });
    });
  };

  componentDidMount() {
    this.loadMaterialMoves();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.sorter.order !== this.state.sorter.order ||
      prevState.sorter.order_by !== this.state.sorter.order_by ||
      prevState.meta.current !== this.state.meta.current ||
      prevState.meta.pageSize !== this.state.meta.pageSize ||
      prevState.search.operation_type !== this.state.search.operation_type ||
      prevState.search.start_time_range !== this.state.search.start_time_range ||
      prevState.search.end_time_range !== this.state.search.end_time_range ||
      prevProps.moves_relevance !== this.props.moves_relevance ||
      prevState.search.created_by !== this.state.search.created_by ||
      prevState.search.user !== this.state.search.user
    ) {
      this.loadMaterialMoves();
    }
    if (prevState.search.warehouse_material !== this.state.search.warehouse_material) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadMaterialMoves();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  }

  handleChangeText = () => {
    return (e) => {
      this.setState({
        useDebounce: true,
        meta: { ...this.state.meta, current: 1 },
        search: { ...this.state.search, [e.target.name]: e.target.value },
      });
    };
  };

  handleChangeOperationType = (e) => {
    this.setState({
      meta: { ...this.state.meta, current: 1 },
      search: { ...this.state.search, operation_type: e },
    });
  };

  handleChangeUser = (_, e) => {
    this.setState({
      search: {
        ...this.state.search,
        user: e ? e.value : undefined,
      },
    });
  };

  handleChangeCreatedBy = (_, e) => {
    this.setState({
      search: {
        ...this.state.search,
        created_by: e ? e.value : undefined,
      },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const newsorter = {
      order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
      order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    };
    this.setState({ meta: pagination, sorter: newsorter });
  };

  onChangeDate = (data, dateString) => {
    if (data != null) {
      this.setState({
        search: {
          ...this.state.search,
          start_time_range: data[0]._d,
          end_time_range: data[1]._d,
        },
      });
    } else {
      this.setState({
        search: {
          ...this.state.search,
          start_time_range: undefined,
          end_time_range: undefined,
        },
      });
    }
  };

  render() {
    const { loading, material_moves, search } = this.state;
    const pagination = {
      ...this.state.meta,
      showSizeChanger: true,
    };
    const hasMaterial = search.material_id != null;

    let columns_without_material = [
      {
        title: 'Тип операции',
        dataIndex: 'operation_type',
        width: '10%',
        render: (_, record) => {
          return record.operation_type == 'in' ? (
            <Tag color={'green'}>Приход</Tag>
          ) : (
            <Tag color={'volcano'}>Расход</Tag>
          );
        },
      },
      // {
      //   title: 'Название',
      //   dataIndex: "warehouse_materials",
      //   sorter: true,
      //   render: (_, record) => {
      //     return record.warehouse_material.name;
      //   },
      // },
      {
        title: 'Кол-во',
        dataIndex: 'quantity',
        width: '7%',
      },
      {
        title: 'Исполнитель',
        dataIndex: 'created_by',
        width: '10%',
        render: (_, record) => {
          return record.created_by.name;
        },
      },
      {
        title: 'Получатель',
        dataIndex: 'user_id',
        width: '10%',
        render: (_, record) => {
          return record.user.name;
        },
      },
      {
        title: 'Дата операции',
        dataIndex: 'created_at',
        sorter: true,
        width: '15%',
        render: (_, record) => {
          const date = format(_parseISO(record.created_at), 'dd/MM/yyyy HH:mm:ss');
          return date;
        },
      },
    ];

    if (!hasMaterial) {
      columns_without_material.splice(2, 0, {
        title: 'Название',
        dataIndex: 'warehouse_materials',
        sorter: true,
        render: (_, record) => {
          return record.warehouse_material.name;
        },
      });
    }

    const columns_material_moves = columns_without_material;

    return (
      <Preloader loading={loading}>
        <React.Fragment>
          {hasMaterial && <PageHeader title={this.state.material_name} />}
          <Row justify="space-between">
            <Col>
              <Form layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item>
                  <Select
                    name={'operation_type'}
                    onChange={this.handleChangeOperationType}
                    value={search.operation_type}
                    placeholder="Тип операции"
                    style={{ width: 120 }}
                    allowClear
                  >
                    <Option key={1}>Приход</Option>
                    <Option key={-1}>Расход</Option>
                  </Select>
                </Form.Item>
                {!hasMaterial && (
                  <Form.Item>
                    <Input
                      name="warehouse_material"
                      value={search.warehouse_material}
                      placeholder="Название материала"
                      onChange={this.handleChangeText('warehouse_material')}
                    />
                  </Form.Item>
                )}
                <Form.Item>
                  {/* <Input
                    name="created_by"
                    value={search.created_by}
                    placeholder="Исполнитель"
                    onChange={this.handleChangeText('created_by')}
                  /> */}
                  <UserSelect
                    placeholder='Исполнитель'
                    scope='warehouse_users'
                    onChange={this.handleChangeCreatedBy}
                    value={search.created_by}
                    style={{ width: "150px" }}
                  />
                </Form.Item>
                <Form.Item>
                  {/* <Input
                    name="user"
                    value={search.user}
                    placeholder="Получатель"
                    onChange={this.handleChangeText('user')}
                  /> */}
                  <UserSelect
                    placeholder='Получатель'
                    scope='warehouse_users'
                    onChange={this.handleChangeUser}
                    value={search.user}
                    style={{ width: "150px" }}
                  />
                </Form.Item>
                <Form.Item>
                  <RangePicker
                    onChange={this.onChangeDate}
                    showTime={{
                      defaultValue: [
                        dayjs('00:00:00', 'HH:mm:ss'),
                        dayjs('23:59:59', 'HH:mm:ss'),
                      ],
                    }}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Table
            columns={columns_material_moves}
            dataSource={material_moves}
            rowKey={(record) => record.id}
            pagination={pagination}
            onChange={this.handleTableChange}
            size="small"
          />
        </React.Fragment>
      </Preloader>
    );
  }
}

export default MaterialMovesGrid;
