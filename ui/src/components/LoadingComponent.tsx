import React from "react";
import { Box, CircularProgress } from "@material-ui/core";

const LoadingComponent: React.FC = () => {
  return (
    <Box
      display="flex"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress variant="indeterminate" disableShrink />
    </Box>
  );
};

export default LoadingComponent;
