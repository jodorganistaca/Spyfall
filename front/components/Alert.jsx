import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
export const Alert = ({ error, errorSeverity }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };
  useEffect(() => {
    setOpenAlert(true);
  }, [error]);
  return (
    <Snackbar
      open={openAlert}
      autoHideDuration={4000}
      onClose={handleCloseAlert}
    >
      <CustomAlert onClose={handleCloseAlert} severity={errorSeverity}>
        {error}
      </CustomAlert>
    </Snackbar>
  );
};

function CustomAlert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default Alert;
