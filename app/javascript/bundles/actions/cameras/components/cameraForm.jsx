import React, { Fragment } from 'react';
import Rest from 'tools/rest';
import { AbilityContext, Can } from 'tools/ability';
import { DeleteOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { latLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const cameraIconUrl =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBmaWxsPSJibGFjayIgZD0iTTkuODI4IDVsLTIgMkg0djEyaDE2VjdoLTMuODI4bC0yLTJIOS44Mjh6TTEyIDE3YTQgNCAwIDEgMSAwLTggNCA0IDAgMCAxIDAgOHptMC0yYTIgMiAwIDEgMCAwLTQgMiAyIDAgMCAwIDAgNHoiLz48L3N2Zz4=';

const customIcon = new L.Icon({
  iconUrl: cameraIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 20],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

import {
  Tabs,
  Table,
  Typography,
  Row,
  Col,
  Form,
  Radio,
  Input,
  Switch,
  Button,
  InputNumber,
  Popconfirm,
  Select,
  Divider,
  Collapse,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { find as _find, map as _map, last as _last, includes as _includes } from 'lodash';
import { toast } from 'react-toastify';
import UserSearchModal from 'components/user_search_modal';
import CameraPlayer from 'components/camera-player';
import { ThreeDRotationSharp } from '@material-ui/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Text } = Typography;

function MapEventsHandler ({ onMapClick }) {
  const map = useMapEvents({
    click(event) {
      onMapClick(event.latlng);
      map.setView(event.latlng, map.getZoom());
    },
  });
  return null;
}

class CameraForm extends React.Component {
  state = {
    camera: {
      id: null,
      name: null,
      token: null,
      slug: null,
      is_archive: false,
      is_private: false,
      street: null,
      building: null,
      latitude: 0,
      longitude: 0,
      secure_token: null,
      camera_type: 'free',
      active: false,
      server_id: 1,
    },
    coords: null,
    errors: null,
    agreements: [],
    options: [
      { label: 'Городская', value: 'free' },
      { label: 'Домовая', value: 'home' },
      { label: 'Частная', value: 'business' },
    ],
    visible_add_agreement: false,
    buildings: [],
  };

  streets = [];

  constructor(props) {
    super(props);
    if (props.camera && props.camera.id) {
      this.state = {
        ...this.state,
        camera: props.camera,
        agreements: props.agreements,
      };
    }
  }

  componentDidMount() {
    this.loadStreets()
    if (this.state.camera.street) { this.loadBuildings(this.state.camera.street) }
  }

  loadStreets = () => {
    this.setState({ loading: true });
    Rest.get(`/api/v1/addresses.json`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        this.streets = _map(suggestions, (s) => {
          return { label: s.value, value: s.value, key: s.id }
        })
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });cameras
      });
  };

  loadBuildings = (street) => {
    this.setState({ loading: true });
    Rest.get(`/api/v1/addresses/houses.json?street=${street}`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        this.setState({
          buildings: _map(suggestions, (s) => {
            return { label: s.value, value: s.value, key: s.id };
          })
        });
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  validateCameraByType(value) {
    let camera = value.camera;
    switch (camera.camera_type) {
      case 'free':
        camera = { ...camera, is_private: false, street: null, building: null };
        break;
      case 'home':
        camera = { ...camera, is_private: false };
        break;
      case 'business':
        camera = { ...camera, is_private: true, street: null, building: null };
        break;
    }
    return camera;
  }

  handleAddAgreement = (v) => {
    Rest.post(`api/v1/cameras/${this.state.camera.id}/add_agreement/${v.id}.json`)
      .then((response) => {
        this.setState({ agreements: [...this.state.agreements, response.data.agreement] });
        toast.success('Договор закреплен');
      })
      .catch((err) => {
        // toast.error('Ошибка добавления договора');
      });
  };

  deleteAgreement = (agrm_id) => {
    Rest.post(`api/v1/cameras/${this.state.camera.id}/delete_agreement/${agrm_id}.json`)
      .then((response) => {
        this.setState({
          agreements: this.state.agreements.filter(
            (item) => item.agrm_id !== response.data.agreement.agrm_id,
          ),
        });
        toast.success('Договор откреплен');
      })
      .catch((err) => {
        if (err.response.status === 404) {
          toast.warn('Ошибка открепления договора, договор уже откреплен');
          this.setState({
            agreements: this.state.agreements.filter((item) => item.agrm_id !== agrm_id),
          });
        } else {
          console.error('Ошибка открепления договора', err);
          toast.error('Ошибка открепления договора');
        }
      });
  };

  closeAddAgreement = () => {
    this.setState({ visible_add_agreement: false });
  };

  handleCreateNewCamera = (value) => {
    console.log(value)
    const camera = this.validateCameraByType(value);
    Rest.post('api/v1/cameras.json', camera)
      .then((response) => {
        this.setState({ camera: response.data.camera, errors: null });
        toast.success('Сохранено');
      })
      .catch((err) => {
        this.setState({ errors: err.response.data.camera.errors });
        toast.error('Ошибка создания');
      });
  };

  handleUpdateCamera = (value) => {
    const id = this.state.camera.id;
    const camera = this.validateCameraByType(value);
    Rest.put(`api/v1/cameras/${id}.json`, camera)
      .then((response) => {
        this.setState({ camera: response.data.camera, errors: null });
        toast.success('Сохранено');
      })
      .catch((err) => {
        this.setState({ errors: err.response.data.camera.errors });
        toast.error('Ошибка изменения');
      });
  };

  render() {
    const { camera, errors, options, agreements, visible_add_agreement, buildings } = this.state;

    const isCreating = camera.id == null;

    const onFinish = isCreating ? this.handleCreateNewCamera : this.handleUpdateCamera;

    const fields = _map(camera, (value, key) => {
      return {
        name: ['camera', key],
        value: value,
        errors: errors ? errors[key] : [],
      };
    });

    let columns_agreement = [
      {
        title: 'ID',
        dataIndex: 'agrm_id',
      },
      {
        title: 'Абонент',
        dataIndex: 'name',
      },
      {
        title: 'Номер договора',
        dataIndex: 'number',
      },
    ];
    if (this.context.can('update', 'Camera')) {
      columns_agreement = [...columns_agreement, {
        title: '',
        render: (_, record) => (
          <Popconfirm
            placement="left"
            title="Вы уверены, что хотите открепить договор?"
            onConfirm={() => this.deleteAgreement(record.agrm_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button title="Открепить договор" icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      }];
    };
    const operations = (
      <React.Fragment>
        <Can do="update" on="Camera">
          <Button
            style={{ margin: '12px' }}
            type="button"
            onClick={() => {
              this.setState({ visible_add_agreement: true });
            }}
            disabled={isCreating || camera.camera_type == 'free'}
          >
            Добавить договор
          </Button>
        </Can>
      </React.Fragment>
    );
    return (
      <React.Fragment>
        {this.state.visible_add_agreement && (
          <UserSearchModal
            isSearchUserModalVisible={visible_add_agreement}
            handleCancelShowSearchUserModal={this.closeAddAgreement}
            handleLocationAgreements={this.handleAddAgreement}
            handleCloseModal={this.closeAddAgreement}
          />
        )}
        <Row>
          <Col span={9}>
            <Form
              fields={fields}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              onFinish={onFinish}
              style={{ margin: '12px 20px', paddingTop: 12 }}
              onFieldsChange={(changedFields, allFields) => {
                _map(changedFields, (v) => {
                  if (_last(v.name) == 'street') this.loadBuildings(v.value);
                  this.setState((prevState) => {
                    prevState.camera[_last(v.name)] = v.value;
                    prevState.errors ? (prevState.errors[_last(v.name)] = []) : null;
                    return prevState;
                  });
                });
              }}
            >
              <Form.Item name={['camera', 'camera_type']} label="Тип камеры">
                {this.context.can('update', 'Camera') ?
                  <Radio.Group options={options} optionType="button" />
                  :
                  <Text>{_find(options, { value: this.state.camera?.camera_type })?.label}</Text>
                }
              </Form.Item>
              <div>
                {camera.camera_type === 'home' && (
                  <>
                    <Form.Item
                      label='Улица:'
                      name={['camera', 'street']}
                    >
                      {this.context.can('update', 'Camera') ?
                        <Select
                          allowClear
                          showSearch
                          placeholder='Улица'
                          optionFilterProp="children"
                          filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                          options={this.streets}
                        />
                        :
                        <Text>{this.state.camera?.street}</Text>
                      }
                    </Form.Item>
                    <Form.Item
                      label='Дом:'
                      name={['camera', 'building']}
                    >
                      {this.context.can('update', 'Camera') ?
                        <Select
                          allowClear
                          showSearch
                          disabled={camera.street ? false : true}
                          placeholder='дом'
                          optionFilterProp="children"
                          filterOption={(input, option) => _includes(option.label, input)}
                          options={buildings}
                        />
                        :
                        <Text>{this.state.camera?.building}</Text>
                      }
                    </Form.Item>
                  </>
                )}
                <Form.Item name={['camera', 'model']} label="Модель">
                  {this.context.can('update', 'Camera') ?
                    <Input />
                    :
                    <Text>{this.state.camera?.model}</Text>
                  }
                </Form.Item>
                <Form.Item name={['camera', 'serial']} label="Серийный номер">
                  {this.context.can('update', 'Camera') ?
                    <Input />
                    :
                    <Text>{this.state.camera?.serial}</Text>
                  }
                </Form.Item>
                <Form.Item name={['camera', 'mac']} label="MAC адрес">
                  {this.context.can('update', 'Camera') ?
                    <Input />
                    :
                    <Text>{this.state.camera?.mac}</Text>
                  }
                </Form.Item>
                <Form.Item name={['camera', 'ip']} label="IP адрес">
                  {this.context.can('update', 'Camera') ?
                    <Input />
                    :
                    <Text>{this.state.camera?.ip}</Text>
                  }
                </Form.Item>
                <Form.Item name={['camera', 'description']} label="Описание">
                  {this.context.can('update', 'Camera') ?
                    <TextArea rows={4} />
                    :
                    <Text>{this.state.camera?.description}</Text>
                  }
                </Form.Item>
              </div>
              <Can do="update" on="Camera">
                <Collapse ghost>
                  <Collapse.Panel header="Дополнительно" key="1">
                    <Form.Item name={['camera', 'name']} label="Название">
                      {this.context.can('update', 'Camera') ?
                        <Input />
                        :
                        <Text>{this.state.camera?.name}</Text>
                      }
                    </Form.Item>
                    <Form.Item name={['camera', 'token']} label="Токен">
                      <Input />
                    </Form.Item>
                    <Form.Item name={['camera', 'is_archive']} label="Архив" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name={['camera', 'rtsp_url']} label="RTSP URL">
                      <Input />
                    </Form.Item>
                    <Form.Item name={['camera', 'secure_token']} label="Секрет.ключ">
                      <Input />
                    </Form.Item>
                    <Form.Item name={['camera', 'latitude']} label="Широта">
                      <InputNumber step="0.000001" style={{ width: 200 }} precision={7}></InputNumber>
                    </Form.Item>
                    <Form.Item name={['camera', 'longitude']} label="Долгота">
                      <InputNumber step="0.000001" style={{ width: 200 }} precision={7}></InputNumber>
                    </Form.Item>
                    <Form.Item name={['camera', 'archive_depth']} label="Глубина архива">
                      <InputNumber addonAfter={"д."} step="1" max={100} style={{ width: 200 }}></InputNumber>
                    </Form.Item>
                    <Form.Item
                      label='Сервер:'
                      name={['camera', 'server_id']}
                    >
                      <Select
                          placeholder='сервер'
                          options={[
                            { label: 'Flussonic 1', value: 1 },
                            { label: 'Flussonic 2', value: 2 },
                          ]}
                        />
                    </Form.Item>
                    <Form.Item name={['camera', 'active']} label="Включена" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                      <Button
                        onClick={(e)=> {
                          const config = `stream ${camera.token} {\ninput ${camera.rtsp_url};\non_play securetoken://${camera.secure_token};\ncache /ssd2/cache 1d 50G;\nthumbnails enabled=ondemand;\ndvr @my_raid${(camera.archive_depth && camera.archive_depth > 0) ? ` ${camera.archive_depth}d` : ''};\nprotocols -dash -mss -rtmp -rtsp -tshttp;\n}`
                          navigator.clipboard.writeText(config)
                          toast.success(`Конфиг успешно скопирован`);
                        }}
                      >
                        Скопировать конфиг
                      </Button>
                    </div>
                  </Collapse.Panel>
                </Collapse>
                <Form.Item wrapperCol={{ span: 24 }}>
                  <Button
                    style={{ width: '100%', margin: '20px auto' }}
                    type="primary"
                    htmlType="submit"
                  >
                    Сохранить
                  </Button>
                </Form.Item>
              </Can>
            </Form>
          </Col>
          <Col span={15}>
            <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
              <TabPane tab="Плеер" key="1" disabled={isCreating}>
                <CameraPlayer camera={camera} open={!isCreating} />
              </TabPane>
              <TabPane tab={`Договоры (${agreements.length})`} key="2" disabled={isCreating}>
                {!isCreating && (
                  <Table
                    columns={columns_agreement}
                    dataSource={agreements}
                    rowKey={(record) => record.agrm_id}
                  />
                )}
              </TabPane>
              <TabPane tab="Карта" key="3">
                <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
                  <MapContainer
                    style={{ height: "100%", width: "100%" }}
                    center={this.state.camera.latitude && this.state.camera.longitude ? [this.state.camera.latitude, this.state.camera.longitude] : [56.7364, 37.1619]}
                    zoom={13}
                    >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapEventsHandler
                      onMapClick={(latLng) => {
                        if (!this.context?.can('update', 'Camera')) return;

                        this.setState({
                          camera: {
                            ...this.state.camera,
                            latitude: latLng.lat,
                            longitude: latLng.lng
                          }
                        });
                      }}
                    />
                    {this.state.camera.latitude && this.state.camera.longitude && (
                      <Marker position={[this.state.camera.latitude, this.state.camera.longitude]} icon={customIcon}>
                        <Popup>
                          <div>
                            <p>Широта: {this.state.camera.latitude.toFixed(7)}</p>
                            <p>Долгота: {this.state.camera.longitude.toFixed(7)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

CameraForm.contextType = AbilityContext;

export default CameraForm;
