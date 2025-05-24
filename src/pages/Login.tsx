import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Eye, EyeOff, Github, LogIn, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: `linear-gradient(45deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      <Container maxWidth="sm" sx={{ display: "flex", alignItems: "center" }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box
              sx={{
                p: 0,
                borderRadius: 2, // slight rounding on container for smoothness
                background: "transparent",
                mb: 2,
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="https://i.postimg.cc/FR3xvZ4t/social.png"
                alt="Github"
                width={80}
                height={80}
                style={{
                  display: "block",
                  borderRadius: "16px",
                  boxShadow: "0 0 8px 3px rgba(0, 123, 255, 0.6)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15)";
                  e.currentTarget.style.boxShadow =
                    "0 0 15px 6px rgba(0, 123, 255, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 8px 3px rgba(0, 123, 255, 0.6)";
                }}
              />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
                mb: 1,
              }}
            >
              GitHub Auto-Commit
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 300 }}
            >
              Automate your GitHub contributions with scheduled commits
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  fontSize: "1.5rem",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={{
              mb: 3,
              py: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              borderColor: theme.palette.grey[300],
              color: theme.palette.text.primary,
              "&:hover": {
                borderWidth: 2,
                backgroundColor: theme.palette.grey[50],
              },
            }}
            startIcon={
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: 20, height: 20 }}
              />
            }
          >
            Continue with Google
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography color="text.secondary" variant="body2" sx={{ px: 2 }}>
              OR
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <EyeOff
                          size={20}
                          color={theme.palette.text.secondary}
                        />
                      ) : (
                        <Eye size={20} color={theme.palette.text.secondary} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <EyeOff
                            size={20}
                            color={theme.palette.text.secondary}
                          />
                        ) : (
                          <Eye size={20} color={theme.palette.text.secondary} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                boxShadow: `0 4px 20px ${alpha(
                  theme.palette.primary.main,
                  0.25
                )}`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                },
              }}
              loading={loading}
              startIcon={<LogIn size={20} />}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </LoadingButton>

            <Grid container justifyContent="center">
              <Grid item>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
