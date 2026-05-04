import React, { Component } from 'react';
import Rest from 'tools/rest';
import { Modal, Input, Row, Col, Table, Select, Form } from 'antd';
import {
    debounce,
    find as _find,
    last as _last,
    includes as _includes,
    isEqual as _isEqual,
    map as _map,
} from 'lodash';
import Preloader from 'components/preloader';

class ProjectSearchModal extends Component {
    state = {
        search: {
            number: null,
            name: null,
            project_type_id: null,
        },
        projects: [],
        loading: false,
        useDebounce: false,
    };

    project_types = []

    componentDidMount() {
        this.loadProjectTypes()
        this.loadProjects();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (
            !_isEqual(prevState.search, this.state.search)
        ) {
            if (this.debounceLoad) {
                this.debounceLoad.cancel();
            }
            this.debounceLoad = debounce(() => {
                this.loadProjects();
            }, 500);

            this.debounceLoad();

            if (!this.state.useDebounce) {
                this.debounceLoad.flush();
            }
        }
    };

    loadProjectTypes() {
        this.setState({ loading: true });
        Rest.get(`/api/v1/project_types.json`).then(
            (response) => {
                const { project_types } = response.data
                this.project_types = _map(project_types, (type) => {
                    return { label: type.name, value: type.id }
                })
            }).catch((e) => {
                console.error('error', e);
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    };

    loadProjects = () => {
        const { search } = this.state;

        Rest.get('/api/v1/projects.json', {
            params: { filter: search },
        }).then((response) => {
            const { projects } = response.data;
            this.setState({ projects });
        });
    };

    handleChangeText = (e) => {
        this.setState({
            useDebounce: true,
            search: {
                ...this.state.search,
                [e.target.name]: e.target.value
            },
        });
    };

    handleChangeType = (value, option) => {
        this.setState({
            search: {
                ...this.state.search,
                project_type_id: value,
            },
        });
    }

    handleChooseRow = (v) => {
        const { handleLocationProject, handleCloseModal } = this.props;
        handleLocationProject(v);
        handleCloseModal();
    };

    render() {
        const {
            isSearchModalVisible,
            handleOkShowSearchModal,
            handleCancelShowSearchModal,
        } = this.props;

        const columns = [
            {
                title: 'Номер',
                dataIndex: 'number',
                key: 'number',
            },
            {
                title: 'Название',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Тип',
                dataIndex: 'project_type',
                key: 'project_type',
            },
        ]

        const {
            projects,
            loading,
            search
        } = this.state;

        return (
            <Modal
                title="Поиск проекта"
                visible={isSearchModalVisible}
                onOk={handleOkShowSearchModal}
                onCancel={handleCancelShowSearchModal}
                width={'70%'}
                footer={null}
                centered
            >
                <Preloader loading={loading}>
                    <Form
                        layout='inline'
                    >
                        <Form.Item
                            label={'Номер:'}
                        >
                            <Input
                                size="small"
                                placeholder="Номер"
                                name="number"
                                onChange={this.handleChangeText}
                            />
                        </Form.Item>
                        <Form.Item
                            label={'Название:'}
                        >
                            <Input
                                size="small"
                                placeholder="Название"
                                name="name"
                                onChange={this.handleChangeText}
                            />
                        </Form.Item>
                        <Form.Item
                            label={'Тип:'}
                        >
                            <Select
                                allowClear
                                showSearch
                                value={search.project_type_id == '' ? undefined : search.project_type_id}
                                placeholder='Тип'
                                optionFilterProp="children"
                                filterOption={(input, option) => _includes(option.label, input)}
                                options={this.project_types}
                                onChange={this.handleChangeType}
                                style={{ width: "200px" }}
                            />
                        </Form.Item>
                    </Form>
                    <Table
                        rowKey={(record) => record.id}
                        scroll={{ y: 240 }}
                        pagination={false}
                        columns={columns}
                        size="small"
                        dataSource={projects}
                        onRow={(r) => ({
                            onClick: () => this.handleChooseRow(r),
                        })}
                    />
                </Preloader>
            </Modal>
        );
    }
}

export default ProjectSearchModal;
