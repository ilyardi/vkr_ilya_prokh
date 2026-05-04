import React from 'react';
import Rest from 'tools/rest';
import {
  Tabs,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  Form,
  Typography,
  Space,
  InputNumber,
  message,
  Empty,
  List,
  Modal,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { debounce, find as _find, forEach as _forEach, map as _map, last as _last, replace as _replace } from 'lodash';
import { toast } from 'react-toastify';
import Preloader from 'components/preloader';
import TypeForm from './components/type_form'
import StatusForm from './components/status_form'
import SubtypeForm from './components/subtype_form'
import './index.css';

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

class RequestStates extends React.Component {
  state = {
    request_types: [],
    request_type_id: null,
    request_subtypes: [],
    request_statuses: [],
    data_relevant: false,
    rt_visible: false,
    rs_visible: false,
    rsubt_visible: false,
    loading: false,
  };

  componentDidMount() {
    this.loadTypes()
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      (prevState.rt_visible !== this.state.rt_visible && !this.state.rt_visible) ||
      (prevState.data_relevant !== this.state.data_relevant && !this.state.data_relevant)
    ) {
      this.loadTypes();
    }
    if (
      prevState.request_type_id !== this.state.request_type_id ||
      (prevState.rs_visible !== this.state.rs_visible && !this.state.rs_visible) ||
      (prevState.data_relevant !== this.state.data_relevant && !this.state.data_relevant)
    ) {
      this.loadStatuses();
    }
    if (
      prevState.request_type_id !== this.state.request_type_id ||
      (prevState.rsubt_visible !== this.state.rsubt_visible && !this.state.rsubt_visible) ||
      (prevState.data_relevant !== this.state.data_relevant && !this.state.data_relevant)
    ) {
      this.loadSubtypes();
    }
  };

  loadTypes() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_types.json`).then(
      (response) => {
        const { request_types } = response.data
        this.setState({ request_types })

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false, data_relevant: true });
      });
  };

  loadStatuses() {
    const { request_type_id } = this.state
    const params = {
      request_type_id: request_type_id,
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_statuses.json`, { params: params }).then(
      (response) => {
        const { request_statuses } = response.data
        this.setState({ request_statuses })

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false, data_relevant: true });
      });
  };

  loadSubtypes() {
    const { request_type_id } = this.state
    const params = {
      request_type_id: request_type_id,
    }
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_subtypes.json`, { params: params }).then(
      (response) => {
        const { request_subtypes } = response.data
        this.setState({ request_subtypes })

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false, data_relevant: true });
      });
  };

  handleClickTableTypesRow = (event, request_type_id) => {
    _forEach(event.target.parentNode.parentNode.children, (children) => {
      children.className = _replace(children.className, ' selected_item', '')
    });
    if (!event.target.parentNode.className.includes(" selected_item")) event.target.parentNode.className += " selected_item";
    this.setState({ request_type_id: request_type_id })
  };



  handleAddItem = (value) => {
    this.setState((prevState) => {
      prevState[value] = true
      return prevState
    })
  };

  handleDeleteStatus = (request_status_id) => {
    Rest.delete(`/api/v1/request_statuses/${request_status_id}.json`).then(
      (response) => {
        const { success } = response.data
        this.setState({ data_relevant: false })
        toast.success('Удалено!');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка удаления!');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleDeleteSubtype = (request_subtype_id) => {
    Rest.delete(`/api/v1/request_subtypes/${request_subtype_id}.json`).then(
      (response) => {
        const { success } = response.data
        this.setState({ data_relevant: false })
        toast.success('Удалено!');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка удаления!');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {

    const {
      loading,
      request_types,
      request_type_id,
      request_statuses,
      request_subtypes,
      rt_visible,
      rs_visible,
      rsubt_visible
    } = this.state

    const do_modal = rt_visible || rs_visible || rsubt_visible

    const columns = [
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
      },
      // {
      //   title: 'Таймер',
      //   dataIndex: 'alert_timer',
      //   key: 'alert_timer',
      //   width: '30%',
      //   render: (value) => {
      //     return (value ? `${parseInt(value / 60)} ч. ${value % 60} м.` : 'отсутствует')
      //   }
      // }
    ];

    const columns_status = [
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Приоритет',
        dataIndex: 'priority',
        key: 'priority',
        width: '15%',
      },
      {
        title: 'По зав.',
        dataIndex: 'after_finish',
        key: 'after_finish',
        width: '20%',
        render: (value) => {
          return (value ? "да" : "нет")
        }
      },
      {
        title: 'Таймер',
        dataIndex: 'alert_timer',
        key: 'alert_timer',
        width: '20%',
        render: (value) => {
          return (value ? `${parseInt(value / 60)} ч. ${value % 60} м.` : 'отсутствует')
        }
      },
      {
        title: '',
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        render: (_, record) => {
          return (
            <Button icon={<DeleteOutlined />} onClick={(event) => this.handleDeleteStatus(record.id)} />
          )
        }
      },
    ];

    const columns_subtype = [
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '',
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        render: (_, record) => {
          return (
            <Button icon={<DeleteOutlined />} onClick={(event) => this.handleDeleteSubtype(record.id)} />
          )
        }
      },
    ];

    const scroll_size = 400

    return (
      <Preloader loading={loading}>
        <React.Fragment>
          <React.Fragment>
            {do_modal &&
              <Modal
                title={`Добавить`}
                visible={do_modal}
                onCancel={() => { this.setState({ rt_visible: false, rs_visible: false, rsubt_visible: false }) }}
                onOk={() => { this.setState({ rt_visible: false, rs_visible: false, rsubt_visible: false }) }}
                footer={false}
                width={'30%'}
              >
                {rt_visible && <TypeForm closer={() => { this.setState({ rt_visible: false }) }} />}
                {rs_visible &&
                  <StatusForm
                    closer={() => { this.setState({ rs_visible: false }) }}
                    request_type_id={request_type_id}
                  />}
                {rsubt_visible &&
                  <SubtypeForm
                    closer={() => { this.setState({ rsubt_visible: false }) }}
                    request_type_id={request_type_id}
                  />}
              </Modal>
            }
          </React.Fragment>
          <Row justify='space-around'>
            <Col span={4}>
              <Row justify='center'>
                <Table
                  title={() =>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Типы</Text>
                      <Button
                        name='rt_visible'
                        style={{ width: '50px', borderRadius: '25px' }}
                        onClick={() => this.handleAddItem('rt_visible')}
                        icon={<PlusOutlined />}
                      />
                    </div>}
                  dataSource={request_types}
                  columns={columns}
                  rowKey={(record) => record.id}
                  pagination={false}
                  scroll={{
                    y: scroll_size,
                  }}
                  size="small"
                  onRow={(record, rowIndex) => {
                    return {
                      onClick: (event) => { this.handleClickTableTypesRow(event, record.id) },
                    };
                  }}
                  bordered={false}
                />
                {/* <div style={{ height: `${scroll_size + 50}px`, border: '1px solid ghostwhite', textAlign: 'center' }}>

                </div> */}
              </Row>
            </Col>
            <Col span={8}>
              <Row justify='center'>
                <Table
                  title={() =>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Подтипы</Text>
                      <Button
                        name='rsubt_visible'
                        style={{ width: '50px', borderRadius: '25px' }}
                        onClick={() => this.handleAddItem('rsubt_visible')}
                        icon={<PlusOutlined />}
                        disabled={!request_type_id}
                      />
                    </div>}
                  dataSource={request_subtypes}
                  columns={columns_subtype}
                  rowKey={(record) => record.id}
                  pagination={false}
                  scroll={{
                    y: scroll_size,
                  }}
                  size="small"
                  bordered={false}
                />
              </Row>
            </Col>
            <Col span={12}>
              <Row justify='center'>
                {/* <div style={{ height: `${scroll_size + 50}px`, border: '1px solid ghostwhite', textAlign: 'center' }}>

                </div> */}

                <Table
                  title={() =>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Статусы</Text>
                      <Button
                        name='rs_visible'
                        style={{ width: '50px', borderRadius: '25px' }}
                        onClick={() => this.handleAddItem('rs_visible')}
                        icon={<PlusOutlined />}
                        disabled={!request_type_id}
                      />
                    </div>}
                  dataSource={request_statuses}
                  columns={columns_status}
                  rowKey={(record) => record.id}
                  pagination={false}
                  scroll={{
                    y: scroll_size,
                  }}
                  size="small"
                  bordered={false}
                />
              </Row>
            </Col>
          </Row>
        </React.Fragment>
      </Preloader >
    );
  }
}

export default RequestStates
