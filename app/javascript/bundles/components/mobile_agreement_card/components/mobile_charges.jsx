import React from 'react';
import Rest from 'tools/rest';
import { Card, Typography } from 'antd';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import Preloader from 'components/preloader';

const { Text } = Typography;

class Charges extends React.Component {
  state = {
    charges: [],
    filter: this.props.filter,
    meta: {
      page: 1,
      per: 10,
      total: 0,
      order: 'desc',
      order_by: 'month',
    },
    loading: false,
    hasMore: true,
  };

  componentDidMount() {
    this.loadData();
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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

    if (!isEqual(prevState.filter, this.state.filter)) {
      this.setState({
        charges: [],
        meta: { ...this.state.meta, page: 1 },
        hasMore: true,
      });
    }
  }

  loadData = () => {
    const {
      meta: { page, per, order, order_by },
      filter,
      charges,
      loading,
    } = this.state;

    if (loading) return;

    this.setState({ loading: true });

    const params = { page, per, order, order_by, filter };

    Rest.get('/api/v1/lb_teleset_charges.json', { params })
      .then((response) => {
        const { lb_teleset_charges, meta } = response.data;

        this.setState({
          charges:
            page === 1
              ? lb_teleset_charges
              : [...charges, ...lb_teleset_charges],
          meta,
          hasMore:
            charges.length + lb_teleset_charges.length < meta.total,
        });
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleScroll = () => {
    const { loading, hasMore } = this.state;

    if (!hasMore || loading) return;

    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.offsetHeight;

    if (documentHeight - (scrollTop + windowHeight) < 100) {
      this.setState((prev) => ({
        meta: { ...prev.meta, page: prev.meta.page + 1 },
      }));
    }
  };

  render() {
    const { charges, loading } = this.state;

    return (
      <Preloader loading={loading && charges.length === 0}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {charges.map((charge) => (
            <Card
              key={charge.id}
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
                  {charge.fee} ₽
                </Text>

                <Text style={{ fontSize: '12px' }}>
                  {charge.paid > 0 ? 'Оплачено' : 'Не оплачено'}
                </Text>
              </div>

              <div style={{ fontSize: '12px' }}>
                <div>
                  <Text type="secondary">Оплачено:</Text>{' '}
                  {charge.paid} ₽
                </div>

                <div>
                  <Text type="secondary">Месяц:</Text>{' '}
                  {charge.month
                    ? dayjs(charge.month).format('MM.YYYY')
                    : '-'}
                </div>
              </div>
            </Card>
          ))}

          {loading && charges.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '8px',
                fontSize: '12px',
                color: '#999',
              }}
            >
              Загрузка...
            </div>
          )}

          {!loading && charges.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#999',
                fontSize: '14px',
              }}
            >
              Начислений нет
            </div>
          )}
        </div>
      </Preloader>
    );
  }
}

export default Charges;
