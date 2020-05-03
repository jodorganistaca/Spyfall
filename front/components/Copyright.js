import { Typography, Box } from "@material-ui/core";

export default function Copyright() {
  return (
    <Box textAlign="center">
      <Typography
        align="center"
        variant="caption"
        color="textSecondary"
        style={{ letterSpacing: 1.25, fontSize: "0.65rem" }}
      >
        © Spyfall 2020 - All rigths reserved
      </Typography>
    </Box>
  );
}
