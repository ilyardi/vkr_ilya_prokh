import React from 'react';
import { Tabs, Empty } from 'antd';
import NotificationRules from 'components/notification_rules';
import ProfileForm from './components/profile_form';

const UserCard = (props) => {
  const { user_id } = props

  const tabs = [
    {
      key: 'profile',
      label: 'Профиль',
      children: <ProfileForm user_id={user_id} />
    }
  ];

  return (
    <Tabs defaultActiveKey='profile' items={tabs}/>
  );
};

export default UserCard;
