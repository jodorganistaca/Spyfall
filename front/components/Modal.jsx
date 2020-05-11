import {
  Box,
  makeStyles,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Modal,
} from "@material-ui/core";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  bar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
}));

function TheModal({ body, openModal, handleCloseModal }) {
  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      {body}
    </Modal>
  );
}
export default TheModal;
