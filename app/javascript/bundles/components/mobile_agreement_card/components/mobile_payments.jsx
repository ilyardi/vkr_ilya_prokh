import React from 'react';
import Rest from 'tools/rest';
import { Card, Typography } from 'antd';
import { isEqual } from 'lodash';
import dayjs from 'dayjs';
import Preloader from 'components/preloader';

const { Text } = Typography;

class Payments extends React.Component {
  state = {
    payments: [],
    filter: this.props.filter,
    meta: {
      page: 1,
      per: 10,
      total: 0,
      order: 'desc',
      order_by: 'pay_date',
    },
    loading: false,
    total_amount: null,
    hasMore: true,
  };

  statuses = {
    0: 'Проведен',
    1: 'Подтвержден сверкой',
    2: 'Аннулирован',
  };

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.meta.order !== this.state.meta.order ||
      prevState.meta.order_by !== this.state.meta.order_by ||
      !isEqual(prevState.filter, this.state.filter)
    ) {
      this.loadData();
    }

    // если изменился фильтр — сбрасываем список
    if (!isEqual(prevState.filter, this.state.filter)) {
      this.setState({
        payments: [],
        meta: { ...this.state.meta, page: 1 },
        hasMore: true,
      });
    }
  }

  loadData = () => {
    const {
      meta: { page, per, order, order_by },
      filter,
      payments,
    } = this.state;

    if (this.state.loading) return;

    this.setState({ loading: true });

    Rest.get('/api/v1/lb_payments.json', {
      params: { page, per, order, order_by, filter },
    })
      .then((response) => {
        const { lb_payments, meta, total_amount } = response.data;

        this.setState({
          payments: page === 1 ? lb_payments : [...payments, ...lb_payments],
          meta,
          total_amount,
          hasMore: payments.length + lb_payments.length < meta.total,
        });
      })
      .catch(console.error)
      .finally(() => this.setState({ loading: false }));
  };

  handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const { loading, hasMore } = this.state;

    if (!loading && hasMore && scrollHeight - scrollTop - clientHeight < 50) {
      this.setState((prev) => ({
        meta: { ...prev.meta, page: prev.meta.page + 1 },
      }));
    }
  };

  render() {
    const { payments, loading } = this.state;

    return (
      <Preloader loading={loading && payments.length === 0}>
        <div
          onScroll={this.handleScroll}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '90vh',
            overflowY: 'auto',
            paddingRight: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {payments.map((payment) => (
            <Card
              key={payment.record_id}
              size="small"
              style={{ borderRadius: '8px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <Text style={{ fontSize: '16px' }}>
                  {payment.amount} ₽
                </Text>
                <Text style={{ fontSize: '12px' }}>
                  {this.statuses[payment.status]}
                </Text>
              </div>

              <div style={{ fontSize: '12px' }}>
                <div>
                  <Text type="secondary">Дата приема:</Text>{' '}
                  {payment.pay_date
                    ? dayjs(payment.pay_date).format('DD.MM.YYYY')
                    : '-'}
                </div>
                <div>
                  <Text type="secondary">Добавлен:</Text>{' '}
                  {payment.local_date
                    ? dayjs(payment.local_date).format('DD.MM.YYYY')
                    : '-'}
                </div>
              </div>

              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                <Text type="secondary">Категория:</Text>{' '}
                {payment.class_name}
              </div>

              {payment.cancel_date && (
                <div style={{ fontSize: '11px', color: '#999' }}>
                  Аннулирован: {payment.cancel_date}
                </div>
              )}
            </Card>
          ))}

          {loading && payments.length > 0 && (
            <Text style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
              Загрузка...
            </Text>
          )}
        </div>
      </Preloader>
    );
  }
}

export default Payments;
