import React, { Component } from 'react';
import { Paper } from '@material-ui/core';
import Rest from 'tools/rest';
import Preloader from 'components/preloader';
import { withStyles } from '@material-ui/core/styles';
import EquipmentForm from './components/form';

class EquipmentCreate extends Component {
  state = {
    loading: false,
    lb_agreements_loading: false,
    lb_agreements_open: false,
    warehouses: [],
    users: [],
    lb_agreements: [],
    equipment_types: [],
    model: '',
    brand: '',
    serial_number: '',
    location_id: '',
    equipment_type_id: '',
    status: '',
    errors: {},
    location_type: 'Warehouse',
    search: '',
    brands: [],
    models: [],
    coords: {
      rack: null,
      shelf: null,
    },
  };

  componentDidMount() {
    this.loadEquipmentBrandsAndModels();
    this.loadWarehouses();
    this.loadUsers();
    this.loadEquipmentTypes();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.search !== this.state.search) {
      this.loadLbAgreementsBySearch();
    }
  };

  handleSubmit = () => {
    const {
      model,
      brand,
      serial_number,
      location_id,
      location_type,
      equipment_type_id,
      status,
      coords,
      errors,
    } = this.state;

    this.setState({ loading: true, errors: {} });

    Rest.post('/api/v1/equipment.json', {
      equipment: {
        model: model,
        brand: brand,
        serial_number: serial_number,
        location_id: location_id,
        location_type: location_type,
        equipment_type_id: equipment_type_id,
        status: status,
        coords: coords,
      },
    })
      .then((response) => {
        this.props.history.push('/equipment');
      })
      .catch((e) => {
        const { data } = e.response;
        const { errors } = data;
        this.setState({ errors: errors, loading: false });
      });
  };

  handleChangeCoords = (e) => {
    this.setState({
      coords: { ...this.state.coords, [e.target.name]: e.target.value }
      // errors: { ...e.state.errors, [e.target.name]: null },
    })
  };

  loadEquipmentBrandsAndModels = () => {
    this.setState({ loading: true });
    Rest.get('/api/v1/equipment/brands.json').then((response) => {
      const { brands, models } = response.data;
      this.setState({ brands, models, loading: false });
    });
  };

  loadWarehouses = () => {
    this.setState({ loading: true });

    Rest.get('/api/v1/warehouses.json').then((response) => {
      const { warehouses } = response.data;
      this.setState({ warehouses, loading: false });
    });
  };

  loadUsers = () => {
    this.setState({ loading: true });

    Rest.get('/api/v1/users/warehouse_users.json').then((response) => {
      const { users } = response.data;
      this.setState({ users, loading: false });
    });
  };

  loadEquipmentTypes = () => {
    this.setState({ loading: true });

    Rest.get('/api/v1/equipment_types.json').then((response) => {
      const { equipment_types } = response.data;
      this.setState({ equipment_types, loading: false });
    });
  };

  handleChangeTextField = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: { ...this.state.errors, [e.target.name]: null },
    });
  };

  handleLocationAgreements = (v) => {
    this.setState({
      location_id: v.id,
      errors: { ...this.state.errors, location: null },
    });
  };

  handleLocation = (e) => {
    this.setState({
      location_id: e.target.value,
      errors: { ...this.state.errors, location_id: null },
    });
  };

  handleType = (e) => {
    this.setState({
      equipment_type_id: e.target.value,
      errors: { ...this.state.errors, equipment_type: null },
    });
  };

  handleStatus = (e) => {
    this.setState({
      status: e.target.value,
      errors: { ...this.state.errors, status: null },
    });
  };

  handleSetLocationType = (e) => {
    this.setState({ location_type: e.target.value });
  };

  loadLbAgreementsBySearch = () => {
    const { search } = this.state;

    if (search.length > 2) {
      Rest.get(`/api/v1/lb_agreements/search.json?q=${search}`).then((response) => {
        const { lb_agreements } = response.data;
        this.setState({ lb_agreements });
      });
    }
  };

  handleLbAgrementsInputChange = (v) => {
    this.setState({
      search: v,
    });
  };

  handleChooseModel = (v) => {
    this.setState({
      model: v,
    });
  };

  handleChooseBrand = (v) => {
    this.setState({
      brand: v,
    });
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      equipment_types,
      warehouses,
      users,
      lb_agreements,
      model,
      brand,
      serial_number,
      equipment_type_id,
      status,
      location_type,
      location_id,
      errors,
      search,
      models,
      brands,
      coords,
    } = this.state;

    return (
      <Preloader loading={loading}>
        <Paper className={classes.pageContent}>
          <EquipmentForm
            equipment_types={equipment_types}
            warehouses={warehouses}
            users={users}
            lb_agreements={lb_agreements}
            model={model}
            brand={brand}
            serial_number={serial_number}
            equipment_type_id={equipment_type_id}
            status={status}
            location_type={location_type}
            location_id={location_id}
            errors={errors}
            handleChangeTextField={this.handleChangeTextField}
            handleSetLocationType={this.handleSetLocationType}
            handleLocationAgreements={this.handleLocationAgreements}
            handleLocation={this.handleLocation}
            handleType={this.handleType}
            handleStatus={this.handleStatus}
            handleSubmit={this.handleSubmit}
            action={'create'}
            search={search}
            handleLbAgrementsInputChange={this.handleLbAgrementsInputChange}
            showAttributes={true}
            models={models}
            brands={brands}
            handleChooseModel={this.handleChooseModel}
            handleChooseBrand={this.handleChooseBrand}
            handleChangeCoords={this.handleChangeCoords}
            coords={coords}
          />
        </Paper>
      </Preloader>
    );
  }
}

const styles = (theme) => ({
  pageContent: {
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    maxWidth: 500,
  },
});

export default withStyles(styles)(EquipmentCreate);
