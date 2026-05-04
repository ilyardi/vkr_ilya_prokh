import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import KinescopePlayer from 'components/kinescope-player';
import Rest from 'tools/rest';
import Preloader from 'components/preloader';

import styles from './styles';

class CameraPlayer extends Component {
  state = {
    hls: null,
    loading: true,
  };

  componentDidMount() {
    if (this.props.open) {
      this.loadManifest();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.open !== this.props.open ||
        prevProps.camera.url !== this.props.camera.url ||
        prevProps.camera.token !== this.props.camera.token ||
        prevProps.camera.secure_token !== this.props.camera.secure_token) &&
      this.props.open
    ) {
      this.loadManifest();
    }
  }

  loadManifest = () => {
    this.setState({ loading: true });
    const { camera } = this.props;

    Rest.get(camera.url)
      .then((json) => {
        const { hls } = json.data;
        this.setState({
          hls,
          loading: false,
        });
      })
      .catch((e) => {});
  };

  render() {
    const { hls, loading } = this.state;
    const { open, title, height } = this.props;

    if (!open) {
      return null;
    }

    return (
      <Preloader loading={loading}>
        <KinescopePlayer
          key={hls}
          source={{ hls: hls }}
          options={{
            preload: 'metadata',
            muted: true,
            //autostart: true,
            title: title ? title : null,
            aspect_ratio: '16:9',
            live: true,
            width: '100%',
            height: height ? height : '100%',
          }}
        />
      </Preloader>
    );
  }
}

export default withStyles(styles)(CameraPlayer);
