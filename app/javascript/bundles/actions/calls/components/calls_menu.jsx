import React from "react";
import { Link } from "react-router-dom";
import { Button } from 'antd';

const CallsMenu = [
  <Button key="calls/report"><Link to={"/calls/report"}>Отчет</Link></Button>,
  <Button key="calls/request_dynamic"><Link to={"/calls/request_dynamic"}>Динамика запросов</Link></Button>,
];

export default CallsMenu;
