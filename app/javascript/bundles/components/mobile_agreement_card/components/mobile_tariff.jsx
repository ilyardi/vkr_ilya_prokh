import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Tag, Button } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const MobileTariffs = ({ tariffs, syncDom, syncSvnDom }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const containerRef = useRef(null);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // Если скролл дошёл до низа, подгружаем ещё карточки
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      setVisibleCount((prev) => Math.min(prev + 5, tariffs.length));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const renderStatus = (blocked) => {
    switch (blocked) {
      case 0: return <Tag color="green">Активен</Tag>;
      case 10: return <Tag color="volcano">Отключен</Tag>;
      default: return <Tag color="orange">Блок</Tag>;
    }
  };

  const visibleTariffs = tariffs.slice(0, visibleCount);

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '90vh', overflowY: 'auto', scrollbarWidth: 'none', }}
    >
      {visibleTariffs.map((tariff) => (
        <Card key={tariff.vg_id} size="small" bodyStyle={{padding: '12px'}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14 }}>{tariff.login}</Text>
              {renderStatus(tariff.blocked)}
            </div>

            <div>
              <Text style={{ fontSize: 13 }}>{tariff.descr}</Text>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Стоимость:</Text>
              <Text style={{ marginLeft: 6 }}>{tariff.amount} ₽</Text>
            </div>

            {tariff.addons && tariff.addons.length > 0 && (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tariff.addons.map(addon => (
                  <div key={addon.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Text type="secondary" style={{ maxWidth: '70%' }}>{addon.descr}</Text>
                    <Text type="secondary">{addon.amount} ₽</Text>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
              <div>
                Подкл.: {tariff.acc_ondate ? dayjs(tariff.acc_ondate).format('DD.MM.YYYY') : '-'}
              </div>
              <div>
                Откл.: {tariff.acc_offdate ? dayjs(tariff.acc_offdate).format('DD.MM.YYYY') : '-'}
              </div>
            </div>

            {(tariff.descr?.includes('Умный домофон') || (tariff.descr?.includes('Видеонаблюдение') && tariff.blocked !== 10)) && (
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                {tariff.descr?.includes('Умный домофон') && (
                  <Button size="small" onClick={syncDom}>Синхр. домофон</Button>
                )}
                {tariff.descr?.includes('Видеонаблюдение') && tariff.blocked !== 10 && (
                  <Button size="small" onClick={syncSvnDom}>Синхр. видео</Button>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}

      {visibleCount < tariffs.length && (
        <Text style={{ textAlign: 'center', margin: 8, color: '#888' }}>Загрузка...</Text>
      )}
    </div>
  );
};

export default MobileTariffs;
