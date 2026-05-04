import React, { useState, useEffect, useReducer } from 'react';
import Rest from 'tools/rest';
import {
  Button,
  Modal,
  Typography,
  List,
  Card,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  findIndex as _findIndex,
  reject as _reject,
} from 'lodash';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import RequestCard from 'components/request_card'

const { Text } = Typography;

const RequestsList = (props) => {
  // const [requests, setRequests] = useState(props.requests);
  const [request, setRequest] = useState(null);
  const [visibleCard, setVisibleCard] = useState(false);

  // useEffect(() => {
  // });

  const closerModalRequest = () => {
    if (props.dataRelevanceChange) { props.dataRelevanceChange() }
    setVisibleCard(false);
  };

  return (
    <React.Fragment>
      {visibleCard &&
        <Modal
          title={`Задача`}
          visible={visibleCard}
          onCancel={closerModalRequest}
          onOk={closerModalRequest}
          footer={false}
          width={'80%'}
        >

          {request ?
            <RequestCard request_id={request.id}/>
            :
            <RequestCard resource={props.resource} teledom_request_id={props.teledom_request_id} />
          }
        </Modal>
      }
      <List
        header={
          <Button
            name='create_request'
            style={{ width: '90%', borderRadius: '15px', margin: '0 auto 0px', display: 'block' }}
            onClick={() => {
              setRequest(null);
              setVisibleCard(true)
            }}
            icon={<PlusOutlined />}
          />
        }
        dataSource={props.requests}
        renderItem={(item)=> (
          <Card
            size="small"
            title={
              <Row style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <Col>
                  <Text>Задача № {item.id}, {item.request_type}</Text>
                </Col>
                <Col>
                  <Text>{item.request_status}</Text>
                </Col>
              </Row>
            }
            style={{ borderRadius: '10px', margin: '10px 5px' }}
            onClick={() => {
              setRequest(item);
              setVisibleCard(true);
            }}
          >
            <p>Описание: {item.description}</p>
          </Card >
        )}
      />
    </React.Fragment>
  );
};

export default RequestsList;
