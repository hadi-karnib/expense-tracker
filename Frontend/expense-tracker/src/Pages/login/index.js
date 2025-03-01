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
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
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
                type="email"
                variant="outlined"
                margin="normal"
                fullWidth
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                fullWidth
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
    </Box>
  );
};

export default Login;
