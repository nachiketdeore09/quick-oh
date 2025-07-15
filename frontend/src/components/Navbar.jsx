import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import LogoutModal from "./Logout-Popup.jsx";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { useUser } from "../context/UserContext";

function Navbar() {
  // adding the states
  const [isActive, setIsActive] = useState(false);
  // for logout popup function
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  //get isAuth
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // import the profile image
  const { profileImage, updateProfileImage, role, updateRole } = useUser();

  //add the active class
  const toggleActiveClass = () => {
    setIsActive(!isActive);
  };

  //clean up function to remove the active class
  const removeActive = () => {
    setIsActive(false);
  };

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const confirmLogout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        {
          withCredentials: true,
        }
      );
      console.log(res);
      localStorage.removeItem("isAuthenticated");
      updateProfileImage("");
      updateRole("");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowModal(false);
    }
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav
          className={`flex justify-between items-center px-6 py-4 bg-cyan-400 ${styles.navbar}`}
        >
          {/* logo */}
          <Link to="/" className={`${styles.logo}`}>
            Quick-oh.{" "}
          </Link>
          <ul
            className={`flex gap-6 ${styles.navMenu} ${
              isActive ? styles.active : ""
            }`}
          >
            <li onClick={removeActive}>
              <Link
                to="/"
                className={`text-lg font-medium hover:text-white ${styles.navLink}`}
              >
                Home
              </Link>
            </li>
            <li onClick={removeActive}>
              {role === "deliveryPartner" ? (
                <Link to="/active-orders" className={`${styles.navLink}`}>
                  Active Orders
                </Link>
              ) : (
                <Link to="/Shop" className={`${styles.navLink}`}>
                  Shop
                </Link>
              )}
            </li>
            {/* <li onClick={removeActive}>
              <Link to="/register" className={`${styles.navLink}`}>
                Register
              </Link>
            </li>  */}

            {/* <li onClick={removeActive}>
              <Link to="/login" className={`${styles.navLink}`}>
                Login
              </Link>
            </li> */}

            <li className={styles.dropdown}>
              <button className={styles.dropbtn}>More</button>
              <div className={styles.dropdownContent}>
                <Link to="/vendor/login">Vendor Login</Link>
                <Link to="/delivery-login">Delivery Partner Login</Link>
              </div>
            </li>

            <button className={styles.logoutBtn} onClick={handleLogoutClick}>
              Logout
            </button>

            {showModal && (
              <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />
            )}

            <li className={styles.profileDropdown}>
              {isAuthenticated && profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className={styles.profileImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
                />
              ) : (
                <FaUserCircle className={styles.profileIcon} />
              )}
              <div className={styles.profileDropdownContent}>
                {!isAuthenticated ? (
                  <Link to="/login">Login</Link>
                ) : role === "vendor" ? (
                  <Link to="/vendor/dashboard">Dashboard</Link>
                ) : role === "deliveryPartner" ? (
                  <Link to="/delivery-dashboard">Delivery Dashboard</Link>
                ) : (
                  <Link to="/profile">Profile</Link>
                )}
              </div>
            </li>
          </ul>
          <div
            className={`${styles.hamburger} ${isActive ? styles.active : ""}`}
            onClick={toggleActiveClass}
          >
            <span className={`${styles.bar}`}></span>
            <span className={`${styles.bar}`}></span>
            <span className={`${styles.bar}`}></span>
          </div>
        </nav>
      </header>
    </div>
  );
}
export default Navbar;
