import React from 'react';
import { Modal } from 'antd';
import MaterialMovesGrid from './components/movesGrid'

class MaterialShow extends React.Component {

  state = {
    material: {
      id: this.props.selected_material.id,
      name: this.props.selected_material.name,
    }

  }

  handleClose = () => {
    this.props.dataRelevanceChange()
    this.props.closer()
  };

  render() {
    const { material } = this.state
    return (
      <Modal
        title='Движение материала'
        visible={this.props.visible}
        onCancel={this.handleClose}
        onOk={this.handleClose}
        footer={null}
        width="80%"
      >
        <MaterialMovesGrid
          material={material}
        />
      </Modal>
    )
  }
}

export default MaterialShow