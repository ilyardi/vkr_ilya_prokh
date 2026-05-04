import React from 'react';
import { Modal } from 'antd';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  reject as _reject,
  includes as _includes,
} from 'lodash';

const FileViewer = (props) => {
  let url = props.file?.url ? props.file.url : '';

  if (_includes('doc docx pdf xls xlsx txt csv ppt pptx odt', props.file.ext)) {
    url = `https://docs.google.com/gview?url=${url}&embedded=true`;
  }

  // console.log(url);
  return (
    <Modal
      title={props.file?.name}
      visible={props.visible}
      onCancel={props.onCancel}
      onOk={props.onOk}
      footer={false}
      style={{ bottom: '20px', top: '20px' }}
      width={'80%'}
    >
      <iframe
        frameBorder={0}
        src={url}
        style={{
          width: '100%',
          height: '600px',
        }}
      >
        Ваш браузер не поддерживает возможность отображения документов
      </iframe>
    </Modal>
  );
};

export default FileViewer;
