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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your credentials.";
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
            "radial-gradient(1000px 600px at 10% 10%, rgba(99,102,241,0.30), transparent 60%), radial-gradient(900px 700px at 90% 20%, rgba(34,197,94,0.18), transparent 55%), radial-gradient(800px 500px at 50% 90%, rgba(244,63,94,0.12), transparent 60%)",
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
                <Typography variant="h4">Welcome back</Typography>
                <Typography color="text.secondary">
                  Track spending, plan budgets, and export reports.
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
                <Typography variant="h4">Sign in</Typography>
                <Typography color="text.secondary">
                  Use your account to continue.
                </Typography>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
                <Stack spacing={2}>
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
                    autoComplete="current-password"
                    required
                    fullWidth
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
                        <span>Signing in…</span>
                      </Stack>
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  <Typography variant="body2" color="text.secondary">
                    New here?{" "}
                    <Link to="/register" style={{ fontWeight: 700 }}>
                      Create an account
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
