import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const { updateProfileImage, updateRole } = useUser();

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
      // Redirect or handle login success
      localStorage.setItem("isAuthenticated", "true");
      console.log(response.data.data.user.address);
      localStorage.setItem(
        "profileImage",
        response.data.data.user.profilePicture
      );

      //for thr user context
      updateProfileImage(response.data.data.user.profilePicture);
      updateRole("customer");
      navigate("/shop");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Login</h2>

        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            name="name"
            className={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            name="email"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            className={styles.input}
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            name="password"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className={styles.button}>
          Login
        </button>

        <p className={styles.linkText}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
