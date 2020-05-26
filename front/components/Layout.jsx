import { Container, Paper, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Copyright from "./Copyright";
import AppBar from "./AppBar";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation, Router } from "../plugins/i18n";
import React, { useEffect } from "react";
import { loadUser } from "../store/actions/auth";
import store from "../store";
const reactStyles = makeStyles({
  paper: {
    margin: "10px",
    padding: "20px",
    height: "100%",
    borderRadius: "10px",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  container: {},
});

export function Layout(props) {
  const styles = reactStyles();
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  const { children, auth, secondary = false, info } = props;

  return (
    <Box height="100%">
      <Box
        height="33%"
        width="100%"
        position="absolute"
        bgcolor={secondary ? "secondary.light" : "primary.main"}
      />
      <Box
        position="relative"
        padding="30px 0px 50px 0px"
        display="flex"
        minHeight="100%"
      >
        <Container className={styles.container}>
          <Paper elevation={3} className={styles.paper}>
            <AppBar auth={auth} info={info} />
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              alignSelf="stretch"
              flex={1}
              {...props}
            >
              {children}
            </Box>
            <Copyright styles={{ alignSelf: "flex-end" }} />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
Layout.propTypes = {
  auth: PropTypes.object,
};
const mapStateToProps = (state) => ({ auth: state.auth });

export default withTranslation("layout")(
  connect(mapStateToProps, null)(Layout)
);
