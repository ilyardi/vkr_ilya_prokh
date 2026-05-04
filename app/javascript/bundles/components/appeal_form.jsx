import React from 'react';
import Rest from 'tools/rest';
import {
    Table,
    Radio,
    Tabs,
    Typography,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { debounce, find as _find, forEach as _forEach, map as _map, last as _last, replace as _replace } from 'lodash';
import { toast } from 'react-toastify';
import Preloader from 'components/preloader';

const { Text } = Typography;

class AppealForm extends React.Component {
    state = {
        appeals_reason_handling: [],
        appeals_reason_service: [],
        appeals_reason_corporate: [],
        uid: this.props.uid,
        loading: false,
    };

    componentDidMount() {
        this.loadAppeals()
    };

    loadAppeals() {
        this.setState({ loading: true });
        Rest.get(`/api/v1/call_reasons`).then(
            (response) => {
                const { call_reasons } = response.data
                let appeals_reason_handling = []
                let appeals_reason_service = []
                let appeals_reason_corporate = []
                _forEach(call_reasons, (value) => {
                    if (value.active == true) {
                        switch (value.group) {
                            case "Обслуживание":
                                appeals_reason_handling.push(value)
                                break
                            case "Сервис":
                                appeals_reason_service.push(value)
                                break
                            case "Корпоративный отдел":
                                appeals_reason_corporate.push(value)
                                break
                        }
                    }
                })
                this.setState({
                    appeals_reason_handling: appeals_reason_handling,
                    appeals_reason_service: appeals_reason_service,
                    appeals_reason_corporate: appeals_reason_corporate,
                })
            }).catch((e) => {
                console.error('error', e);
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    };

    handleClickTableAppealReason = (event, appeal_reason_id) => {
        const params = {
            call: {
                lb_account_id: this.state.uid,
                call_reason_id: appeal_reason_id,
            }
        }
        Rest.post(`/api/v1/calls`, params).then(
            (response) => {
                const { call } = response.data
                toast.success('Обращение зафиксировано')
                if (this.props.handleClose) { this.props.handleClose() }
            }).catch((e) => {
                console.error('error', e);
                toast.error('Ошибка фиксации обращения')
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    }

    handleChangeAppeal = (event) => {
        this.setState({ selected_reason: event.target.value })
    }

    render() {

        const {
            loading,
            appeals_reason_handling,
            appeals_reason_service,
            appeals_reason_corporate,
        } = this.state

        const columns = [
            {
                title: 'Наименование',
                dataIndex: 'name',
                key: 'name',
                render: (value) => {
                    return (
                        <Text style={{ fontSize: 'large' }}>
                            {value}
                        </Text>
                    )
                }
            },
        ];
        const scroll_size = 400
        return (
            <Preloader loading={loading}>
                <Tabs
                    defaultActiveKey="1"
                >
                    <Tabs.TabPane tab="Обслуживание" key="1">
                        <Table
                            showHeader={false}
                            dataSource={appeals_reason_handling}
                            columns={columns}
                            rowKey={(record) => record.id}
                            pagination={false}
                            scroll={{
                                y: scroll_size,
                            }}
                            onRow={(record, rowIndex) => {
                                return {
                                    onClick: (event) => { this.handleClickTableAppealReason(event, record.id) },
                                };
                            }}
                            size="large"
                            bordered={false}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Сервис" key="2">
                        <Table
                            showHeader={false}
                            dataSource={appeals_reason_service}
                            columns={columns}
                            rowKey={(record) => record.id}
                            pagination={false}
                            scroll={{
                                y: scroll_size,
                            }}
                            onRow={(record, rowIndex) => {
                                return {
                                    onClick: (event) => { this.handleClickTableAppealReason(event, record.id) },
                                };
                            }}
                            size="large"
                            bordered={false}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Корпоративный отдел" key="3">
                        <Table
                            showHeader={false}
                            dataSource={appeals_reason_corporate}
                            columns={columns}
                            rowKey={(record) => record.id}
                            pagination={false}
                            scroll={{
                                y: scroll_size,
                            }}
                            onRow={(record, rowIndex) => {
                                return {
                                    onClick: (event) => { this.handleClickTableAppealReason(event, record.id) },
                                };
                            }}
                            size="large"
                            bordered={false}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </Preloader >
        );
    }
}

export default AppealForm