import React, { useState, useEffect } from 'react';
import Rest from 'tools/rest';
import { Button, Typography, Collapse, Checkbox } from 'antd';
import { map as _map } from 'lodash';
import { toast } from 'react-toastify';

const { Title } = Typography
const { Panel } = Collapse;

const NotificationRules = (props) => {
  const [notification_rules, setNotificationRules] = useState([]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(false);

  const { user_id } = props;

  const getNotificationRules = () => {
    const filter = {
      user_id: user_id
    };
    setLoading(true)
    Rest.get(`/api/v1/notification_rules.json`, { params: { filter: filter } }).then((response) => {
      const { notification_rules, options } = response.data;
      setNotificationRules(notification_rules);
      setOptions(options);
      setLoading(false)
    });
  };

  const updateNotificationRules = (target_type) => {
    let notification_rule = {
      user_id: user_id,
      target_type: target_type,
    }

    if (notification_rules[target_type]) {
      notification_rule = notification_rules[target_type]
    }

    const params = {
      notification_rule: notification_rule
    }
    setLoading(true)
    Rest.post(`/api/v1/notification_rules.json`, params).then((response) => {
      const { notification_rule } = response.data;
      toast.success('Правило успешно сохранено');
    }).catch((e) => {
      console.error('error', e);
      toast.error('Ошибка сохранения');
    }).finally(() => {
      setLoading(false)
    });
  };

  useEffect(() => {
    if (user_id) {
      getNotificationRules();
    }
  }, []);

  const updateRuleField = (targetType, field, values) => {
    setNotificationRules((prev) => {
      const next = { ...prev };
      const currentRule = next[targetType] || {
        user_id: user_id,
        target_type: targetType,
      };

      next[targetType] = {
        ...currentRule,
        [field]: values,
      };

      return next;
    });
  };

  return (
    <div>
      <Collapse>
        {_map(options, (option, key)=>(
          <Panel
            key={key}
            header={<span style={{ fontWeight: 700 }}>{option.name}</span>}
            style={{ backgroundColor: '#f6ffed' }}
            extra={
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  updateNotificationRules(key);
                }}
              >
                Сохранить
              </Button>
            }
          >
            <div style={{ marginBottom: '24px' }}>
                <Title level={5}>Отслеживаемые типы</Title>
                <Checkbox.Group
                  options={option.types}
                  value={notification_rules[key]?.searcheble_types || []}
                  onChange={(values) => {
                    updateRuleField(key, 'searcheble_types', values);
                  }}
                />
            </div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={5}>Отслеживаемые поля</Title>
                <Checkbox.Group
                  options={option.fields}
                  value={notification_rules[key]?.searcheble_fields || []}
                  onChange={(values) => {
                    updateRuleField(key, 'searcheble_fields', values);
                  }}
                />
            </div>
            <div>
                <Title level={5}>Дополнительные поля в уведомлении</Title>
                <Checkbox.Group
                  options={option.fields}
                  value={notification_rules[key]?.dislay_fields || []}
                  onChange={(values) => {
                    updateRuleField(key, 'dislay_fields', values);
                  }}
                />
            </div>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default NotificationRules;
