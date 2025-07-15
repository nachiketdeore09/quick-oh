import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./VendorLogin.module.css";
import { useUser } from "../context/UserContext";

function VendorLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { updateProfileImage, updateRole } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        formData,
        { withCredentials: true }
      );

      console.log("Vendor login success:", res.data);

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("profileImage", res.data.data.user.profilePicture);
      localStorage.setItem("role", "vendor");

      //update the user context fields
      updateProfileImage(res.data.data.user.profilePicture);
      updateRole("vendor");
      // You can add role-based redirection here
      navigate("/vendor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2>Vendor Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Vendor Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Vendor Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default VendorLogin;
