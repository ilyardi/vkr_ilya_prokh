import React, { Component } from 'react';
import Rest from 'tools/rest';
import { Modal, Input, Row, Col, Table, Select, Form } from 'antd';
import {
    find as _find,
    last as _last,
    includes as _includes,
    isEqual as _isEqual,
} from 'lodash';
import Preloader from 'components/preloader';

class DeviceSearchModal extends Component {
    state = {
        search: {
            // device_name: '',
            street: '',
            building: '',
            entrance: '',
        },
        devices: [],
        columns: [
            {
                title: 'Идентификатор',
                dataIndex: 'device_id',
                key: 'device_id',
            },
            {
                title: 'Наименование',
                dataIndex: 'device_name',
                key: 'name',
            },
            {
                title: 'Адрес',
                dataIndex: 'address',
                key: 'address',
            },
        ],
        streetOptions: [],
        buildingOptions: [],
        entranceOptions: [],
        loading: false,
    };

    componentDidMount() {
        this.loadLbDevices();
        this.loadStreetOptions();
    }

    componentDidUpdate = (prevProps, prevState) => {
        const { street, building } = this.state.search;
        if (
            !_isEqual(prevState.search, this.state.search)
        ) {
            this.loadLbDevices();
        }
        if (street && street !== prevState.search.street) {
            this.setState({
                search: {
                    ...this.state.search,
                    building: '',
                },
            });
            this.loadBuildingOptions();
        }

        if (building && building !== prevState.search.building) {
            this.setState({
                search: {
                    ...this.state.search,
                    entrance: '',
                },
            });
            this.loadEntranceOptions();
        }

        if (!street && street !== prevState.search.street) {
            this.setState({
                search: {
                    ...this.state.search,
                    building: '',
                },
            });
        }

        if (!building && building !== prevState.search.building) {
            this.setState({
                search: {
                    ...this.state.search,
                    entrance: '',
                },
            });
        }
    };

    loadEntranceOptions = () => {
        this.setState({ loading: true });
        const { building } = this.state.search;

        Rest.get(`/api/v1/addresses/entrances.json?building_id=${building}`)
            .then((res) => {
                const { data } = res;
                const options = data.map((e) => {
                    return { id: e.entrance_id, value: e.name, label: e.name };
                });
                this.setState({
                    entranceOptions: options,
                    loading: false,
                });
            })
            .catch((error) => {
                this.setState({ loading: false });
            });
    };

    loadBuildingOptions = () => {
        this.setState({ loading: true });
        const { street } = this.state.search;

        Rest.get(`/api/v1/addresses/houses.json?street=${street}`)
            .then((res) => {
                const { data } = res;
                const { suggestions } = data;
                const options = suggestions.map((s) => {
                    return { id: s.id, value: s.value, label: s.value };
                });
                this.setState({
                    buildingOptions: options,
                    loading: false,
                });
            })
            .catch((error) => {
                this.setState({ loading: false });
            });
    };

    loadStreetOptions = () => {
        this.setState({ loading: true });
        const { street } = this.state.search;

        Rest.get(`/api/v1/addresses.json?query=${street}`)
            .then((res) => {
                const { data } = res;
                const { suggestions } = data;

                this.setState({
                    streetOptions: suggestions,
                    loading: false,
                });
            })
            .catch((error) => {
                this.setState({ loading: false });
            });
    };

    loadLbDevices = () => {
        const { search } = this.state;

        Rest.get('/api/v1/lb_devices.json', {
            params: { filter: search },
        }).then((response) => {
            const { lb_devices } = response.data;
            this.setState({ lb_devices });
        });
    };

    handleChangeDeviceName = (e) => {
        this.setState({
            search: {
                ...this.state.search,
                [e.target.name]: e.target.value,
            },
        });
    };

    handleChooseSearchStreet = (v) => {
        this.setState({
            search: {
                ...this.state.search,
                street: v,
            },
        });
    };

    handleChooseSearchBuilding = (v) => {
        this.setState({
            search: {
                ...this.state.search,
                building: v,
            },
        });
    };

    handleChooseSearchEntrance = (v) => {
        this.setState({
            search: {
                ...this.state.search,
                entrance: v,
            },
        });
    };

    handleChooseRow = (v) => {
        const { handleLocationDevice, handleCloseModal } = this.props;
        handleLocationDevice(v);
        handleCloseModal();
    };

    render() {
        const {
            isSearchDeviceModalVisible,
            handleOkShowSearchDeviceModal,
            handleCancelShowSearchDeviceModal,
        } = this.props;

        const { columns, lb_devices, loading, streetOptions, buildingOptions, entranceOptions, search } =
            this.state;

        return (
            <Modal
                title="Поиск оборудования"
                visible={isSearchDeviceModalVisible}
                onOk={handleOkShowSearchDeviceModal}
                onCancel={handleCancelShowSearchDeviceModal}
                width={'70%'}
                footer={null}
                centered
            >
                <Preloader loading={loading}>
                    <Form
                        layout='inline'
                    >
                        {/* <Form.Item>
                            <Input
                                size="small"
                                placeholder="Наименование"
                                name="device_name"
                                onChange={this.handleChangeDeviceName}
                            />
                        </Form.Item> */}
                        <Form.Item>
                            <Select
                                value={search.street == '' ? undefined : search.street}
                                allowClear
                                size="small"
                                showSearch
                                style={{ width: '200px' }}
                                placeholder="Улица"
                                optionFilterProp="children"
                                onChange={this.handleChooseSearchStreet}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {streetOptions.map((street) => {
                                    return (
                                        <Option key={street.id} value={street.value}>
                                            {street.value}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Select
                                style={{ width: 100 }}
                                disabled={!search.street}
                                value={search.building == '' ? undefined : search.building}
                                allowClear
                                size="small"
                                showSearch
                                placeholder="Дом"
                                optionFilterProp="children"
                                onChange={this.handleChooseSearchBuilding}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {buildingOptions.map((building) => {
                                    return (
                                        <Option key={building.id} value={building.id}>
                                            {building.value}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Select
                                value={search.entrance == '' ? undefined : search.entrance}
                                disabled={!search.building}
                                allowClear
                                size="small"
                                showSearch
                                placeholder="Подъезд"
                                optionFilterProp="children"
                                onChange={this.handleChooseSearchEntrance}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {entranceOptions.map((entrance) => {
                                    return (
                                        <Option key={entrance.id} value={entrance.value}>
                                            {entrance.value}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                    <Table
                        rowKey={(record) => record.id}
                        scroll={{ y: 240 }}
                        pagination={false}
                        columns={columns}
                        size="small"
                        dataSource={lb_devices}
                        onRow={(r) => ({
                            onClick: () => this.handleChooseRow(r),
                        })}
                    />
                </Preloader>
            </Modal>
        );
    }
}

export default DeviceSearchModal;
