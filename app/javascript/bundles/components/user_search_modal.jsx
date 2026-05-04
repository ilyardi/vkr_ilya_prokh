import React, { Component } from 'react';
import Rest from 'tools/rest';
import { Modal, Input, Row, Col, Table, Select } from 'antd';
import { debounce } from 'lodash';
import Preloader from 'components/preloader';

class UserSearchModal extends Component {
  state = {
    search: {
      fio: '',
      agreement_number: '',
      street: '',
      building: '',
      flat: '',
    },
    lb_agreements: [],
    columns: [
      {
        title: 'Номер договора',
        dataIndex: 'agreement_number',
        key: 'agreement_number',
      },
      {
        title: 'Адрес',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: 'Имя',
        dataIndex: 'name',
        key: 'name',
      },
    ],
    streetOptions: [],
    buildingOptions: [],
    flatOptions: [],
    loading: false,
    useDebounce: false,
  };

  componentDidMount() {
    this.loadLbAgreements();
    this.loadStreetOptions();
  }

  componentDidUpdate = (prevProps, prevState) => {
    const { street, building } = this.state.search;

    if (
      prevState.search.flat !== this.state.search.flat ||
      prevState.search.building !== this.state.search.building ||
      prevState.search.street !== this.state.search.street
    ) {
      this.loadLbAgreements();
    }

    if (
      prevState.search.fio !== this.state.search.fio ||
      prevState.search.agreement_number !== this.state.search.agreement_number
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadLbAgreements();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
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
          flat: '',
        },
      });
      this.loadFlatOptions();
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
          flat: '',
        },
      });
    }
  };

  loadFlatOptions = () => {
    this.setState({ loading: true });
    const { building } = this.state.search;

    Rest.get(`/api/v1/addresses/flats.json?building_id=${building}`)
      .then((res) => {
        const { data } = res;
        const options = data.map((f) => {
          return { id: f.flat_id, value: f.name, label: f.name };
        });
        this.setState({
          flatOptions: options,
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

  loadLbAgreements = () => {
    const { search } = this.state;

    Rest.get('/api/v1/lb_agreements/search.json', {
      params: { search },
    }).then((response) => {
      const { lb_agreements } = response.data;
      this.setState({ lb_agreements });
    });
  };

  handleChangeAgreementNumberOrFIO = (e) => {
    this.setState({
      useDebounce: true,
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

  handleChooseSearchFlat = (v) => {
    this.setState({
      search: {
        ...this.state.search,
        flat: v,
      },
    });
  };

  handleChooseLbAgreement = (v) => {
    const { handleLocationAgreements, handleCloseModal } = this.props;
    handleLocationAgreements(v);
    handleCloseModal();
  };

  render() {
    const {
      isSearchUserModalVisible,
      handleOkShowSearchUserModal,
      handleCancelShowSearchUserModal,
    } = this.props;

    const { columns, lb_agreements, loading, streetOptions, buildingOptions, flatOptions, search } =
      this.state;

    return (
      <Modal
        title="Поиск абонента"
        visible={isSearchUserModalVisible}
        onOk={handleOkShowSearchUserModal}
        onCancel={handleCancelShowSearchUserModal}
        width={1000}
        footer={null}
        centered
      >
        <Preloader loading={loading}>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" span={6}>
              <Input
                size="small"
                placeholder="ФИО"
                name="fio"
                onChange={this.handleChangeAgreementNumberOrFIO}
              />
            </Col>
            <Col className="gutter-row" span={6}>
              <Input
                size="small"
                placeholder="Номер договора"
                name="agreement_number"
                onChange={this.handleChangeAgreementNumberOrFIO}
              />
            </Col>
            <Col className="gutter-row" span={4}>
              <Select
                value={search.street == '' ? undefined : search.street}
                allowClear
                size="small"
                showSearch
                style={{ width: 100 }}
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
            </Col>
            <Col className="gutter-row" span={4}>
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
            </Col>
            <Col className="gutter-row" span={4}>
              <Select
                value={search.flat == '' ? undefined : search.flat}
                disabled={!search.building}
                allowClear
                size="small"
                showSearch
                placeholder="Квартира"
                optionFilterProp="children"
                onChange={this.handleChooseSearchFlat}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {flatOptions.map((flat) => {
                  return (
                    <Option key={flat.id} value={flat.value}>
                      {flat.value}
                    </Option>
                  );
                })}
              </Select>
            </Col>
          </Row>
          <Table
            rowKey={(record) => record.id}
            scroll={{ y: 240 }}
            pagination={false}
            columns={columns}
            size="small"
            dataSource={lb_agreements}
            onRow={(r) => ({
              onClick: () => this.handleChooseLbAgreement(r),
            })}
          />
        </Preloader>
      </Modal>
    );
  }
}

export default UserSearchModal;
