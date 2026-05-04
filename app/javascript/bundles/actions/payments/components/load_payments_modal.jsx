import React from 'react';
import PropTypes from 'prop-types';
import { withSnackbar } from 'notistack';
import dayjs from 'dayjs';

import Rest from 'tools/rest';

import {
  Typography,
  DatePicker,
  Button,
  Modal,
  Upload,
  Form,
  Radio,
  Steps,
  Table,
  Tag,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

class LoadPaymentsModal extends React.Component {
  state = {
    open: false,
    saving: false,

    currentStep: 0,
    uploadPayments: null,
    uploadStats: null,

    form: {},
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({
      open: false,
      saving: false,
      currentStep: 0,
      uploadPayments: null,
      uploadStats: null,
      form: {},
    });
  };

  handleStepLoad() {
    const { form } = this.state;
    const data = new FormData();
    let url = null;

    data.append('file', form.file);
    if (form.file_date) {
      data.append('file_date', form.file_date);
    }
    data.append('test', 'true');

    switch (form.file_type) {
      case 'sberbank':
        url = '/api/v1/payments/load_sberbank';
        break;
      case 'rschet':
        url = '/api/v1/payments/load_rschet';
        break;
      case 'minbank_ones':
        url = '/api/v1/payments/load_minbank_ones';
        break;
      default:
        message.error('Выберите тип файла');
        return;
    }

    this.setState({ saving: true });

    Rest.post(url, data)
      .then((response) => {
        const { payments } = response.data;

        if (payments) {
          data.delete('test');
          this.setState({
            currentStep: 1,
            uploadRequest: {
              url: url,
              data: data,
            },
            uploadPayments: payments,
          });
        }
      })
      .catch((error) => {
        message.error('Ошибка загрузки файла');
        console.log(error);
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  }

  handleStepSave() {
    const { uploadRequest } = this.state;

    this.setState({ saving: true });

    Rest.post(uploadRequest.url, uploadRequest.data)
      .then((response) => {
        const { stats } = response.data;

        if (stats) {
          this.setState({ currentStep: 2, uploadStats: stats });
        }
      })
      .catch((error) => {
        message.error('Ошибка загрузки файла');
        console.log(error);
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    switch (this.state.currentStep) {
      case 0:
        this.handleStepLoad();
        break;
      case 1:
        this.handleStepSave();
        break;
    }
  };

  handleSelectFile = (name) => (file) => {
    this.setState({
      form: { ...this.state.form, [name]: file },
    });

    return false;
  };

  handleDate = (name) => (value) => {
    const date = value ? value.format('DD.MM.YYYY') : null;

    this.setState({
      form: { ...this.state.form, [name]: date },
    });
  };

  handleRadio = (name) => (e) => {
    this.setState({
      form: { ...this.state.form, [name]: e.target.value },
    });
  };

  render() {
    const { currentStep, uploadStats, uploadPayments } = this.state;

    const disableSubmit = !this.state.form.file || this.state.saving;

    const paymentsColumns = [
      {
        title: 'Лицевой',
        dataIndex: 'account_number',
        key: 'account_number',
      },
      {
        title: 'Сумма',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Дата',
        dataIndex: 'paid_at',
        key: 'paid_at',
        render: (text, record, index) => {
          return dayjs(text).format('DD MMMM YYYY');
        },
      },
      {
        title: '',
        key: 'exist',
        dataIndex: 'exist',
        render: (text) => (
          <span>
            {text && (
              <Tag color={'green'} key={'exist'}>
                Уже добавлен
              </Tag>
            )}
          </span>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Button onClick={this.handleOpen}>
          Загрузить платежи
          <UploadOutlined />
        </Button>

        {this.state.open && (
          <Modal
            title="Загрузка платежей"
            visible={this.state.open}
            onCancel={this.handleClose}
            footer={[
              currentStep <= 1 && (
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={disableSubmit}
                  onClick={this.handleSubmit}
                >
                  {currentStep == 0 && 'Загрузить'}
                  {currentStep == 1 && 'Сохранить'}
                </Button>
              ),
              <Button key="back" onClick={this.handleClose}>
                Закрыть
              </Button>,
            ]}
          >
            <Steps current={currentStep} type="navigation" size="small">
              <Steps.Step title={'Выбор файла'} />
              <Steps.Step title={'Проверка'} />
              <Steps.Step title={'Загружено'} />
            </Steps>
            <br />
            <br />
            {currentStep == 0 && (
              <Form layout={'vertical'} onSubmit={this.handleSubmit}>
                <Form.Item label="Дата загружаемых платежей">
                  <DatePicker format={'DD.MM.YYYY'} onChange={this.handleDate('file_date')} />
                </Form.Item>
                <Form.Item label="Тип файла">
                  <Radio.Group onChange={this.handleRadio('file_type')}>
                    <Radio value="sberbank">Сбербанк</Radio>
                    <Radio value="rschet">Расчетный счет</Radio>
                    <Radio value="minbank_ones">МИНБанк самообслуж.</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item>
                  <Upload beforeUpload={this.handleSelectFile('file')}>
                    <Button>
                      <UploadOutlined /> Выберите файл Сбербанка
                    </Button>
                  </Upload>
                </Form.Item>
              </Form>
            )}
            {currentStep == 1 && (
              <React.Fragment>
                <Table dataSource={uploadPayments} columns={paymentsColumns} />
              </React.Fragment>
            )}
            {currentStep == 2 && (
              <React.Fragment>
                <Typography.Title level={4}>
                  Добавлено {uploadStats.added} платежей на сумму {uploadStats.added_amount} руб.
                </Typography.Title>
              </React.Fragment>
            )}
          </Modal>
        )}
      </React.Fragment>
    );
  }
}

LoadPaymentsModal.propTypes = {
  // classes: PropTypes.object.isRequired,
};

export default withSnackbar(LoadPaymentsModal);
