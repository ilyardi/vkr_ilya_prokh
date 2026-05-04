import React, { Component } from "react";
import { Paper } from "@material-ui/core";
import Rest from "tools/rest";
import Preloader from "components/preloader";
import { withStyles } from "@material-ui/core/styles";
import EquipmentForm from "./components/form";

class EquipmentTypeCreate extends Component {
  state = {
    loading: false,
    name: "",
    errors: {},
  };

  handleSubmit = () => {
    const { name } = this.state;

    this.setState({ loading: true });

    Rest.post("/api/v1/equipment_types.json", {
      equipment_type: {
        name: name,
      },
    })
      .then((response) => {
        this.props.history.push("/equipment_types");
      })
      .catch((e) => {
        const { data } = e.response;
        const { errors } = data;
        this.setState({ errors: errors, loading: false });
      });
  };

  handleChangeTextField = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: { ...this.state.errors, [e.target.name]: null },
    });
  };

  render() {
    const { classes } = this.props;
    const { loading, name, errors } = this.state;

    return (
      <Preloader loading={loading}>
        <Paper className={classes.pageContent}>
          <EquipmentForm
            name={name}
            errors={errors}
            handleChangeTextField={this.handleChangeTextField}
            action={"create"}
            handleSubmit={this.handleSubmit}
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

export default withStyles(styles)(EquipmentTypeCreate);
