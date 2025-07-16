import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { updateProfileImage, updateRole } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        formData,
        { withCredentials: true }
      );

      console.log("Login successful:", response.data);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem(
        "profileImage",
        response.data.data.user.profilePicture
      );

      updateProfileImage(response.data.data.user.profilePicture);
      updateRole("customer");
      navigate("/shop");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e0f7fa, #f9fafb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
          >
            Login
          </Button>

          <Typography mt={2} textAlign="center">
            Don't have an account?{" "}
            <MuiLink component={Link} to="/register" underline="hover">
              Register here
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
