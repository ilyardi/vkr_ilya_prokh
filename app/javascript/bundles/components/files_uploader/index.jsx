import React, { useState, useEffect, useReducer } from 'react';
import Rest from 'tools/rest';
import { Button, Upload, message, Modal, Table, Typography, Form, Input, Popconfirm } from 'antd';
import {
  FileOutlined,
  FolderOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileGifOutlined,
  ArrowLeftOutlined,
  RollbackOutlined,
  FolderAddOutlined,
  SettingOutlined,
  DeleteOutlined,
  InboxOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  findIndex as _findIndex,
  reject as _reject,
} from 'lodash';
import { toast } from 'react-toastify';
import FileViewer from 'components/file_viewer';

const { Dragger } = Upload;
const { Text } = Typography;

const FilesUploader = (props) => {
  const [fileList, setFileList] = useState([]);
  const [parent, setParent] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [openedFile, setOpenedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  // const [showFolderCreate, setShowFolderCreate] = useState(false);
  const [showFileSetting, setShowFileSetting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const columns = [
    {
      dataIndex: 'type',
      key: 'type',
      width: "42px",
      render: (value, record) => {
        switch (value) {
          case 'folder':
            return <FolderOutlined style={{ fontSize: '25px', color: 'deepskyblue' }} />
          case 'gif':
            return <FileGifOutlined style={{ fontSize: '18px' }}/>
          case 'docx':
            return <FileWordOutlined style={{ fontSize: '18px' }}/>
          case 'pdf':
            return <FilePdfOutlined style={{ fontSize: '18px' }}/>
          case 'jpg':
            return <FileImageOutlined style={{ fontSize: '18px' }}/>
          case 'png':
            return <FileImageOutlined style={{ fontSize: '18px' }}/>
          case 'parent':
            return <ArrowLeftOutlined style={{ fontSize: '25px', color: 'deepskyblue' }} />
          default:
            return <FileOutlined style={{ fontSize: '18px' }}/>
        }
      }
    },
    {
      dataIndex: 'name',
      key: 'name',
      // render: (value, record) => (<Text>{record.name}</Text>)
    },
    {
      dataIndex: 'type',
      key: 'type',
      width: '20%',
      render: (value, record) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%'}}>
          {value != 'folder' &&
            <a href={record.download_url} onClick={(e)=> {e.stopPropagation()}}>
              <Button style={{ border: 'none', backgroundColor: 'unset' }} icon={<DownloadOutlined />} />
            </a>
          }
          <Button onClick={(e) => { handleOpenSetting(e, record) }} style={{ border: 'none', backgroundColor: 'unset' }} icon={<SettingOutlined />} />
          <Popconfirm
            title="Удаление файла"
            description="Вы уверены что хотите удалить?"
            onConfirm={(e) => { handleDeleteFile(e, record.uid) }}
            onCancel={(e) => { e.stopPropagation() }}
            okText="Да"
            cancelText="Нет"
            onClick={(e) => { e.stopPropagation()}}
          >
            <Button
              style={{ border: 'none', backgroundColor: 'unset' }}
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]

  const getFiles = () => {
    const filter = {
      related_obj_type: props.related_obj_type,
      related_obj_id: props.related_obj_id,
      parent_id: parentId,
    };
    setUploading(true)
    Rest.get(`/api/v1/documents.json`, { params: { filter: filter } }).then((response) => {
      const { documents, parent } = response.data;
      setParent(parent)
      setFileList(documents);
      setUploading(false)
    });
  };

  const handleDeleteFile = (e, uid) => {
    e.stopPropagation()
    setUploading(true)
    Rest.delete(`/api/v1/documents/${uid}`)
      .then((response) => {
        const newFileList = _reject(fileList, (item) => {
          return item.uid == uid;
        });
        setFileList(newFileList);
        toast.success(`Файл ${uid} успешно удален`);
      })
      .catch((e) => {
        console.error('error', e);
        toast.error('Ошибка удаления файла');
      }).finally(() => {
        setUploading(false)
      });
  };

  const handleClickRow = (record) => {
    if (record.type == 'folder') {
      setParentId(record.uid)
      return
    }
    setOpenedFile(record);
    setShowPreview(true);
  };

  const handleLevelUp = () => {
    setParentId(parent.parent_id)
  };

  const handleUploadFile = (file) => {
    const formData = new FormData();
    if (file.uid) {
      formData.append('file', file);
    } else {
      formData.append('doc_type', 'folder')
    };
    formData.append('title', file.name);
    if (parentId) {formData.append('parent_id', parentId) }
    formData.append('related_obj_id', props.related_obj_id);
    formData.append('related_obj_type', props.related_obj_type);
    setUploading(true)
    Rest.post(`/api/v1/documents.json`, formData).then((response) => {
      const { documents, document } = response.data;
      setFileList(documents)
      if (document?.uid) {
        toast.success(`Файл ${document?.name} успешно загружен`);
      }
      if (!document.errors) { setShowFileSetting(false) }
    }).catch((e) => {
      console.error('error', e);
      toast.error(`Ошибка загрузки файла: ${e}`);
    })
    .finally(() => {
      setUploading(false)
    });
  };

  const handleOpenSetting = (e, record) => {
    e.stopPropagation()
    setOpenedFile(record)
    setShowFileSetting(true)
  };

  const handleUpdateFile = (record) => {
    const params = {
      title: record.name
    }
    setUploading(true)
    Rest.put(`/api/v1/documents/${openedFile.uid}`, params).then((response) => {
      const { document } = response.data;
      const newFileList = _map(fileList, (item) => {
        if (document.uid == item.uid) {
          return document
        }
        return item
      });
      setFileList(newFileList)
      setShowFileSetting(false)
      toast.success(`Изменение прошло успешно`);
    }).catch((e) => {
      console.error('error', e);
      toast.error(`Ошибка изменения файла: ${e.response.data.document.errors}`);
    })
    .finally(() => {
      setUploading(false)
    });
  };

  const uploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload(file, newFileList) {
      handleUploadFile(file)
      return false;
    },
  };

  useEffect(() => {
    if (props.related_obj_id) {
      getFiles();
    }
  }, [parentId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {showPreview && (
        <FileViewer
          visible={showPreview}
          onCancel={() => { setShowPreview(false) }}
          onOk={() => { setShowPreview(false) }}
          file={openedFile}
        />
      )}
      {showFileSetting &&
        <Modal
          title={openedFile ? 'Изменения файла' : "Создание папки"}
          visible={showFileSetting}
          onCancel={() => { setShowFileSetting(false) }}
          onOk={() => { setShowFileSetting(false) }}
          footer={false}
        >
          <Form
            onFinish={openedFile ? handleUpdateFile : handleUploadFile}
            // style={{marginTop: "30px"}}
            // layout="vertical"
          >
            <Form.Item
              name='name'
              label='Название: '
              initialValue={openedFile?.name || ''}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button style={{display: 'block', width: '150px', margin: '0 auto'}} type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      }
      {!props.onlyFiles &&
        <>
          <div
            style={{
              display: 'inline-flex',
              justifyContent: 'flex-end',
              alignContent: 'center',
              alignItems: 'center',
              margin: '0 20px 10px 20px',
            }}
          >
            <Button
              style={{ border: 'none' }}
              icon={<FolderAddOutlined style={{ fontSize: '26px' }} />}
              onClick={(event) => {
                setOpenedFile(null)
                setShowFileSetting(true)
              }}
            />
          </div>
          <div
            onClick={parent ? handleLevelUp : null}
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '30px',
              borderRadius: '10px',
              backgroundColor: 'aliceblue',
              marginBottom: '10px'
            }}
          >
            {parent &&
              <RollbackOutlined style={{ marginLeft: '10px' }} />
            }
            <Text style={{ margin: '0 auto' }}>{parent ? parent.name : '/'}</Text>
          </div>
        </>
      }
      <Dragger {...uploadProps} style={{border: 'none'}}>
        {(fileList.length > 0) &&
          <Table
            size='large'
            showHeader={false}
            dataSource={fileList}
            columns={columns}
            rowKey={(record) => record.uid}
            pagination={false}
            scroll={{
              y: 700,
            }}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => {
                    event.stopPropagation()
                    handleClickRow(record)
                  },
              };
            }}
            loading={uploading}
            style={{marginBottom: '20px'}}
          />}
        <p className="ant-upload-drag-icon">
             <InboxOutlined />
        </p>
        <p className="ant-upload-text">Нажмите или перенесите файлы в эту область для загрузки</p>
      </Dragger>
    </div>
  );
};

export default FilesUploader;
