import React, { useState, useEffect, useReducer } from 'react';
import Rest from 'tools/rest';
import {
  Button,
  message,
  Modal,
  Table,
  Typography,
  Form,
  Input,
  Popconfirm,
  Row,
  Col,
  Select,
  Switch,
  DatePicker,
  Tabs,
  Empty,
  InputNumber,
  Divider,
} from 'antd';
import { InfoCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';
import ExpenseStage from './components/expense_stage'

const ExpenseManagerSettings = (props) => {
  const [expenseTypeId, setExpenseTypeId] = useState(null);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseStage, setExpenseStage] = useState(null);
  const [expenseStages, setExpenseStages] = useState([]);
  const [visibleCard, setVisibleCard] = useState(false);
  const [newType, setNewType] = useState('')
  const [loading, setLoading] = useState(false);
  const [dataRelevance, setDataRelevance] = useState(null);

  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  }

  const getExpenseTypes = () => {
    setLoading(true)
    Rest.get('/api/v1/expense_types.json').then(
      (response) => {
        const { expense_types } = response.data;
        setExpenseTypes(_map(expense_types, (expenseType) => {
          return { label: expenseType.name, value: expenseType.id }
        }))
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getExpenseStages = () => {
    if (!expenseTypeId) {return}
    const params = {
      search: {
        expense_type_id: expenseTypeId
      },
    };
    setLoading(true)
    Rest.get('/api/v1/expense_stages.json', { params: params }).then(
      (response) => {
        const { expense_stages } = response.data;
        setExpenseStages(expense_stages)
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteStage = (record) => {
    Rest.delete(`api/v1/expense_stages/${record.id}.json`).then((response) => {
      dataRelevanceChange();
    });
  };

  const handleCreateType = () => {
    if (newType === '') { return; };
    const expense_type = {
      name: newType,
    };
    Rest.post('/api/v1/expense_types.json', { expense_type })
      .then((response) => {
        const { expense_type } = response.data
        setExpenseTypes([...expenseTypes, { label: expense_type.name, value: expense_type.id }])
        setNewType('');
      }).catch((e) => {
        setErrors(e.response.data.expense_type.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseModal = () => {
    setVisibleCard(false);
    setExpenseStage(null);
    setDataRelevance(new Date())
  };

  // const handleChangeText = (e) => {
  //   setExpense({ ...expense, [e.target.name]: e.target.value })
  //   setErrors({ ...errors, [e.target.name]: null })
  // };

  useEffect(() => {
    getExpenseTypes();
  }, []);

  useEffect(() => {
    getExpenseStages();
  }, [dataRelevance, expenseTypeId]);

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Ответственный',
      dataIndex: 'user',
      key: 'user',
      render: (value) => {
        return (value?.name)
      }
    },
    {
      title: 'Время',
      dataIndex: 'alert_timer',
      key: 'alert_timer',
      width: '15%',
      render: (value) => {
        return (value ? `${parseInt(value / 60)} ч. ${parseInt(value % 60)} м.` : null)
      }
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      width: '10%'
    },
    {
      title: '',
      dataIndex: 'action',
      width: '5%',
      render: (_, record) => (
        <React.Fragment>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Popconfirm
              placement="left"
              title="Вы уверены, что хотите удалить этап?"
              onConfirm={(e) => {
                e.stopPropagation();
                handleDeleteStage(record);
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
              <Button title="Удалить этап" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        </React.Fragment>
      ),
    },
  ];

  return (
    <Modal
      title={'Расходы. Настройка'}
      open={props.visibleCard}
      onCancel={props.closeCard}
      onOk={props.closeCard}
      footer={false}
      width={'70%'}
    >
      {visibleCard &&
        <ExpenseStage
          expenseTypeId={expenseTypeId}
          expenseStageId={expenseStage?.id}
          visibleCard={visibleCard}
          closeCard={handleCloseModal}
        />
      }
      <Table
        title={(currentPageDate) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Select
                style={{width: '300px', marginRight: '20px'}}
                value={expenseTypeId}
                onChange={(value, option) => { setExpenseTypeId(value) }}
                options={expenseTypes}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '4px 0' }} />
                    <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                      <Input
                        style={{ flex: 'auto' }}
                        value={newType}
                        onChange={(event)=>{setNewType(event.target.value)}}
                      />
                      <a
                        style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                        onClick={handleCreateType}
                      >
                        <PlusOutlined />
                        Добавить
                      </a>
                    </div>
                  </div>
                )}
              />
              {expenseTypeId &&
                <Button
                  onClick={(event) => {
                    setExpenseStage(null);
                    setVisibleCard(true);
                  }}
                >
                  Добавить этап
                </Button>
              }
            </div>
          )
        }}
        rowKey={(record) => record.id}
        loading={loading}
        columns={columns}
        dataSource={expenseStages}
        hideOnSinglePage={true}
        pagination={false}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => {
              setExpenseStage(record);
              setVisibleCard(true);
            },
          };
        }}
      />
    </Modal>
  );
};

export default ExpenseManagerSettings;
