import React from 'react';
import Rest from 'tools/rest';
import { Tabs, Table, Button, Input, Badge, Select, Row, Col, Form, Checkbox } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { faEdit, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce, find as _find, replace as _replace } from 'lodash';
import Preloader from 'components/preloader';
import MaterialNew from './new';
import MaterialEdit from './update';
import MaterialShow from './show';
import { faPeopleCarry } from '@fortawesome/free-solid-svg-icons';
import InvoiceMaterials from './components/invoiceForm/invoiceForm';
import MaterialMovesGrid from './components/movesGrid';

const { TabPane } = Tabs;
const { Option } = Select;

class Materials extends React.Component {
  state = {
    materials: [],
    material_categories: [],
    invoice_materials: [],
    selected_material: {},
    units: [
      { label: 'шт.', value: 'piece' },
      { label: 'м.', value: 'metre' },
      { label: 'кг.', value: 'kilo' },
      { label: 'л.', value: 'litre' },
    ],
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
    visible_new: false,
    visible_edit: false,
    visible_invoice: false,
    visible_show: false,
    useDebounce: false,
    loading: false,
    data_relevance: false,
    moves_relevance: false,
    show_out_of_stock: false,
  };

  loadMaterial = () => {
    const params = {
      current: this.state.meta.current,
      page_size: this.state.meta.pageSize,
      order: this.state.sorter.order,
      order_by: this.state.sorter.order_by,
      search: {
        name: this.state.search.name,
        category: this.state.search.category,
      },
      show_out_of_stock: this.state.show_out_of_stock,
    };
    this.setState({ loading: true, useDebounce: false });
    Rest.get('/api/v1/warehouse_materials.json', { params: params }).then((response) => {
      this.setState({
        materials: response.data.materials,
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

  loadWarehouseMaterialCategories() {
    Rest.get('/api/v1/warehouse_material_categories.json').then((response) => {
      this.setState({ material_categories: response.data.material_categories });
    });
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Материалы', '')
  }

  componentDidMount() {
    document.title += ' | Материалы'
    this.loadMaterial();
    this.loadWarehouseMaterialCategories();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.sorter.order !== this.state.sorter.order ||
      prevState.sorter.order_by !== this.state.sorter.order_by ||
      prevState.meta.current !== this.state.meta.current ||
      prevState.meta.pageSize !== this.state.meta.pageSize ||
      prevState.data_relevance !== this.state.data_relevance ||
      prevState.search.category !== this.state.search.category ||
      prevState.show_out_of_stock !== this.state.show_out_of_stock
    ) {
      this.loadWarehouseMaterialCategories();
      this.loadMaterial();
    }
    if (prevState.search.name !== this.state.search.name) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadMaterial();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  }

  dataRelevanceChange = () => {
    this.setState({ ...this.state, data_relevance: new Date() });
  };

  movesRelevanceChange = () => {
    this.setState({ ...this.state, moves_relevance: new Date() });
  };

  addMaterialToInvoice = (material) => {
    let status = true;
    this.state.invoice_materials.map((item) => {
      if (item.id === material.id) {
        status = false;
      }
    });
    // const countInvoice = this.state.countInvoice + 1;
    const materialInvoice = {
      invoice: 0,
      operation_type: 'out',
      user_id: '',
      errors: {
        status: false,
        message: '',
      },
      ...material,
    };
    if (status) {
      this.setState((prevState) => ({
        invoice_materials: [...prevState.invoice_materials, materialInvoice],
      }));
    }
  };

  handleChangeText = () => {
    return (e) => {
      this.setState({
        useDebounce: true,
        meta: { ...this.state.meta, current: 1 },
        search: { ...this.state.search, [e.target.name]: e.target.value },
      });
    };
  };

  handleChangeCategory = (e) => {
    this.setState({
      meta: { ...this.state.meta, current: 1 },
      search: { ...this.state.search, category: e },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const newsorter = {
      order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
      order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    };
    this.setState({ meta: pagination, sorter: newsorter });
  };

  handleEditMaterial = (record) => {
    this.setState({
      selected_material: record,
      visible_edit: true,
    });
  };

  handleShowMaterial = (record) => {
    this.setState({
      selected_material: record,
      visible_show: true,
    });
  };

  render() {
    const {
      materials,
      search,
      material_categories,
      units,
      selected_material,
      visible_new,
      visible_edit,
      visible_show,
      moves_relevance,
      show_out_of_stock,
    } = this.state;

    const pagination = {
      ...this.state.meta,
      showSizeChanger: true,
    };

    const columns_materials = [
      {
        title: 'Категория',
        dataIndex: 'warehouse_material_category',
        width: '15%',
        render: (_, record) => {
          return record.warehouse_material_category.name;
        },
      },
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
        width: '35%',
        sorter: true,
      },
      {
        title: 'Артикул',
        dataIndex: 'code',
        width: '15%',
        sorter: true,
      },
      {
        title: 'Ед.изм.',
        dataIndex: 'unit',
        width: '5%',
        render: (_, record) => {
          const u = _find(units, (el) => {
            return el.value == record.unit;
          });
          return u ? u.label : '';
        },
      },
      {
        title: 'Количество',
        dataIndex: 'quantity',
        sorter: true,
        width: '5%',
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
        dataIndex: 'action',
        width: '10%',
        render: (_, record) => (
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <Button
              title="Добавить в накладную"
              // style={{ border: 'none' }}
              onClick={() => {
                this.addMaterialToInvoice(record);
              }}
              icon={
                <FontAwesomeIcon
                  // style={{ width: '100%', height: '24px' }}
                  icon={faPlusSquare}
                />
              }
            />
            <Button
              title="Редактировать материал"
              // style={{ border: 'none' }}
              onClick={() => {
                this.handleEditMaterial(record);
              }}
              icon={
                <FontAwesomeIcon
                  // style={{ width: '100%', height: '24px' }}
                  icon={faEdit}
                />
              }
            />
            <Button
              title="Движение материала"
              // style={{ border: 'none' }}
              onClick={() => {
                this.handleShowMaterial(record);
              }}
              icon={
                <FontAwesomeIcon
                  // style={{ width: '100%', height: '24px' }}
                  icon={faPeopleCarry}
                />
              }
            />
          </div>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Preloader loading={this.state.loading}>
          <PageHeader
            title="Материалы"
            style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
            extra={[
              <Badge key="invoice" count={this.state.invoice_materials.length}>
                <Button type="button" onClick={() => this.setState({ visible_invoice: true })}>
                  Накладная
                </Button>
              </Badge>,
              <Button key="add_material" type="button" onClick={() => this.setState({ visible_new: true })}>
                Добавить материал
              </Button>,
            ]}
          />
          <Tabs defaultActiveKey="1">
            <TabPane tab="Хранение" key="1">
              <React.Fragment>
                {this.state.visible_new && (
                  <MaterialNew
                    visible={visible_new}
                    closer={() => this.setState({ visible_new: false })}
                    dataRelevanceChange={this.dataRelevanceChange}
                    units={units}
                    handleAddMaterialInvoice={this.addMaterialToInvoice}
                  />
                )}
                {this.state.visible_edit && (
                  <MaterialEdit
                    visible={visible_edit}
                    closer={() => this.setState({ visible_edit: false })}
                    dataRelevanceChange={this.dataRelevanceChange}
                    selected_material={selected_material}
                    units={units}
                    handleAddMaterialInvoice={this.addMaterialToInvoice}
                  />
                )}
                {this.state.visible_show && (
                  <MaterialShow
                    visible={visible_show}
                    closer={() => this.setState({ visible_show: false })}
                    dataRelevanceChange={this.dataRelevanceChange}
                    selected_material={selected_material}
                    units={units}
                  />
                )}
                {this.state.visible_invoice && (
                  <InvoiceMaterials
                    visible={this.state.visible_invoice}
                    closer={(materials) =>
                      this.setState({ invoice_materials: materials, visible_invoice: false })
                    }
                    dataInvoice={this.state.invoice_materials}
                    dataRelevanceChange={this.dataRelevanceChange}
                    movesRelevanceChange={this.movesRelevanceChange}
                    units={this.state.units}
                  />
                )}
              </React.Fragment>
              <Row justify="space-between">
                <Col>
                  <Form layout="inline" style={{ marginBottom: 16 }}>
                    <Form.Item>
                      <Select
                        name={'category'}
                        style={{ width: 200 }}
                        value={search.category}
                        placeholder="Категория"
                        onChange={this.handleChangeCategory}
                        allowClear
                      >
                        {material_categories.map((item) => (
                          <Option key={item.id}>{item.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item>
                      <Input
                        name="name"
                        value={search.name}
                        placeholder="Назавание"
                        onChange={this.handleChangeText('name')}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Checkbox
                        checked={show_out_of_stock}
                        onChange={(e) => this.setState({
                          show_out_of_stock: e.target.checked,
                        })}
                      >
                        Показать все
                      </Checkbox>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
              <Table
                columns={columns_materials}
                dataSource={materials}
                rowKey={(record) => record.id}
                pagination={pagination}
                size="small"
                onChange={this.handleTableChange}
              // bordered={true}
              />
            </TabPane>
            <TabPane tab="Журнал" key="2">
              <MaterialMovesGrid moves_relevance={moves_relevance} />
            </TabPane>
          </Tabs>
        </Preloader>
      </React.Fragment>
    );
  }
}

export default Materials;
