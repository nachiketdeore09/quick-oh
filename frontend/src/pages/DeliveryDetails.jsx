import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./DeliveryDetails.module.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import io from "socket.io-client";
import LiveLocationTracker from "../components/LiveLocationTracker";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DeliveryDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnerPosition, setPartnerPosition] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/order/getSingleOrderById/${orderId}`,
          { withCredentials: true }
        );
        setOrder(res.data.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Setup socket tracking after order is fetched
  useEffect(() => {
    if (!order) return;

    const assignedTo = order.assignedTo;
    socketRef.current = io("http://localhost:8000", {
      withCredentials: true,
    });

    socketRef.current.emit("joinRoom", { userId: assignedTo });

    socketRef.current.on(
      `location-update-${assignedTo}`,
      ({ latitude, longitude }) => {
        setPartnerPosition([latitude, longitude]);
      }
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, [order]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!order) return <div className={styles.error}>Order not found.</div>;

  const { latitude, longitude, address } = order.shippingAddress;
  const customerPosition = [latitude, longitude];

  return (
    <div className={styles.container}>
      {/* Just handles location broadcasting */}
      <LiveLocationTracker userId={order.assignedTo} />

      <h2>Live Delivery Tracking</h2>

      <MapContainer
        center={customerPosition}
        zoom={14}
        style={{ height: "400px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer Marker */}
        <Marker position={customerPosition}>
          <Popup>
            Customer Location
            <br />
            {address}
          </Popup>
        </Marker>

        {/* Delivery Partner Marker */}
        {partnerPosition && (
          <Marker position={partnerPosition}>
            <Popup>Delivery Partner</Popup>
          </Marker>
        )}

        {/* Polyline Route */}
        {partnerPosition && (
          <Polyline
            positions={[partnerPosition, customerPosition]}
            color="blue"
          />
        )}
      </MapContainer>

      <div className={styles.details}>
        <h3>Order #{order._id}</h3>
        <p>
          <strong>Customer:</strong> {order.user?.name} ({order.user?.email})
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment:</strong> {order.paymentStatus}
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </p>
        <p>
          <strong>Shipping Address:</strong> {address}
        </p>

        <h4>Items</h4>
        <ul>
          {order.items.map((item, idx) => (
            <li key={idx}>
              {item.product?.productName} × {item.quantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DeliveryDetails;
