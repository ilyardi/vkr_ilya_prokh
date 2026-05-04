import React from 'react';
import { Modal } from 'antd';
import MaterialForm from './components/materialForm';

class MaterialNew extends React.Component {
  state = {};

  handleClose = () => {
    this.props.dataRelevanceChange();
    this.props.closer();
  };

  render() {
    return (
      <Modal
        title="Добавление нового материал"
        visible={this.props.visible}
        onCancel={this.handleClose}
        onOk={this.handleClose}
        footer={null}
        width="50%"
      >
        <MaterialForm
          units={this.props.units}
          closer={this.handleClose}
          handleAddMaterialInvoice={this.props.handleAddMaterialInvoice}
        />
      </Modal>
    );
  }
}

export default MaterialNew;
