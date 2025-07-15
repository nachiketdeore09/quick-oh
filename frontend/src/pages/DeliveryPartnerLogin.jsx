import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./DeliveryPartnerLogin.module.css";
import { useUser } from "../context/UserContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function DeliveryPartnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { updateProfileImage, updateRole } = useUser();
  const socket = useSocket();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        { email, password },
        { withCredentials: true }
      );
      console.log(res.data.data.user);
      if (res.data.data.user.role === "deliveryPartner") {
        alert("Login successful");
        updateRole("deliveryPartner");
        localStorage.setItem("isAuthenticated", "true");
        updateProfileImage(res.data.data.user.profilePicture);

        //join the room
        socket?.emit("joinRoom", `delivery-partner-${res.data.data.user._id}`);
        //redirect to dashboard
        navigate("/delivery-dashboard");
      } else {
        alert("Access denied: Not a delivery partner");
      }
    } catch (error) {
      console.log(error);
      alert("Login failed: " + error?.response?.data?.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Delivery Partner Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleLogin} className={styles.loginBtn}>
        Login
      </button>
    </div>
  );
}

export default DeliveryPartnerLogin;
