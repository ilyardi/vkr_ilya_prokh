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
  Modal
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { MessageOutlined, PhoneOutlined, WhatsAppOutlined, SendOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-solid-svg-icons';
import { debounce, find as _find, forEach as _forEach, map as _map, last as _last } from 'lodash';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import Preloader from 'components/preloader';
import Payments from 'components/payments';
import Charges from 'components/charges';
import Tariff from './components/tariff';
import Bonuses from './components/bonuses';
import Abonents from './components/abonents';
import Requests from 'components/requests';
import Appeals from './components/appeals';
import AppealForm from 'components/appeal_form';
import ConnectionsManager from 'components/connections_manager';
import FilesUploader from 'components/files_uploader';
import DomInfo from 'components/dom_info';
import ReconciliationAct from './components/forms/reconciliation_act'


const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

class AgreementCard extends React.Component {
  state = {
    agrm_id: this.props.agrm_id,
    agreement: {},
    dom: null,
    last_changes: null,
    connections: [],
    bonuses: {},
    attached_abonents: [],
    personal: null,
    readOnly: true,
    activeKey: 'requests',
    loading: false,
    fieldsChanged: false,
    tariffs: [],
    appeals: [],
    errors: [],
    visibleAppealForm: false,
    visibleReconciliationAct: false,
    data_relevance: null,
  };

  lk_statuses = {
    no_lk: 'Без ЛК',
    unconfirmed_lk: 'ЛК',
    confirmed_lk: 'ПЛК',
  };

  bill_deliveries = {
    receipt: 'Бумажный',
    email: 'Электронный',
    all: 'Элек. + Бум.',
    equipment: 'Оборудование',
    other: 'Другое',
  };

  componentDidMount() {
    this.loadData()
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.data_relevance !== this.state.data_relevance
    ) {
      this.loadData();
    }
    if (prevState.agreement?.number !== this.state.agreement.number) {
      this.loadDom();
    }
  }

  loadData() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/lb_agreements/${this.state.agrm_id}.json`).then(
      (response) => {
        const {
          agreement,
          bonuses,
          tariffs,
          personal,
          attached_abonents,
          appeals,
          connections,
          last_changes,
        } = response.data
        this.setState({
          agreement,
          bonuses,
          tariffs,
          personal,
          attached_abonents,
          appeals,
          connections,
          last_changes,
        })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  loadDom = () => {
    this.setState({ loading: true });
    const params = {
      number: this.state.agreement.number
    }
    Rest.get(`/api/teledom/agreements/get_dom_info.json`, { params: params }).then(
      (response) => {
        const { dom } = response.data
        this.setState({ dom })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  syncDom = () => {
    this.setState({ loading: true });
    const params = {
      number: this.state.agreement.number
    }
    Rest.post(`/api/teledom/agreements/sync.json`, params).then(
      (response) => {
        const { dom } = response.data
        this.setState({ dom })
        this.addSubscriberDom("ud")
        toast.success('Синхронизация выполнена');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка синхронизации');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  syncSvnDom = () => {
    this.setState({ loading: true });
    const params = {
      number: this.state.agreement.number
    }
    Rest.post(`/api/teledom/agreements/svn_sync.json`, params).then(
      (response) => {
        const { dom } = response.data
        this.setState({ dom })
        this.addSubscriberDom("svn")
        toast.success('Синхронизация выполнена');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка синхронизации');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  addSubscriberDom = (service) => {
    this.setState({ loading: true });
    const params = {
      number: this.state.agreement.number,
      subscriber: {
        last: this.state.agreement.ab_surname,
        name: this.state.agreement.ab_name,
        patronymic: this.state.agreement.ab_patronymic,
        phone: this.state.agreement.phone,
        owner: true,
        strict_mode: false,
        service: service
      }
    }
    Rest.post(`/api/teledom/agreements/add_subscriber.json`, params).then(
      (response) => {
        const { dom } = response.data
        this.setState({ dom })
        toast.success('Подписчик добавлен');
      }).catch((e) => {
        console.error('error', e);
        if (e.response.data?.errors["phone"]) {
          this.setState({
            errors: {
              phone: [e.response.data.errors.phone]
            }
          })
        }
        toast.error('Ошибка добавления подписчика');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleUpdate = (object) => {
    const { agrm_id } = this.state
    const { agreement } = object
    Rest.put(`/api/v1/lb_agreements/${agrm_id}.json`, { agreement }).then(
      (response) => {
        const { agreement, errors } = response.data
        this.setState({
          fieldsChanged: false,
          agreement,
          errors
        })
        errors ? message.error('Введены неверные значения') : message.success('Изменения сохранены');
      }).catch((e) => {
        message.error('Ошибка сохранения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const {
      agreement,
      bonuses,
      loading,
      fieldsChanged,
      tariffs,
      errors,
      personal,
      attached_abonents,
      appeals,
      visibleAppealForm,
      connections,
      last_changes,
      dom,
      visibleReconciliationAct,
    } = this.state

    const {agrm_id} = this.props

    const tab_items = [
      {
        key: 'tariffs',
        label: 'Тарифы',
        children: <>
          {(tariffs.length > 0) &&
            <Tariff
              tariffs={tariffs}
              syncDom={this.syncDom}
              syncSvnDom={this.syncSvnDom}
            />
          }
        </>
      },
      {
        key: 'payments',
        label: 'Платежи',
        children: <>
          {agreement.number &&
            <Payments filter={{ agrm_number: agreement.number }} />
          }
          </>
      },
      {
        key:'charges',
        label:'Начисления',
        children: <>
          {agreement.id &&
            <Charges filter={{ agrm_id: agreement.id }} />
          }
        </>
      },
      {
        key:'requests',
        label:'Задачи',
        children: <>
          {this.state.activeKey == 'requests' &&
            <Requests
              resource={{
                resource_id: this.state.agrm_id,
                resource_type: 'LbAgreement',
                resource: {
                  identifier: agreement.number,
                  address: agreement.address,
                  name: agreement.name,
                  phone: agreement.phone,
                  uid: agreement.uid,
                }
              }}
              search={{ agrm_id: this.state.agrm_id }}
            />
          }
        </>
      },
      {
        key:'appeals',
        label:'Обращения',
        children: <>
          <Appeals appeals={appeals} />
        </>
      },
      {
        key:'bonuses',
        label:'Бонусы',
        children: <>
          <Bonuses
            handleFormUpdate={() => this.setState({ data_relevance: new Date() })}
            charges={bonuses && bonuses.charges}
          />
        </>
      },
      {
        key:'lk_attached',
        label:'Прикреплен в ЛК',
        children: <>
          <Abonents abonents={attached_abonents} />
        </>
      },
      {
        key:'documents',
        label:'Документы',
        children: <>
          <FilesUploader
            related_obj_type='LbAgreement'
            related_obj_id={this.state.agrm_id}
            listStyle="picture-card"
          />
        </>
      },
      {
        key:'dom',
        label:'Телесеть.Дом',
        disabled: !dom,
        children: <>
          {dom &&
            <DomInfo
              agrmNumber={agreement.number}
              info={dom}
              reloadDom={this.loadDom}
            />
          }
        </>
      },
    ]

    let fields = []
    _forEach(agreement, (value, key) => {
      fields = [...fields, {
        name: ["agreement", key],
        value: value,
        errors: errors ? errors[key] : [],
      }]
    })
    return (
      <Preloader loading={loading}>
        <React.Fragment>
          {visibleAppealForm &&
            <Modal
              title={`Выберите причину обращения`}
              open={visibleAppealForm}
              onCancel={() => { this.setState({ visibleAppealForm: false }) }}
              onOk={() => { this.setState({ visibleAppealForm: false }) }}
              footer={false}
              width={'40%'}
            >
              <AppealForm
                uid={agreement.uid}
                handleClose={() => this.setState({ data_relevance: new Date(), visibleAppealForm: false, })}
              />
            </Modal>}
          {visibleReconciliationAct &&
            <Modal
              title={`Выберите период сверки`}
              open={visibleReconciliationAct}
              onCancel={() => { this.setState({ visibleReconciliationAct: false }) }}
              onOk={() => { this.setState({ visibleReconciliationAct: false }) }}
              footer={false}
              width={'400px'}
            >
              <ReconciliationAct agrm_id={agrm_id}/>
            </Modal>}
          <React.Fragment>
            <Row>
              <Col span={14}>
                <Form
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  fields={fields}
                  onFinish={this.handleUpdate}
                  onFieldsChange={(changedFields, allFields) => {
                    _map(changedFields, (v) => {
                      this.setState((prevState) => {
                        prevState.agreement[_last(v.name)] = v.value;
                        prevState.errors ? prevState.errors[_last(v.name)] = [] : null;
                        return prevState;
                      })
                    })
                    this.setState({ fieldsChanged: true })
                  }}
                >
                  <Row align='top'>
                    <Col span={12}>
                      <Form.Item
                        name={['agreement', 'name']}
                        label="Ф.И.О:"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={['agreement', 'mobile']}
                        label="М. телефон:"
                      >
                        <InputNumber controls={false} style={{ display: 'block', width: '100%' }} />
                      </Form.Item>
                      {/* <Form.Item
                        label="М. телефон:"
                      >
                        <Row gutter={6}>
                          <Col span={12}>
                            <Form.Item
                              noStyle
                              name={['agreement', 'mobile']}
                            >
                              <Input readOnly={readOnly} />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Button icon={<PhoneOutlined />} />
                          </Col>
                          <Col span={3}>
                            <Button icon={<MessageOutlined />} />
                          </Col>
                          <Col span={3}>
                            <Button icon={<WhatsAppOutlined />} />
                          </Col>
                          <Col span={3}>
                            <Button icon={<SendOutlined />} />
                          </Col>
                        </Row>
                      </Form.Item> */}
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={['agreement', 'phone']}
                        label="Д. телефон:"
                      >
                        <InputNumber controls={false} style={{ display: 'block', width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        name={['agreement', 'fax']}
                        label="Телефон ЛК:"
                      >
                        <InputNumber controls={false} style={{ display: 'block', width: '100%' }} />
                      </Form.Item>
                    </Col>
                    {/* <Col span={3} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Form.Item noStyle>
                        <Button
                          style={{ height: '50px', marginTop: '-24px' }}
                          type='primary'
                          htmlType="submit"
                          disabled={!fieldsChanged}
                        >
                          Сохранить
                        </Button>
                      </Form.Item>
                    </Col> */}
                  </Row>
                  <Row>
                    <Col span={24} style={{textAlign: 'right'}}>
                      <Form.Item
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        name={['agreement', 'descr']}
                        label="Комментарий:"
                        style={{
                          marginBottom: '0'
                        }}
                      >
                        <TextArea rows={4} />
                      </Form.Item>
                      <Text italic>
                        Последние изменение: { last_changes?.descr?.date ?
                          `${last_changes?.descr?.person} ${dayjs(last_changes?.descr?.date).format('DD.MM.YYYY HH:mm:ss') }`
                          :
                          ' никогда'
                        }
                      </Text>
                    </Col>
                  </Row>
                  <Row style={{marginTop: '20px'}} justify='end' gutter={20}>
                    <Col>
                      <Button
                        onClick={(event) => {
                          this.setState({ visibleReconciliationAct: true })
                        }}
                        disabled={agreement.acc_type == 2}
                      >
                        Акт сверки
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        onClick={(event) => {
                          this.setState({ visibleAppealForm: true })
                        }}
                      >
                        Зафиксировать обращение
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        style={{ width: '100%' }}
                        type='primary'
                        htmlType="submit"
                        disabled={!fieldsChanged}
                      >
                        Сохранить
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Col>
              <Col span={10}>
                <Form
                  labelCol={{ span: 12 }}
                // wrapperCol={{ span: 16 }}
                >
                  <Row>
                    <Col span={12}>
                      <Form.Item
                        // labelCol={{ span: 10 }}
                        label='Состояние сети: '
                        style={{ margin: '5px' }}
                      >
                        <div style={{ height: '35px' }}>
                          {(connections.length > 0) &&
                            <ConnectionsManager connections={connections} agrm_id={agreement.id} horizontal={true} reload_data={true}/>
                          }
                        </div>
                      </Form.Item>
                      <Form.Item
                        label='Способ счета: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{this.bill_deliveries[agreement.bill_delivery]}</Text>
                      </Form.Item>
                      <Form.Item
                        label='Текущий баланс: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{agreement.balance}</Text>
                      </Form.Item>
                      <Form.Item
                        label='Бонусы: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{(bonuses && bonuses.current) || 0}</Text>
                      </Form.Item>
                    </Col>
                    <Col span={12} >
                      <Form.Item
                        labelCol={{ span: 8 }}
                        label='Статус ЛК: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{this.lk_statuses[agreement.lk_status]}</Text>
                      </Form.Item>
                      <Form.Item
                        labelCol={{ span: 8 }}
                        label='Логин: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{(personal && personal.login) || ''}</Text>
                      </Form.Item>
                      <Form.Item
                        labelCol={{ span: 8 }}
                        label='Пароль: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{(personal && personal.pass) || ''}</Text>
                      </Form.Item>
                      <Form.Item
                        // name={['agreement', 'address']}
                        labelCol={{ span: 8 }}
                        label="Адрес:"
                        style={{ margin: '5px' }}
                      >
                        <Text >{agreement.address}</Text>
                      </Form.Item>
                      <Form.Item
                        labelCol={{ span: 8 }}
                        label='E-mail: '
                        style={{ margin: '5px' }}
                      >
                        <Text >{agreement.email}</Text>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </React.Fragment>
          <Tabs
            items={tab_items}
            defaultActiveKey='tariffs'
            onChange={(activeKey) => {
              this.setState({ activeKey: activeKey })
            }}
          />
        </React.Fragment >
      </Preloader >
    );
  }
}

export default AgreementCard
