import React from "react";
import styles from "./Logout-Popup.module.css";

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to logout?</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.confirm}>
            Yes
          </button>
          <button onClick={onCancel} className={styles.cancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
