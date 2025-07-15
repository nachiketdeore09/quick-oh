import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SocketProvider } from "./context/SocketContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <UserProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </UserProvider>
  </SocketProvider>
);
