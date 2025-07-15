import React, { useState } from "react";
import styles from "./Register.module.css";
import axios from "axios";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    profilePicture: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("address", formData.address);
    data.append("profilePicture", formData.profilePicture);
    // console.log([...data.entries]);
    // Here you'd send formData to your backend using fetch/axios

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Registration successful!");
      console.log(response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.heading}>Register</h2>

        <label>Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <label>Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          required
          value={formData.phoneNumber}
          onChange={handleChange}
        />

        <label>Address</label>
        <textarea
          name="address"
          rows="3"
          required
          value={formData.address}
          onChange={handleChange}
        />

        <label>Profile Picture</label>
        <input
          type="file"
          name="profilePicture"
          accept="image/*"
          onChange={handleChange}
          className="bg-[rgb(79, 79, 79)] text-white p-2 rounded"
        />

        <button type="submit" className={styles.submitBtn}>
          Register
        </button>
        <p className="mt-4 text-sm text-white text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
