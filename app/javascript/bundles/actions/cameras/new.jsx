import React from 'react';
import Rest from 'tools/rest';
import { Modal } from 'antd';
import CameraForm from './components/cameraForm';

class CameraNew extends React.Component {
  state = {};

  handleClose = () => {
    this.props.dataRelevanceChange();
    this.props.closer();
  };

  render() {
    return (
      <Modal
        title="Добавить новую камеру"
        visible={this.props.visible}
        onCancel={this.handleClose}
        onOk={this.handleClose}
        footer={null}
        width="90%"
      >
        <CameraForm />
      </Modal>
    );
  }
}

export default CameraNew;
