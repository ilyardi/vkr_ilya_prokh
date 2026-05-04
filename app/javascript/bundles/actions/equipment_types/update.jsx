import React, { Component } from "react";
import { Paper } from "@material-ui/core";
import Rest from "tools/rest";
import Preloader from "components/preloader";
import { withStyles } from "@material-ui/core/styles";
import EquipmentForm from "./components/form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class EquipmentTypeUpdate extends Component {
  state = {
    equipment_type: {
      name: "",
    },
    loading: false,
    errors: {},
  };

  componentDidMount() {
    this.loadEquipmentType();
  }

  handleSubmit = () => {
    const id = this.props.match.params.id;

    const { equipment_type, errors } = this.state;

    this.setState({ loading: true });

    Rest.put(`/api/v1/equipment_types/${id}.json`, {
      equipment_type: equipment_type,
    })
      .then((response) => {
        const { equipment } = response.data;
        this.setState({ equipment_type });
        this.setState({ loading: false });
        this.notify();
      })
      .catch((e) => {
        const { data } = e.response;
        const { errors } = data;
        this.setState({ errors: errors, loading: false });
      });
  };

  loadEquipmentType = () => {
    const id = this.props.match.params.id;
    this.setState({ loading: true });

    Rest.get(`/api/v1/equipment_types/${id}.json`).then((response) => {
      const { equipment_type } = response.data;
      this.setState({ equipment_type, loading: false });
    });
  };

  handleChangePage = (e, page) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: page + 1,
      },
    });
  };

  handleChangeRowsPerPage = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        per: parseInt(e.target.value),
        page: 1,
      },
    });
  };

  handleChangeTextField = (e) => {
    this.setState({
      equipment_type: {
        ...this.state.equipment_type,
        [e.target.name]: e.target.value,
      },
      errors: { ...this.state.errors, [e.target.name]: null },
    });
  };

  handleRequestSort = (event, orderBy) => {
    let order = "desc";

    if (
      this.state.meta.orderBy === orderBy &&
      this.state.meta.order === "desc"
    ) {
      order = "asc";
    }

    this.setState({ meta: { ...this.state.meta, order, orderBy } });
  };

  notify = () => toast.success("Обновлено");

  render() {
    const { classes } = this.props;
    const { loading, errors, equipment_type } = this.state;

    return (
      <Preloader loading={loading}>
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
        />
        <Paper className={classes.pageContent}>
          <EquipmentForm
            name={equipment_type.name}
            errors={errors}
            handleChangeTextField={this.handleChangeTextField}
            action={"update"}
            handleSubmit={this.handleSubmit}
          />
        </Paper>
      </Preloader>
    );
  }
}

const styles = (theme) => ({
  pageContent: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    maxWidth: 500,
  },
});

export default withStyles(styles)(EquipmentTypeUpdate);
