import React from "react";
import { Button } from "@mui/material";

const CustomButton = ({ text, color = "primary", onClick, ...rest }) => {
  return (
    <Button
      variant="contained"
      color={color}
      onClick={onClick}
      {...rest} // Pass any additional props
    >
      {text}
    </Button>
  );
};

export default CustomButton;
