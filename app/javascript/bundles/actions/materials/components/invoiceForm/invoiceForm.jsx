import React, { useContext, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Rest from 'tools/rest';
import './index.css';
import { Table, InputNumber, Button, Select, Modal, Radio, Result } from 'antd';
import { find as _find } from 'lodash';
import { toast } from 'react-toastify';
import UserSelect from 'components/user_search';

class InvoiceMaterials extends React.Component {
  state = {
    materials: [],
    operation_type: 'out',
    units: this.props.units,
    user_id: null,
    has_errors: false,
    has_errors_user: {
      status: false,
      message: '',
    },
    has_errors_quantity: true,
  };
  componentDidMount() {
    const { dataInvoice } = this.props;
    const materials = dataInvoice.map((item) => {
      item.operation_type = dataInvoice[0].operation_type;
      return item;
    });
    let { operation_type } = this.state;
    if (materials.length != 0) {
      operation_type = materials[0].operation_type;
    }
    this.setState({ materials, operation_type });
  }

  handleToggleOperation = (event) => {
    const operation_type = event.target.value;
    const materials = this.state.materials.map((item) => {
      item.operation_type = operation_type;
      return item;
    });
    this.setState({ materials, operation_type });
  };

  handleOk = () => {
    this.save();
  };

  handleCancel = () => {
    this.props.closer(this.state.materials);
  };

  handleSuccessSave = () => {
    this.props.closer([]);
    this.props.movesRelevanceChange();
    this.props.dataRelevanceChange();
  };

  handleChangeUser = (_, e) => {
    this.setState({
      user_id: e ? e.value : undefined,
    });
  };

  delMaterial = (key) => {
    const materials = [...this.state.materials];
    this.setState({
      materials: materials.filter((item) => item.id !== key),
    });
  };

  save() {
    if (this.state.materials.length === 0) {
      this.handleCancel()
      return
    }
    const { operation_type } = this.state;
    const material_invoice = {
      moves: this.state.materials.map((material) => {
        return {
          warehouse_material_id: material.id,
          quantity: material.invoice,
        };
      }),
      user_id: this.state.user_id,
      operation_type: operation_type === 'out' ? -1 : 1,
    };
    Rest.post('/api/v1/warehouse_material_moves.json', { material_invoice: material_invoice })
      .then((response) => {
        if (response.data.has_error) {
          let has_errors_user = { status: false, message: '' };
          let has_errors_quantity = false;
          const materials = response.data.material_moves.map((move) => {
            let quantityErrors = {
              status: false,
              message: '',
            };
            if (move.errors && move.errors.hasOwnProperty('user')) {
              has_errors_user = {
                status: true,
                message: move.errors.user,
              };
            }
            if (move.errors && move.errors.hasOwnProperty('quantity')) {
              has_errors_quantity = true;
              quantityErrors = {
                status: true,
                message: move.errors.quantity,
              };
            }
            return {
              ...move.warehouse_material,
              invoice: move.quantity,
              operation_type: move.operation_type,
              user_id: move.user_id ? move.user_id : this.state.user_id,
              errors: quantityErrors,
            };
          });
          this.setState({
            has_error: response.data.has_error,
            has_errors_user: has_errors_user,
            has_errors_quantity: has_errors_quantity,
            materials: materials,
          });
        } else {
          toast.success('Сохранено');
          this.handleSuccessSave();
        }
      })
      .catch((err) => {
        console.error('Ошибка сохранения', err);
        toast.error('Ошибка сохранения');
      });
  }

  render() {
    const { user_id } = this.state
    const columns = [
      {
        title: 'Категория',
        dataIndex: 'category',
        render: (_, record) => {
          return record.warehouse_material_category.name;
        },
      },
      {
        title: 'Наименование',
        dataIndex: 'name',
      },
      {
        title: 'Артикул',
        dataIndex: 'code',
      },
      {
        title: 'Тип операции',
        dataIndex: 'operation_type',
        render: (_, record) => {
          return record.operation_type == 'in' ? 'Приход' : 'Расход';
        },
      },
      {
        title: 'Наличие',
        dataIndex: 'quantity',
      },
      {
        title: 'Ед.изм.',
        dataIndex: 'unit',
        render: (_, record) => {
          const u = _find(this.state.units, (el) => {
            return el.value == record.unit;
          });
          return u ? u.label : '';
        },
      },
      {
        title: 'Количество',
        dataIndex: 'invoice',
        width: '10%',
        render: (val, record, i) => {
          return (
            <React.Fragment>
              <InputNumber
                min={0}
                max={record.operation_type === 'in' ? Number.MAX_SAFE_INTEGER : record.quantity}
                onChange={(value) => {
                  this.setState((s) => {
                    s.materials[i].invoice = value;
                    s.materials[i].errors = {};
                    return s;
                  });
                }}
                defaultValue={val}
              />
              {record.errors.status && (
                <span style={{ color: 'red' }}>{record.errors.message}</span>
              )}
            </React.Fragment>
          );
        },
      },
      {
        title: 'Размещение',
        dataIndex: 'coords',
        render: (_, record) => (
          <span>
            Стеллаж: {record.coords.rack} / Полка: {record.coords.shelf}
          </span>
        ),
      },
      {
        title: '',
        dataIndex: 'operation',
        render: (_, record) => (
          <Button onClick={() => this.delMaterial(record.id)} className="addInvoice">
            Удалить
          </Button>
        ),
      },
    ];

    return (
      <Modal
        title={'Движение материалов'}
        centered
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button key="submit" type="primary" onClick={this.handleOk}>
            Провести
          </Button>,
          <Button key="decline" onClick={this.handleCancel}>
            Отмена
          </Button>,
        ]}
        width={'80%'}
        style={{ marginTop: '70px' }}
      >
        <React.Fragment>
          <Radio.Group
            value={this.state.operation_type}
            onChange={this.handleToggleOperation}
            buttonStyle="solid"
            style={{ marginBottom: '10px' }}
          >
            <Radio.Button value="out">Расход</Radio.Button>
            <Radio.Button value="in">Приход</Radio.Button>
          </Radio.Group>
          {this.state.operation_type === 'out' && (
            <React.Fragment>
              <span style={{ margin: '0 10px 0 20px' }}>Выберите получателя:</span>
              <div style={{ display: 'inline-block' }}>
                <UserSelect
                  placeholder='Получатель'
                  scope='warehouse_users'
                  onChange={this.handleChangeUser}
                  value={user_id}
                  style={{ width: "250px" }}
                />
              </div>
              {this.state.has_errors_user.status && (
                <span style={{ color: 'red', marginLeft: '20px' }}>
                  {'Поле ' + this.state.has_errors_user.message}
                </span>
              )}
            </React.Fragment>
          )}
          <Table
            bordered
            rowKey={(record) => record.id}
            dataSource={this.state.materials}
            columns={columns}
            size="small"
            pagination={false}
          />
        </React.Fragment>
      </Modal>
    );
  }
}
export default InvoiceMaterials;
