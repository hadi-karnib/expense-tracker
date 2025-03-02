import React, { useState } from "react";
import { Link } from "react-router-dom"; // Make sure you have react-router-dom installed
import { Box, Container, TextField, Typography, Paper } from "@mui/material";
import Lottie from "lottie-react";
import CustomButton from "../../components/CustomButton.js";
import authAnimation from "../../animations/auth_animation.json";

import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });
  };

  // Common styles for the TextFields
  const textFieldStyles = {
    InputLabelProps: {
      sx: { color: "#388E3C" }, // Label text color
    },
    InputProps: {
      sx: {
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#388E3C" }, // Default border color
          "&:hover fieldset": { borderColor: "#388E3C" }, // Hover state
          "&.Mui-focused fieldset": { borderColor: "#388E3C" }, // Focus state
        },
        "& input::placeholder": { color: "#388E3C" }, // Placeholder color
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        flexWrap: "wrap", // Allows wrapping on small screens
        background: "linear-gradient(45deg, #A8FF78, #78FFD6)", // Fancy background
      }}
    >
      <div className="wrapping-container">
        {/* Left Side: Animation */}
        <Box
          sx={{
            flex: "1 1 400px", // Grows/Shrinks with a min size of ~400px
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: 600,
            mb: { xs: 4, md: 0 }, // Margin bottom on small screens
          }}
        >
          <Lottie
            animationData={authAnimation}
            style={{
              width: "100%",
              maxWidth: 500,
              height: "auto",
            }}
          />
        </Box>

        {/* Right Side: Login Form */}
        <Box
          sx={{
            flex: "1 1 300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Paper
              elevation={6}
              sx={{
                borderRadius: "16px",
                p: { xs: 3, md: 5 },
                maxWidth: 400,
                width: "100%",
                textAlign: "center",
                boxShadow: "0px 0px 20px 0px rgba(0,0,0,0)",
              }}
            >
              {/* Set Login text to green */}
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ color: "#388E3C" }}
              >
                Login
              </Typography>

              <Box
                component="form"
                onSubmit={handleLogin}
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  required
                  sx={{
                    // Make label text green (default and focused)
                    "& label": {
                      color: "#388E3C",
                    },
                    "& label.Mui-focused": {
                      color: "#388E3C",
                    },

                    // Make outlined border green (default, hover, and focused)
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#388E3C",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#388E3C",
                      },
                    },

                    // Make placeholder text green
                    "& .MuiOutlinedInput-input::placeholder": {
                      color: "#388E3C",
                    },

                    // Optionally remove the blue focus ring (browser default):
                    "& .MuiOutlinedInput-root.Mui-focused": {
                      boxShadow: "none",
                      outline: "none",
                    },

                    // If Chrome autofills the field with a blue background or text:
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 100px #fff inset",
                      WebkitTextFillColor: "#388E3C",
                    },
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  autoComplete="current-password"
                  sx={{
                    // Make label text green (default and focused)
                    "& label": {
                      color: "#388E3C",
                    },
                    "& label.Mui-focused": {
                      color: "#388E3C",
                    },

                    // Make outlined border green (default, hover, and focused)
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#388E3C",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#388E3C",
                      },
                    },

                    // Make placeholder text green
                    "& .MuiOutlinedInput-input::placeholder": {
                      color: "#388E3C",
                    },

                    // Optionally remove the blue focus ring (browser default):
                    "& .MuiOutlinedInput-root.Mui-focused": {
                      boxShadow: "none",
                      outline: "none",
                    },

                    // If Chrome autofills the field with a blue background or text:
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 100px #fff inset",
                      WebkitTextFillColor: "#388E3C",
                    },
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  {...textFieldStyles}
                />

                <CustomButton
                  text="Login"
                  fullWidth
                  type="submit"
                  sx={{
                    backgroundColor: "#388E3C",
                    color: "white",
                    mt: 3,
                    fontWeight: "bold",
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "#2E7D32",
                    },
                  }}
                />

                {/* Don't Have an Account? */}
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Don’t have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#388E3C",
                      textDecoration: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Register
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>
      </div>
    </Box>
  );
};

export default Login;
