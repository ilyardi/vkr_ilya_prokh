import React from 'react';
import Rest from 'tools/rest';
import { Modal } from 'antd';
import CameraForm from './components/cameraForm';

class CameraUpdate extends React.Component {
  state = {
    camera: {},
    agreements: [],
    cameraLoaded: false,
  };

  loadCamera() {
    const id = this.props.selected_camera.id;
    Rest.get(`api/v1/cameras/${id}.json`).then((respons) => {
      this.setState({
        camera: respons.data.camera,
        cameraLoaded: true,
        agreements: respons.data.agreements,
      });
    });
  }

  componentDidMount() {
    this.loadCamera();
  }

  handleClose = () => {
    this.props.dataRelevanceChange();
    this.props.closer();
  };

  render() {
    const { camera, agreements, cameraLoaded } = this.state;
    return (
      <Modal
        title={`Паспорт камеры № ${camera.id} - ${camera.name}`}
        visible={this.props.visible}
        onCancel={this.handleClose}
        onOk={this.handleClose}
        width="90%"
        footer={null}
      >
        {cameraLoaded && <CameraForm agreements={agreements} camera={camera} />}
      </Modal>
    );
  }
}

export default CameraUpdate;
