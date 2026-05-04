import React from 'react';
import Rest from 'tools/rest';
import {
    Table,
    Row,
    Col,
    Form,
    Tag,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { debounce, find as _find, forEach as _forEach } from 'lodash';
import Preloader from 'components/preloader';

class Appeals extends React.Component {
    state = {}
    render() {
        const data = this.props.appeals
        const columns = [
            { title: 'Менеджер', dataIndex: 'lb_manager', key: 'lb_manager' },
            { title: 'Причина', dataIndex: 'call_reason', key: 'call_reason' },
            {
                title: 'Дата',
                dataIndex: 'date',
                key: 'date',
                render: (value) => {
                    return value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null;
                },
            },
        ];

        return (
            <React.Fragment>
                <Table
                    dataSource={data}
                    columns={columns}
                    rowKey={(record) => record.id}
                    size="small"
                    bordered={true}
                />
            </React.Fragment>
        )
    }
}

export default Appeals
