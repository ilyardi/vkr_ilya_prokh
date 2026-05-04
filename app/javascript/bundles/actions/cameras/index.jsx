import React from 'react';
import Rest from 'tools/rest';
import { AbilityContext, Can } from 'tools/ability';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  Table,
  Button,
  Popconfirm,
  Form,
  Input,
  Row,
  Col,
  Tag,
  Radio,
  Typography,
  Modal,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { debounce, isEqual as _isEqual, map as _map, replace as _replace } from 'lodash';
import CameraUpdate from './update';
import CameraNew from './new';
import Preloader from 'components/preloader';

const { Text } = Typography;

class Cameras extends React.Component {
  state = {
    cameras: [],
    visible_edit: false,
    visible_new: false,
    visible_delete: false,
    archive_camera: null,
    selected_camera: {},
    meta: {
      page: 1,
      per: 30,
      total: 0,
      order: 'desc',
      order_by: 'created_at',
    },
    // sorter: {
    //   order: 'asc',
    //   order_by: 'name',
    // },
    search: {},
    loading: false,
    data_relevance: false,
    useDebounce: false,
  };

  loadCameras() {
    const params = {
      ...this.state.meta,
      search: this.state.search,
    };

    this.setState({ loading: true, useDebounce: false });
    Rest.get('api/v1/cameras.json', { params: params }).then((response) => {
      const { meta, cameras } = response.data;
      // let index = 1
      // if (meta.page > 1) { index = meta.page-1 * meta.per }
      let index = ((meta.page - 1) * meta.per) + 1
      const camera_with_index = _map(cameras, (camera) => {
        return {
          ...camera,
          index: index++,
        }
      })
      this.setState({
        cameras: camera_with_index,
        meta: meta,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Камеры', '')
  }

  componentDidMount() {
    document.title += ' | Камеры'
    this.loadCameras();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.meta, this.state.meta) ||
      prevState.data_relevance !== this.state.data_relevance
    ) {
      this.loadCameras();
    } else if (!_isEqual(prevState.search, this.state.search)) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadCameras();
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
        meta: { ...this.state.meta, page: 1 },
        search: { ...this.state.search, [e.target.name]: e.target.value },
      });
    };
  };

  dataRelevanceChange = () => {
    this.setState({ ...this.state, data_relevance: new Date() });
  };

  handleEditCamera = (record) => {
    this.setState({
      selected_camera: record,
      visible_edit: true,
    });
  };

  handleDeleteCamera = (record) => {
    Rest.delete(`api/v1/cameras/${record.id}.json`).then((response) => {
      this.dataRelevanceChange();
    });
  };

  closeEditCamera = () => {
    this.setState({ visible_edit: false });
  };

  closeNewCamera = () => {
    this.setState({ visible_new: false });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const newsorter = {
      order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
      order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    };
    const meta = {
      page: pagination.current,
      per: pagination.pageSize,
      total: pagination.total,
    }
    this.setState({ meta: { ...meta, ...newsorter } });
  };

  handleOpenArchive = (camera) => {
    return (event) => {
      this.setState({ archive_camera: camera });
      event.stopPropagation();
    };
  };

  handleCloseArchive = () => {
    this.setState({ archive_camera: undefined });
  };

  render() {
    const { cameras, visible_edit, visible_new, selected_camera, archive_camera, search, meta } =
      this.state;

    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      showSizeChanger: true,
    };

    const columns_cameras = [
      {
        title: '№',
        dataIndex: "id",
        width: '20px',
      },
      {
        title: 'Тип',
        dataIndex: 'camera_type',
        type: 'radio',
        width: '200',
        render: (val) => {
          switch (val) {
            case 'free':
              return <Tag color="green">Городская</Tag>;
            case 'home':
              return <Tag color="blue">Домовая</Tag>;
            case 'business':
              return <Tag color="red">Частная</Tag>;
          }
        },
      },
      {
        title: 'Название',
        dataIndex: 'name',
        sorter: true,
        render: (val, record) => {
          return (
            <>
              {val}
              <Can do="archive" on="Camera">
                <Button type="link" onClick={this.handleOpenArchive(record)}>
                  <DownloadOutlined />
                </Button>
              </Can>
              <Can do="update" on="Camera">
                <br />
                {record.token}
              </Can>
            </>
          );
        },
      },
      {
        title: 'Архив',
        dataIndex: 'is_archive',
        width: '20',
        render: (_, record) => (record.is_archive ? <CheckCircleOutlined /> : ''),
      },
      {
        title: 'Улица',
        dataIndex: 'street',
        sorter: true,
        render: (val, record) => {
          return (
            <Text>
              {val}
              {record.building && ', '}
              {record.building}
            </Text>
          );
        },
      },
      {
        title: 'Координаты',
        dataIndex: 'latitude',
        render: (_, record) => {
          const lat = record.latitude ? Number(record.latitude).toFixed(7) : '';
          const lon = record.longitude ? Number(record.longitude).toFixed(7) : '';

          return (
            <Text>
              {lat}
              {lon && ', '}
              {lon}
            </Text>
          );
        },
      },
      {
        title: 'Включена',
        dataIndex: 'active',
        width: '20',
        render: (_, record) => (record.active ? <CheckCircleOutlined /> : ''),
      },
      {
        title: '',
        dataIndex: 'action',
        width: 'auto',
        render: (_, record) => (
          <React.Fragment>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Can do="delete" on="Camera">
                <Popconfirm
                  placement="left"
                  title="Вы уверены, что хотите удалить Камеру?"
                  onConfirm={(e) => {
                    e.stopPropagation();
                    this.handleDeleteCamera(record);
                  }}
                  onCancel={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button title="Удалить камеру" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Can>
            </div>
          </React.Fragment>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Preloader loading={this.state.loading}>
          <PageHeader
            title="Камеры"
            style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
            extra={[
              <Can do="create" on="Camera" key="1">
                <Button
                  title="Добавить камеру"
                  key="add"
                  onClick={() => {
                    this.setState({ visible_new: true });
                  }}
                >
                  Добавить камеру
                </Button>
              </Can>,
            ]}
          />
          {visible_edit && (
            <CameraUpdate
              visible={visible_edit}
              closer={this.closeEditCamera}
              selected_camera={selected_camera}
              dataRelevanceChange={this.dataRelevanceChange}
            />
          )}
          {visible_new && (
            <CameraNew
              visible={visible_new}
              closer={this.closeNewCamera}
              dataRelevanceChange={this.dataRelevanceChange}
            />
          )}
          {archive_camera && (
            <Modal
              title="Архив камеры"
              visible={!!archive_camera}
              onCancel={this.handleCloseArchive}
              onOk={this.handleCloseArchive}
              footer={null}
              width="90%"
            >
              <iframe src={archive_camera.archive_url} width="100%" height="600px" border="0" />
            </Modal>
          )}
          <Row justify="space-between">
            <Col>
              <Form layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item>
                  <Input
                    name="id"
                    value={search.id}
                    placeholder="Номер"
                    onChange={this.handleChangeText('id')}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    name="name"
                    value={search.name}
                    placeholder="Название"
                    onChange={this.handleChangeText('name')}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    name="token"
                    value={search.token}
                    placeholder="Идентификатор"
                    onChange={this.handleChangeText('token')}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    name="street"
                    value={search.street}
                    placeholder="Улица"
                    onChange={this.handleChangeText('street')}
                  />
                </Form.Item>
                <Form.Item>
                  <Radio.Group
                    name="camera_type"
                    value={search.camera_type}
                    onChange={this.handleChangeText('camera_type')}
                  >
                    <Radio.Button>Все типы</Radio.Button>
                    <Radio.Button value="free">Городские</Radio.Button>
                    <Radio.Button value="home">Домовые</Radio.Button>
                    <Radio.Button value="business">Частные</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            rowKey={(record) => record.id}
            columns={columns_cameras}
            dataSource={cameras}
            pagination={pagination}
            onChange={this.handleTableChange}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => { this.setState({ visible_edit: true, selected_camera: record }) },
              };
            }}
          />
        </Preloader>
      </React.Fragment>
    );
  }
}

export default Cameras;
