import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Rest from 'tools/rest';
import { Card, Typography, ConfigProvider } from 'antd';
import { Input, TextArea, Button, Toast } from 'antd-mobile';
import { forEach as _forEach } from 'lodash';
import dayjs from 'dayjs';
import Preloader from 'components/preloader';
import Payments from './components/mobile_payments';
import Charges from './components/mobile_charges';
import Tariff from './components/mobile_tariff';
import Bonuses from './components/mobile_bonuses';
import Abonents from './components/mobile_abonents';
import Appeals from './components/mobile_appeals';
import AppealForm from 'components/appeal_form';
import ConnectionsManager from 'components/connections_manager';
import DomInfo from 'components/mobile_dom_info';
import ReconciliationAct from './components/forms/reconciliation_act';
import { withStyles } from '@material-ui/core/styles';
import {
  LeftOutline,
  UserOutline,
  TagOutline,
  PayCircleOutline,
  CalculatorOutline,
  TeamOutline,
  GlobalOutline
} from 'antd-mobile-icons';

const { Text } = Typography;

const lk_statuses = {
  no_lk: 'Без ЛК',
  unconfirmed_lk: 'ЛК',
  confirmed_lk: 'ПЛК',
};

const bill_deliveries = {
  receipt: 'Бумажный',
  email: 'Электронный',
  all: 'Элек. + Бум.',
  equipment: 'Оборудование',
  other: 'Другое',
};

const MobileAgreementCard = ({ classes }) => {
  const history = useHistory();
  const location = useLocation();
  const { agreements_id } = useParams();

  const [agreement, setAgreement] = useState({});
  const [dom, setDom] = useState(null);
  const [last_changes, setLastChanges] = useState(null);
  const [connections, setConnections] = useState([]);
  const [bonuses, setBonuses] = useState({});
  const [attached_abonents, setAttachedAbonents] = useState([]);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldsChanged, setFieldsChanged] = useState(false);
  const [tariffs, setTariffs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [data_relevance, setDataRelevance] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const loadData = useCallback(() => {
    if (!agreements_id) return;
    setLoading(true);
    Rest.get(`/api/v1/lb_agreements/${agreements_id}.json`)
      .then(response => {
        const { agreement, bonuses, tariffs, personal, attached_abonents, appeals, connections, last_changes } = response.data;
        setAgreement(agreement);
        setBonuses(bonuses);
        setTariffs(tariffs);
        setPersonal(personal);
        setAttachedAbonents(attached_abonents);
        setAppeals(appeals);
        setConnections(connections);
        setLastChanges(last_changes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agreements_id]);

  const loadDom = useCallback((agrmNumber) => {
    if (!agrmNumber) return;
    setLoading(true);
    Rest.get(`/api/teledom/agreements/get_dom_info.json`, { params: { number: agrmNumber } })
      .then(response => setDom(response.data.dom))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const syncDom = () => {
    const params = { number: agreement.number };
    setLoading(true);
    Rest.post(`/api/teledom/agreements/sync.json`, params)
      .then(response => {
        setDom(response.data.dom);
        addSubscriberDom("ud");
        Toast.show('Синхронизация выполнена');
      })
      .catch(() => Toast.show('Ошибка синхронизации'))
      .finally(() => setLoading(false));
  };

  const syncSvnDom = () => {
    const params = { number: agreement.number };
    setLoading(true);
    Rest.post(`/api/teledom/agreements/svn_sync.json`, params)
      .then(response => {
        setDom(response.data.dom);
        addSubscriberDom("svn");
        Toast.show('Синхронизация выполнена');
      })
      .catch(() => Toast.show('Ошибка синхронизации'))
      .finally(() => setLoading(false));
  };

  const addSubscriberDom = (service) => {
    const params = {
      number: agreement.number,
      subscriber: {
        last: agreement.ab_surname,
        name: agreement.ab_name,
        patronymic: agreement.ab_patronymic,
        phone: agreement.phone,
        owner: true,
        strict_mode: false,
        service
      }
    };
    setLoading(true);
    Rest.post(`/api/teledom/agreements/add_subscriber.json`, params)
      .then(response => {
        setDom(response.data.dom);
        Toast.show('Подписчик добавлен');
      })
      .catch(e => {
        if (e.response?.data?.errors?.phone) {
          setErrors({ phone: [e.response.data.errors.phone] });
        }
        Toast.show('Ошибка добавления подписчика');
      })
      .finally(() => setLoading(false));
  };

  const handleUpdate = ({ agreement }) => {
    setLoading(true);
    Rest.put(`/api/v1/lb_agreements/${agreements_id}.json`, { agreement })
      .then(response => {
        const { agreement, errors } = response.data;
        setAgreement(agreement);
        setErrors(errors);
        setFieldsChanged(false);
        errors ? Toast.show('Введены неверные значения') : Toast.show('Изменения сохранены');
      })
      .catch(() => Toast.show('Ошибка сохранения'))
      .finally(() => setLoading(false));
  };

  const handleFieldChange = (field, value) => {
    setAgreement(prev => ({ ...prev, [field]: value }));
    setFieldsChanged(true);
  };
  
  const handleClose = () => {
      history.push({
          pathname: '/m/agreements',
          search: location.search
      })
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (data_relevance) {
      loadData();
    }
  }, [data_relevance, loadData]);

  useEffect(() => {
    if (agreement?.number) {
      loadDom(agreement.number);
    }
  }, [agreement?.number, loadDom]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderAgreementCard();
      case 1: return tariffs.length > 0 ? (
        <div>
          <Tariff tariffs={tariffs} syncDom={syncDom} syncSvnDom={syncSvnDom} displayMode="columns" />
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '12px' }}>Нет данных о тарифах</Card>
      );
      case 2: return agreement.number ? (
        <div>
          <Payments filter={{ agrm_number: agreement.number }} displayMode="columns" />
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '12px' }}>Нет данных о платежах</Card>
      );
      case 3: return agreement.id ? (
        <div>
          <Charges filter={{ agrm_id: agreement.id }} displayMode="columns" />
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '12px' }}>Нет данных о начислениях</Card>
      );
      case 4: return (
        <div>
          <Abonents abonents={attached_abonents} displayMode="columns" />
        </div>
      );
      case 5: return dom ? (
        <div>
          <DomInfo agrmNumber={agreement.number} info={dom} reloadDom={() => loadDom(agreement.number)} displayMode="columns" />
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '12px' }}>Данные не доступны</Card>
      );
      default: return renderAgreementCard();
    }
  };

  const renderAgreementCard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Card style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: '#333', fontSize: '16px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
            Контактная информация
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '6px', color: '#595959' }}>Ф.И.О</Text>
              <Input 
                value={agreement.name} 
                onChange={val => handleFieldChange('name', val)}
                style={{ 
                  '--font-size': '15px',
                  '--placeholder-color': '#bfbfbf',
                  '--text-color': '#262626',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fafafa'
                }}
                placeholder="Введите Ф.И.О"
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '6px', color: '#595959' }}>Моб. тел.</Text>
              <Input 
                value={agreement.mobile} 
                onChange={val => handleFieldChange('mobile', val)}
                style={{ 
                  '--font-size': '15px',
                  '--placeholder-color': '#bfbfbf',
                  '--text-color': '#262626',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fafafa'
                }}
                placeholder="Введите мобильный телефон"
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '6px', color: '#595959' }}>Дом. тел.</Text>
              <Input 
                value={agreement.phone} 
                onChange={val => handleFieldChange('phone', val)}
                style={{ 
                  '--font-size': '15px',
                  '--placeholder-color': '#bfbfbf',
                  '--text-color': '#262626',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fafafa'
                }}
                placeholder="Введите домашний телефон"
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '6px', color: '#595959' }}>Тел. ЛК</Text>
              <Input 
                value={agreement.fax} 
                onChange={val => handleFieldChange('fax', val)}
                style={{ 
                  '--font-size': '15px',
                  '--placeholder-color': '#bfbfbf',
                  '--text-color': '#262626',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fafafa'
                }}
                placeholder="Введите телефон ЛК"
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '6px', color: '#595959' }}>E-mail</Text>
              <Input 
                value={agreement.email} 
                onChange={val => handleFieldChange('email', val)}
                style={{ 
                  '--font-size': '15px',
                  '--placeholder-color': '#bfbfbf',
                  '--text-color': '#262626',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fafafa'
                }}
                placeholder="Введите email"
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '6px', color: '#595959' }}>Адрес</Text>
              <div style={{ 
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#fafafa',
                fontSize: '15px',
                color: '#262626',
                minHeight: '44px'
              }}>
                {agreement.address || 'Адрес не указан'}
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: '#333', fontSize: '16px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
            Статус и баланс
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f5f5f5'
            }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Способ счета</Text>
              <div style={{ 
                padding: '6px 12px',
                backgroundColor: '#f0f5ff',
                borderRadius: '4px',
                border: '1px solid #d6e4ff'
              }}>
                <Text style={{ fontSize: '14px', color: '#1d39c4', fontWeight: '500' }}>
                  {bill_deliveries[agreement.bill_delivery]}
                </Text>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f5f5f5'
            }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Баланс</Text>
              <div style={{ 
                padding: '6px 12px',
                backgroundColor: agreement.balance >= 0 ? '#f6ffed' : '#fff2e8',
                borderRadius: '4px',
                border: agreement.balance >= 0 ? '1px solid #b7eb8f' : '1px solid #ffd591'
              }}>
                <Text style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: agreement.balance >= 0 ? '#389e0d' : '#fa541c'
                }}>
                  {agreement.balance}
                </Text>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f5f5f5'
            }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Бонусы</Text>
              <div style={{ 
                padding: '6px 12px',
                backgroundColor: '#fff7e6',
                borderRadius: '4px',
                border: '1px solid #ffd591'
              }}>
                <Text style={{ fontSize: '14px', color: '#fa8c16', fontWeight: '500' }}>
                  {bonuses?.current || 0}
                </Text>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f5f5f5'
            }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Статус ЛК</Text>
              <div style={{ 
                padding: '6px 12px',
                backgroundColor: '#f6ffed',
                borderRadius: '4px',
                border: '1px solid #b7eb8f'
              }}>
                <Text style={{ fontSize: '14px', color: '#389e0d', fontWeight: '500' }}>
                  {lk_statuses[agreement.lk_status]}
                </Text>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f5f5f5'
            }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Логин</Text>
              <div style={{ 
                padding: '6px 12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #e8e8e8'
              }}>
                <Text style={{ fontSize: '14px', color: '#262626', fontFamily: 'monospace' }}>
                  {personal?.login || 'Не указан'}
                </Text>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px 0'
            }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Пароль</Text>
              <div style={{ 
                padding: '6px 12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #e8e8e8'
              }}>
                <Text style={{ fontSize: '14px', color: '#262626', fontFamily: 'monospace' }}>
                  {personal?.pass || 'Не указан'}
                </Text>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0'
             }}>
              <Text type="secondary" style={{ fontSize: '14px', color: '#595959' }}>Состояние сети</Text>
              <ConnectionsManager connections={connections} agrm_id={agreement.id} horizontal />
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: '#333', fontSize: '16px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
            Комментарий
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#fafafa'
            }}>
              <TextArea 
                value={agreement.descr} 
                onChange={val => handleFieldChange('descr', val)} 
                rows={4}
                style={{ 
                  '--font-size': '15px',
                  '--placeholder-color': '#bfbfbf',
                  '--text-color': '#262626',
                  padding: '12px',
                  border: 'none',
                  backgroundColor: 'transparent'
                }}
                placeholder="Введите комментарий..."
              />
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#8c8c8c', 
              padding: '8px 12px',
              backgroundColor: '#fafafa',
              borderRadius: '4px',
              border: '1px dashed #d9d9d9'
            }}>
              {last_changes?.descr?.date ? 
                `Изменено: ${last_changes?.descr?.person} ${dayjs(last_changes?.descr?.date).format('DD.MM.YYYY HH:mm')}` : 
                'Изменений не было'}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabConfig = [
    { key: '0', title: 'Карточка', icon: <UserOutline /> },
    { key: '1', title: 'Тарифы', icon: <TagOutline /> },
    { key: '2', title: 'Платежи', icon: <PayCircleOutline /> },
    { key: '3', title: 'Начисления', icon: <CalculatorOutline /> },
    { key: '4', title: 'Прикр. в ЛК', icon: <TeamOutline /> },
    { key: '5', title: 'ТС.Дом', icon: <GlobalOutline /> },
  ];

  return (
    <ConfigProvider>
      <div className={classes.backButton} onClick={handleClose}>
        <LeftOutline />
      </div>
      
      <Preloader loading={loading}>
        <div className={classes.main}>
            <div className={classes.content}>
                {renderTabContent()}
            </div>
        </div>
      </Preloader>
      
      <div className={classes.actions}>
        {tabConfig.map(tab => (
            <button 
              key={tab.key}
              disabled={tab.key === '5' && !dom}
              onClick={() => setActiveTab(parseInt(tab.key))}
              className={classes.actionBlock}
              style={{
                opacity: (tab.key === '5' && !dom) ? 0.4 : 1,
              }}
            >
                <div 
                    className={classes.actionIcon}
                    style={{ color: activeTab.toString() === tab.key ? '#59059B' : '#666' }}
                >
                    {tab.icon}
                </div>
                <Text 
                    className={classes.actionLable}
                    style={{
                        color: activeTab.toString() === tab.key ? '#59059B' : '#666',
                        fontWeight: activeTab.toString() === tab.key ? '600' : '400'
                    }}
                >
                    {tab.title}
                </Text>
            </button>
        ))}
      </div>

      {fieldsChanged && (
          <div className={classes.floatingSave}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4d4f' }} />
                      <Text type="secondary" style={{ fontSize: '14px', color: '#262626' }}>
                          Есть несохраненные изменения
                      </Text>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <Button 
                          size="small" 
                          onClick={() => {
                              setFieldsChanged(false);
                              setDataRelevance(new Date());
                          }}
                          style={{ fontSize: '14px', border: '1px solid #d9d9d9' }}
                      >
                          Отмена
                      </Button>
                      <Button 
                          size="small" 
                          color="primary" 
                          onClick={() => handleUpdate({ agreement })}
                          style={{ fontSize: '14px' }}
                      >
                          Сохранить
                      </Button>
                  </div>
              </div>
          </div>
      )}
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
    position: 'fixed',
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#FFFFFF',
  },
  actionBlock: {
    margin: '0', 
    padding: '0', 
    border: 'none', 
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: '30px'
  },
  actionLable: {
    fontSize: '8px'
  },
  content: {
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    height: 'calc(100vh - 18vh)' 
  },
  backButton: {
    width: '80px',
    height: '8vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '0px',
    right: '0px',
    fontSize: '30px',
    color: '#59059B',
    zIndex: '2',
  },
  floatingSave: {
    position: 'fixed',
    bottom: '9vh',
    left: 12,
    right: 12,
    zIndex: 1001,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 -2px 20px rgba(0,0,0,0.15)',
    padding: '12px',
    border: '1px solid #40a9ff'
  },
});

export default withStyles(styles)(MobileAgreementCard);
