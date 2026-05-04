import React from 'react';
import Rest from 'tools/rest';
import { Modal } from 'antd';
import MaterialForm from './components/materialForm';

class MaterialEdit extends React.Component {

  state = {
    material: {},
    materialLoaded: false,
  }

  loadMaterial() {
    const id = this.props.selected_material.id
    Rest.get(`api/v1/warehouse_materials/${id}.json`).then((respons) => {
      this.setState({ material: respons.data.material, materialLoaded: true });
    });
  };

  componentDidMount() {
    this.loadMaterial();
  };

  handleClose = () => {
    this.props.dataRelevanceChange()
    this.props.closer()
  };

  render() {
    const { material, materialLoaded } = this.state
    return (
      <Modal
        title='Изменение материала'
        visible={this.props.visible}
        onCancel={this.handleClose}
        onOk={this.handleClose}
        footer={null}
        width="50%"
      >
        {materialLoaded &&
          <MaterialForm
            material={material}
            units={this.props.units}
            closer={this.handleClose}
            handleAddMaterialInvoice={this.props.handleAddMaterialInvoice}
          />}
      </Modal>

    )
  }
}

export default MaterialEdit