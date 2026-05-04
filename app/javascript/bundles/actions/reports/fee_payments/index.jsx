import React, { Component } from 'react';
import Rest from 'tools/rest';
import { Link } from 'react-router-dom';
import { isEqual, replace as _replace, map as _map } from 'lodash';
import dayjs from 'dayjs';
import { withStyles } from '@material-ui/core/styles';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Layout,
  Table,
  Pagination,
  FloatButton,
  Modal,
  DatePicker,
  Select,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Radio,
  Typography,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import qs from 'qs';
import { debounce } from 'lodash';
import AgreementCard from 'components/agreement_card';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;

const { Header, Content, Footer } = Layout;

class FeePayments extends Component {
  state = {
    lb_agreements: [],
    lb_agreement: {},
    loading: true,
    meta: {
      page: 1,
      per: 10,
    },
    total: {},
    filter: {
      name: '',
      number: '',
      lk_status: null,
      bill_delivery: null,
      month: dayjs().format('YYYY-MM-DD'),
      type: '',
      class_name: null,
      balance: null,
    },
    lb_classes: [],
    visible_agreement_card: false,
  };

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Начисления', '')
  }

  componentDidMount() {
    document.title += ' | Начисления'
    this.loadAgreements(1);
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (!isEqual(prevState.filter, this.state.filter)) {
      this.loadAgreements(1);
    }
  };

  handlePagerChange = (page, per) => {
    this.loadAgreements(page, per);
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      loading: true,
      sortField: sorter.field,
      sortOrder: sorter.order,
      filter: { ...this.state.filter, ...filters },
    });
  };

  handleFilter = (name) => (event) => {
    this.setState({
      filter: { ...this.state.filter, [name]: event.target.value },
    });
  };

  handleDateFilter = (name) => (value) => {
    let dates = null;
    if (Array.isArray(value)) {
      dates = value.map((d) => {
        return d ? d.format('YYYY-MM-DD') : null;
      });
    } else {
      dates = value ? value.format('YYYY-MM-DD') : null;
    }
    this.setState({
      loading: true,
      filter: { ...this.state.filter, [name]: dates },
    });
  };

  loadAgreements = (page, per = this.state.meta.per) => {
    if (this.debounceLoad) {
      this.debounceLoad.cancel();
    }
    this.debounceLoad = debounce(() => {
      let params = {
        page: page,
        per: per,
        filter: this.state.filter,
      };

      Rest.get('/api/v1/lb_agreements/fee_payments_report.json', { params: params }).then(
        (response) => {
          this.setState({ loading: false });
          this.setState(response.data);
        },
      );
    }, 100);

    this.debounceLoad();
  };

  downloadAgreements = () => {
    const params = qs.stringify(
      { filter: this.state.filter },
      {
        arrayFormat: 'brackets',
      },
    );
    window.open(`/api/v1/lb_agreements/fee_payments_report.csv?${params}`);
  };

  render() {
    const { classes } = this.props;
    const { loading, meta, filter, total, lb_agreement, lb_agreements, visible_agreement_card, lb_classes } = this.state;
    const columns = [
      {
        title: '№ договора',
        dataIndex: 'number',
        key: 'number',
        render: (value, record) => {
          return (<a onClick={(event) => {
            this.setState({ visible_agreement_card: true, lb_agreement: record })
          }}>{value}</a>)
        }
      },
      // { title: 'ФИО', dataIndex: 'name', key: 'name' },
      { title: 'Адрес', dataIndex: 'address', key: 'address' },
      { title: 'Начисленно', dataIndex: 'fee', key: 'fee' },
      {
        title: 'Оплачено',
        dataIndex: 'payments',
        key: 'payments',
        filterMultiple: false,
        filters: [
          { text: 'Оплачено', value: 'paid' },
          { text: 'Не оплачено', value: 'no_paid' },
        ],
        filteredValue: filter.payments || null,
      },
      {
        title: 'Баланс',
        dataIndex: 'balance',
        key: 'balance',
        filterMultiple: false,
        filters: [
          { text: 'Положительный', value: '>' },
          { text: '0', value: '=' },
          { text: 'Отрицательный', value: '<' },
        ],
        filteredValue: filter.balance || null,
      },
      {
        title: 'Способ счета',
        dataIndex: 'bill_delivery',
        key: 'bill_delivery',
        type: 'radio',
        filters: [
          { text: 'Электронный+Бумажный', value: 'all' },
          { text: 'Электронный', value: 'email' },
          { text: 'Бумажный', value: 'receipt' },
        ],
        filterMultiple: true,
        filteredValue: filter.bill_delivery || null,
        render: (val) => {
          switch (val) {
            case 'all':
              return 'Электронный+Бумажный';
            case 'email':
              return 'Электронный';
            case 'receipt':
              return 'Бумажный';
          }
        },
      },
      {
        title: 'Контрагент',
        dataIndex: 'class_name',
        key: 'class_name',
        type: 'radio',
        filters: lb_classes,
        filterMultiple: true,
        filteredValue: filter.class_name || null,
      },
      {
        title: 'Статус ЛК',
        dataIndex: 'lk_status',
        key: 'lk_status',
        type: 'radio',
        filters: [
          { text: 'ПЛК', value: 'confirmed_lk' },
          { text: 'ЛК', value: 'unconfirmed_lk' },
          { text: 'БЕЗ ЛК', value: 'no_lk' },
        ],
        filterMultiple: true,
        filteredValue: filter.lk_status || null,
        render: (val) => {
          switch (val) {
            case 'confirmed_lk':
              return 'ПЛК';
            case 'unconfirmed_lk':
              return 'ЛК';
            case 'no_lk':
              return 'БЕЗ ЛК';
          }
        },
      },
    ];

    return (
      <React.Fragment>
        <FloatButton.BackTop />

        <PageHeader title="Начисления">
          {visible_agreement_card &&
            <Modal
              title={
                <React.Fragment>
                  <Text>Карточка договора № {lb_agreement.number}</Text>
                  < InfoCircleOutlined
                    style={{ marginLeft: '10px' }}
                    onClick={() => {
                      GotoAccountButton.gotoAccount(lb_agreement.uid, '_blank');
                    }}
                  />
                </React.Fragment>
              }
              visible={visible_agreement_card}
              onCancel={() => { this.setState({ visible_agreement_card: false }) }}
              onOk={() => { this.setState({ visible_agreement_card: false }) }}
              footer={false}
              width={'95%'}
            >
              <AgreementCard agrm_id={lb_agreement.id} />
            </Modal>
          }
          <Row>
            <Col flex={4}>
              <Row>
                <DatePicker
                  picker="month"
                  format="MMMM YYYY"
                  value={dayjs(filter.month, 'YYYY-MM-DD')}
                  onChange={this.handleDateFilter('month')}
                  className={classes.datePicker}
                  allowClear={false}
                />
                <Button style={{ marginLeft: '20px' }} onClick={this.downloadAgreements}>Скачать</Button>
              </Row>
              <Row style={{ marginTop: '15px' }}>
                <Radio.Group
                  name="filter_type"
                  onChange={this.handleFilter('type')}
                  value={filter.type}
                >
                  <Radio value={''}>Все</Radio>
                  <Radio value={2}>Физ.лица</Radio>
                  <Radio value={1}>Юр.лица</Radio>
                </Radio.Group>
              </Row>
            </Col>
            <Col flex={4}>
              <Row justify='space-around'>
                <Col>
                  <Statistic title="Начисленно кол-во" value={new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(meta.total) || '...'} />
                  <Statistic
                    title="Оплачено кол-во"
                    value={total.payments_count && meta.total ? `${new Intl.NumberFormat('ru-RU', { style: 'decimal'}).format(total.payments_count)} (${((total.payments_count / meta.total) * 100).toFixed(2)}%)` : '...'}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="Начисленно"
                    value={new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(total.fee)}
                    style={{
                      margin: '0 32px',
                    }}
                  />
                  <Statistic
                    title="Оплачено"
                    value={Number(total.payments) && total.fee ? `${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(total.payments)} (${((total.payments / total.fee) * 100).toFixed(2)}%)` : 0}
                    style={{
                      margin: '0 32px',
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </PageHeader>

        <Content className={classes.tableContainer}>
          <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            rowKey={(record) => record.id}
            loading={loading}
            columns={columns}
            dataSource={lb_agreements}
            hideOnSinglePage={true}
            onChange={this.handleTableChange}
            pagination={{
              defaultCurrent: '1',
              current: meta.page,
              total: meta.total,
              pageSize: meta.per || 50,
              onChange: this.handlePagerChange,
              position: ['bottomCenter'],
            }}
          />
          <br />
          <br />
        </Content>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  nowrap: {
    whiteSpace: 'nowrap',
  },
  filterSourceType: {
    width: '150px',
  },
  datePicker: {
    width: '150px',
  },
});

export default withStyles(styles)(FeePayments);
