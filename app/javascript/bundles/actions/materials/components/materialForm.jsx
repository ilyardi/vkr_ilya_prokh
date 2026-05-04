import React from 'react';
import Rest from 'tools/rest';
import { Form, Input, InputNumber, Button, Select, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { find as _find, map as _map, last as _last, forEach as _forEach } from 'lodash';
import { toast } from 'react-toastify';
import { offset } from 'dom-helpers';

const { Option } = Select;

class MaterialForm extends React.Component {

  state = {
    material: {
      id: null,
      name: null,
      code: null,
      unit: null,
      quantity: null,
      warehouse_material_category_id: null,
      coords: {
        rack: null,
        shelf: null,
      }
    },
    errors: null,
    newCategory: '',
    material_categories: [],
    units: this.props.units,
    loadMaterial: false,
  };

  formRef = React.createRef();

  constructor(props) {
    super(props);
    if (props.material && props.material.id) {
      this.state = {
        ...this.state,
        material: props.material
      };
    }
  };

  componentDidMount() {
    this.loadWarehouseMaterialCategories();
  }

  loadWarehouseMaterialCategories() {
    Rest.get('/api/v1/warehouse_material_categories.json').then((response) => {
      this.setState({ material_categories: response.data.material_categories });
    });
  }

  addNewCategory = () => {
    if (this.state.newCategory === '') {
      return;
    };

    const { material_categories } = this.state;
    const category = {
      name: this.state.newCategory,
    };
    Rest.post('/api/v1/warehouse_material_categories.json', { category })
      .then((response) => {
        this.setState({
          material_categories: [...material_categories, response.data.category],
          newCategory: '',
        });
      })
      .catch((err) => {
        const { errors } = err.response.data;
        if (errors.name) {
          toast.error(errors.name.join('\n'));
        }
      });
  };

  onChangeFieldCategory = (event) => {
    this.setState({
      newCategory: event.target.value,
    });
  };

  handleCreateNewMaterial = (value) => {
    Rest.post('api/v1/warehouse_materials.json', value)
      .then((response) => {
        const { material } = response.data
        this.setState({ material: material, errors: null });
        if (material.id !== 0 && this.state.loadMaterial) {
          this.props.handleAddMaterialInvoice(material);
        }
        toast.success('Сохранено');
        this.props.closer()
      })
      .catch((err) => {
        this.setState({ errors: err.response.data.material.errors })
        toast.error('Ошибка создания');
      });
  };

  handleUpdateMaterial = (value) => {
    const id = this.state.material.id
    Rest.put(`api/v1/warehouse_materials/${id}.json`, value)
      .then((response) => {
        const { material } = response.data
        this.setState({ material: material, errors: null });
        if (material.id !== 0 && this.state.loadMaterial) {
          this.props.handleAddMaterialInvoice(material);
        }
        toast.success('Сохранено');
        this.props.closer()
      })
      .catch((err) => {
        this.setState({ errors: err.response.data.material.errors })
        toast.error('Ошибка изменения');
      });
  };

  onReset = () => {
    this.formRef.current.resetFields();
  };

  handleOk = () => {
    this.formRef.current.submit();
  };

  handleCancel = () => {
    this.onReset();
    this.props.closer();
  };

  handleInvoice = () => {
    const loadMaterial = true;
    this.setState({ loadMaterial });
    this.formRef.current.submit();
  };

  render() {
    const { material, units, material_categories, errors, newCategory } = this.state
    const isCreating = (material.id == null);

    const onFinish = isCreating ? this.handleCreateNewMaterial : this.handleUpdateMaterial

    let fields = []
    _forEach(material, (value, key) => {
      if (key == "coords") {
        _forEach(value, (value, key) => {
          fields = [...fields, {
            name: ["material", "coords", key],
            value: value,
            errors: errors ? errors[key] : [],
          }]
        })
      }
      else {
        fields = [...fields, {
          name: ["material", key],
          value: value,
          errors: errors ? errors[key] : [],
        }]
      }
    })

    return (
      <Form
        fields={fields}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ paddingTop: 12 }}
        ref={this.formRef}
        onFinish={onFinish}
        style={{ margin: "12px 20px" }}
        onFieldsChange={(changedFields, allFields) => {
          _map(changedFields, (v) => {
            this.setState((prevState) => {
              v.name[1] == 'coords' ?
                prevState.material.coords[_last(v.name)] = v.value :
                prevState.material[_last(v.name)] = v.value;
              prevState.errors ? prevState.errors[_last(v.name)] = [] : null;
              return prevState;
            })
          })
        }}
      >
        <Form.Item
          name={['material', 'warehouse_material_category_id']}
          label="Категория"
        >
          <Select
            style={{ width: 240 }}
            placeholder="выберите категорию"
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                  <Input
                    style={{ flex: 'auto' }}
                    value={newCategory}
                    onChange={this.onChangeFieldCategory}
                  />
                  <a
                    style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                    onClick={this.addNewCategory}
                  >
                    <PlusOutlined />
                    Добавить
                  </a>
                </div>
              </div>
            )}
          >
            {material_categories.map((item) => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name={['material', 'name']}
          label="Название"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['material', 'unit']}
          label="Ед. изм."
        >
          <Select placeholder="select unit" options={units} />
        </Form.Item>
        <Form.Item
          label="Стеллаж"
          name={['material', 'coords', 'rack']}
          style={{ marginBottom: '0px' }}
        >
          <InputNumber style={{ width: "30%" }} min={0} />
        </Form.Item>
        <Form.Item
          label="Полка"
          name={['material', 'coords', 'shelf']}
        >
          <InputNumber style={{ width: "30%" }} min={0} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '70%', margin: "0 auto" }}>
            <Button key="submit" type="primary" onClick={this.handleOk}>
              Сохранить
            </Button>
            <Button key="invoice" type="primary" onClick={this.handleInvoice}>
              Сохранить и добавить в накладную
            </Button>
            <Button key="decline" onClick={this.handleCancel}>
              Отмена
            </Button>
          </div>
        </Form.Item>
      </Form >
    )
  }
}

export default MaterialForm

