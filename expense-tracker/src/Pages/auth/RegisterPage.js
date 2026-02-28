import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Lottie from "lottie-react";
import authAnimation from "../../animations/auth_animation.json";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ username, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1000px 600px at 15% 20%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(900px 700px at 90% 20%, rgba(99,102,241,0.26), transparent 55%), radial-gradient(800px 500px at 50% 90%, rgba(245,158,11,0.12), transparent 60%)",
          filter: "saturate(120%)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="stretch"
        >
          <Card
            sx={{
              flex: 1,
              display: { xs: "none", md: "block" },
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ height: "100%" }}>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="h4">Start tracking</Typography>
                <Typography color="text.secondary">
                  Budgets, analytics, and reports — built in.
                </Typography>
              </Stack>
              <Box sx={{ maxWidth: 520, mx: "auto", mt: 2 }}>
                <Lottie animationData={authAnimation} loop />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={1}>
                <Typography variant="h4">Create account</Typography>
                <Typography color="text.secondary">
                  You’ll be logged in right away.
                </Typography>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                    fullWidth
                    helperText="Minimum 6+ characters recommended."
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={busy}
                    sx={{ borderRadius: 3 }}
                  >
                    {busy ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} />
                        <span>Creating…</span>
                      </Stack>
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link to="/login" style={{ fontWeight: 700 }}>
                      Sign in
                    </Link>
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
