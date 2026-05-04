import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { createFilter } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, IconButton, List, ListSubheader, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { withSnackbar } from 'notistack';

import { withStyles } from '@material-ui/core/styles';
import styles from './search_form_styles';

import Rest from 'tools/rest';
import { historyAdd } from 'redux/actions/widget';
import CallReasonDialog from 'components/widget/call_reason_dialog';
import GotoAccountButton from './goto_account_button';

class SearchForm extends Component {
  state = {
    buildingDisabled: true,
    flatDisabled: true,

    selectedStreet: null,
    selectedBuilding: null,
    selectedFlat: null,

    streets: [],
    buildings: [],
    flats: [],
    accounts: [],

    open: false,
  }

  componentDidMount() {
    this.loadStreets();
    setTimeout(() => { this.streetRef.focus() }, 100);
  }

  loadStreets = () => {
    Rest.get('/lbwidget/addresses/streets')
      .then(json => {
        const data = json.data;
        this.setState({ streets: data });
      })
      .catch(e => {
        console.error(e);
        this.props.enqueueSnackbar(e, { variant: 'error' });
      });
  }

  loadBuildings = (street) => {
    const sid = street.street_id;

    Rest.get(`/lbwidget/addresses/buildings?street_id=${sid}`)
      .then(json => {
        const data = json.data;
        this.setState({ buildingDisabled: false, buildings: data || [] });
        setTimeout(() => { this.buildingRef.focus() }, 100);
      })
      .catch(e => {
        console.error(e);
        this.props.enqueueSnackbar(e, { variant: 'error' });
      });
  }

  loadFlats = (street, building) => {
    const sid = street.street_id;
    const bid = building.building_id;

    Rest.get(`/lbwidget/addresses/flats?street_id=${sid}&building_id=${bid}`)
      .then(json => {
        const data = json.data;
        this.setState({ flatDisabled: false, flats: data || [] });
        setTimeout(() => { this.flatRef.focus() }, 100);
      })
      .catch(e => {
        console.error(e);
        this.props.enqueueSnackbar(e, { variant: 'error' });
      });
  }

  loadAccounts = (street, building, flat) => {
    const sid = street.street_id;
    const bid = building.building_id;
    const fid = flat.flat_id;

    Rest.get(`/lbwidget/addresses/accounts?street_id=${sid}&building_id=${bid}&flat_id=${fid}`)
      .then(json => {
        const data = json.data;
        this.setState({ accounts: data || [] });
        data.map((a) => {
          this.props.historyAdd(a);
        })
      })
      .catch(e => {
        console.error(e);
        this.props.enqueueSnackbar(e, { variant: 'error' });
      });
  }

  selectStreet = (selected) => {
    this.setState({
      selectedStreet: selected,
      buildings: [], buildingDisabled: true, selectBuilding: null,
      flats: [], flatDisabled: true, selectedFlat: null,
    });
    if (selected) {
      this.loadBuildings(selected);
    }
  }

  selectBuilding = (selected) => {
    this.setState({
      selectedBuilding: selected,
      flats: [], flatDisabled: true, selectedFlat: null,
    });
    if (selected) {
      this.loadFlats(this.state.selectedStreet, selected);
    }
  }

  selectFlat = (selected) => {
    this.setState({ selectedFlat: selected });
    if (selected) {
      this.loadAccounts(this.state.selectedStreet, this.state.selectedBuilding, selected);
    }
  }

  handleOpenDialog = account => () => {
    this.setState({ open: true, selectedAccount: account });
  }

  handleCloseDialog = () => {
    this.setState({ open: false });
  }

  render() {
    const filterStreetConfig = {
      ignoreCase: true,
      ignoreAccents: true,
      trim: true,
      matchFrom: 'any',
    };
    const filterConfig = {
      ignoreCase: true,
      ignoreAccents: true,
      trim: true,
      matchFrom: 'start',
    };

    const { classes, history } = this.props;
    const { accounts } = this.state;

    return (
      <div className="b-search-form">
        <Select
          searchPromptText="Выберите улицу"
          placeholder="Выберите улицу"
          isClearable={true}
          isSearchable={true}
          options={this.state.streets}
          onChange={this.selectStreet}
          getOptionLabel={(s) => s.name}
          getOptionValue={(s) => s.street_id}
          filterOption={createFilter(filterStreetConfig)}
          ref={ref => { this.streetRef = ref; }}
          styles={{ menu: provided => ({ ...provided, zIndex: 9999 }) }}
        />
        <Select
          searchPromptText="Выберите номер дома"
          placeholder="Выберите номер дома"
          isClearable={true}
          isSearchable={true}
          options={this.state.buildings}
          onChange={this.selectBuilding}
          getOptionLabel={(s) => `${s.name}, ${s.short}`}
          getOptionValue={(s) => s.building_id}
          isDisabled={this.state.buildingDisabled}
          filterOption={createFilter(filterConfig)}
          ref={ref => { this.buildingRef = ref; }}
          styles={{ menu: provided => ({ ...provided, zIndex: 9999 }) }}
        />
        <Select
          searchPromptText="Выберите квартиру"
          placeholder="Выберите квартиру"
          isClearable={true}
          isSearchable={true}
          options={this.state.flats}
          onChange={this.selectFlat}
          getOptionLabel={(s) => `${s.name}, ${s.short}`}
          getOptionValue={(s) => s.flat_id}
          isDisabled={this.state.flatDisabled}
          filterOption={createFilter(filterConfig)}
          ref={ref => { this.flatRef = ref; }}
          styles={{ menu: provided => ({ ...provided, zIndex: 9999 }) }}
        />

        <List className={classes.list} dense={true} subheader={<ListSubheader className={classes.listTitle}>История поиска</ListSubheader>}>
          {(history || []).map((account) => {
            const nameContent = (account.call_number && (
              <React.Fragment>
                <FontAwesomeIcon icon={['fas', 'phone-square']} size="sm" />&nbsp;
                {account.name}
              </React.Fragment>
            ) || account.name);
            return (
              <ListItem key={account.uid} selected={accounts.length > 0 && !!_.find(accounts, { uid: account.uid })}>
                <ListItemText primary={nameContent} secondary={account.address} />
                <ListItemSecondaryAction>
                  {!account.call_reason_id && (
                    <Tooltip title="Фиксировать причину обращения">
                      <IconButton size="small" onClick={this.handleOpenDialog(account)}>
                        <FontAwesomeIcon icon={['far', 'address-card']} size="lg" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Открыть договор в CRM">
                    <IconButton size="small" onClick={(event) => {
                      window.open(`https://crm.teleset.plus/agreements?number=${account.number}&visibleCard=true`, '_blank')
                    }}>
                      <FontAwesomeIcon icon={['fas', 'user']} size="lg" />
                    </IconButton>
                  </Tooltip>
                  <GotoAccountButton account={account} />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>

        {this.state.selectedAccount && this.state.open && (
          <CallReasonDialog open={this.state.open} onClose={this.handleCloseDialog} account={this.state.selectedAccount} />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { history: state.widget.history };
};

const mapDispatchToProps = dispatch =>
({
  historyAdd(payload) {
    dispatch(historyAdd(payload));
  },
});

SearchForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSnackbar(withStyles(styles)(SearchForm)));
