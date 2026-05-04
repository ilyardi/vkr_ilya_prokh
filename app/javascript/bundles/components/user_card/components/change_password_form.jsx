import React, { useState } from 'react';
import Rest from 'tools/rest';
import { Form, Input, Button, Space } from 'antd';
import { toast } from 'react-toastify';

const ChangePasswordForm = ({ userId, onSuccess }) => {
  const [formData, setFormData] = useState({
    password: null,
    check_password: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChangeText = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value?.trim() ? value : null }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const generatePassword = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = `${lower}${upper}${digits}${special}`;
    const randomChar = (chars) => chars[Math.floor(Math.random() * chars.length)];

    // Backend validation: min 8 chars, at least one lower/upper/digit/special
    const passwordChars = [
      randomChar(lower),
      randomChar(upper),
      randomChar(digits),
      randomChar(special),
    ];

    while (passwordChars.length < 12) {
      passwordChars.push(randomChar(allChars));
    }

    const shuffled = passwordChars.sort(() => Math.random() - 0.5).join('');
    setFormData({
      password: shuffled,
      check_password: shuffled,
    });
    setErrors({});
    toast.success('Новый пароль сгенерирован');
  };

  const handleSubmit = () => {
    setLoading(true);
    setErrors({});
    Rest.put(`/api/v1/users/${userId}/change_password`, { user: formData }).then(() => {
      toast.success('Пароль успешно изменен');
      setFormData({ password: null, check_password: null });
      if (onSuccess) onSuccess();
    }).catch((e) => {
      setErrors(e?.response?.data?.user?.errors || {});
      toast.error('Ошибка смены пароля');
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Form.Item
        label="Новый пароль"
        help={errors?.password && errors?.password.join(', ')}
        validateStatus={errors?.password && 'error'}
      >
        <Input.Password
          name="password"
          value={formData.password}
          onChange={handleChangeText}
        />
      </Form.Item>
      <Form.Item
        label="Повторите пароль"
        help={errors?.check_password && errors?.check_password.join(', ')}
        validateStatus={errors?.check_password && 'error'}
      >
        <Input.Password
          name="check_password"
          value={formData.check_password}
          onChange={handleChangeText}
        />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button onClick={generatePassword}>
            Сгенерировать пароль
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            Сменить пароль
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
