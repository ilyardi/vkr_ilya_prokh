import React, { useState, useEffect, useRef } from 'react';
import Rest from 'tools/rest';
import { AbilityContext } from 'tools/ability';
import { List, Button, Toast, Card, Tag, Space } from 'antd-mobile';
import { UndoOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const Bonuses = ({ charges: initialCharges = [], handleFormUpdate }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [charges, setCharges] = useState(initialCharges);
  const containerRef = useRef(null);
  const context = React.useContext(AbilityContext);

  const handleRollbackCharge = (charge_id) => {
    Rest.get(`/api/v1/bonus_charges/${charge_id}/rollback_charge.json`)
      .then((response) => {
        const { charge } = response.data;
        setCharges((prev) => [charge, ...prev]);
        if (handleFormUpdate) handleFormUpdate();
        Toast.show('Откат выполнен успешно');
      })
      .catch(() => Toast.show('Ошибка отката транзакции'));
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      setVisibleCount((prev) => Math.min(prev + 5, charges.length));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [charges.length]);

  const renderChargeItem = (charge) => {
    const canRollback = context.can('rollback', 'BonusCharges');

    return (
      <List.Item
        key={charge.id}
        extra={
          canRollback ? (
            <Button
              size="mini"
              color="danger"
              fill="none"
              onClick={(e) => {
                e.stopPropagation();
                handleRollbackCharge(charge.id);
              }}
            >
              <UndoOutline />
            </Button>
          ) : null
        }
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={charge.amount > 0 ? 'success' : 'danger'}>
                {charge.amount > 0 ? 'Начисление' : 'Списание'}
              </Tag>
              <span style={{ fontWeight: 'bold', fontSize: 14 }}>
                {charge.amount} бонусов
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#999' }}>
              <strong>ID:</strong> {charge.id}
            </div>

            <div style={{ fontSize: 12, color: '#999' }}>
              <strong>Дата:</strong>{' '}
              {charge.created_at ? dayjs(charge.created_at).format('DD.MM.YYYY HH:mm:ss') : 'Не указана'}
            </div>

            {charge.lk_payment_id && (
              <div style={{ fontSize: 12 }}>
                <strong>Платеж:</strong>{' '}
                <Link to={{ pathname: '/lk_payments', search: `?payment_id=${charge.lk_payment_id}` }} style={{ color: '#1677ff' }}>
                  {charge.lk_payment_id}
                </Link>
              </div>
            )}

            {charge.comment && (
              <div style={{ fontSize: 12 }}>
                <strong>Описание:</strong> {charge.comment}
              </div>
            )}
          </Space>
        }
      >
        <div style={{ fontSize: 14, fontWeight: 500 }}>Транзакция #{charge.id}</div>
      </List.Item>
    );
  };

  const positiveCharges = charges.filter(c => c.amount > 0).slice(0, visibleCount);
  const negativeCharges = charges.filter(c => c.amount < 0).slice(0, visibleCount);

  return (
    <div ref={containerRef} style={{ padding: 12, height: '100vh', overflowY: 'auto' }}>
      {/* Статистика */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#999' }}>Всего операций</div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{charges.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#999' }}>Начислений</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#00b96b' }}>{positiveCharges.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#999' }}>Списаний</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}>{negativeCharges.length}</div>
          </div>
        </div>
      </Card>

      {/* Начисления */}
      {positiveCharges.length > 0 && (
        <Card title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Начисления</span>
          <Tag color="success">{positiveCharges.length}</Tag>
        </div>} style={{ marginTop: 12 }}>
          <List>{positiveCharges.map(renderChargeItem)}</List>
        </Card>
      )}

      {/* Списания */}
      {negativeCharges.length > 0 && (
        <Card title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Списания</span>
          <Tag color="danger">{negativeCharges.length}</Tag>
        </div>} style={{ marginTop: 12 }}>
          <List>{negativeCharges.map(renderChargeItem)}</List>
        </Card>
      )}

      {visibleCount < charges.length && (
        <Text style={{ textAlign: 'center', margin: 8, color: '#888' }}>Загрузка...</Text>
      )}

      {charges.length === 0 && (
        <Card style={{ marginTop: 12, textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: 14 }}>
          Нет данных по бонусным операциям
        </Card>
      )}
    </div>
  );
};

export default Bonuses;
