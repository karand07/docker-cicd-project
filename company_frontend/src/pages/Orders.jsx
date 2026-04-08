import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import "bootstrap/dist/css/bootstrap.min.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("CompanyToken");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/company/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        alert("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading)
    return (
      <div className="text-center mt-5 text-success fw-semibold">
        🌿 Loading your orders...
      </div>
    );

  // 🧾 Prepare CSV data
  const csvData = orders.map((order) => ({
    "Order ID": order._id,
    "Waste Type": order.wasteId?.wasteType || "-",
    "Quantity (kg)": order.wasteId?.wasteQuantity || "-",
    "Farmer Name": order.farmerId?.farmerName || "-",
    "Village": order.farmerId?.farmerVillage || "-",
    "Price (₹)": order.price,
    "Status": order.orderStatus,
    "Payment": order.paymentStatus,
    "Date": new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const fileName = `company_orders_${currentDate}.csv`;

  return (
    <div
      className="container mt-5 p-4 shadow-lg"
      style={{
        backgroundColor: "#f4fff4",
        borderRadius: "16px",
        border: "1px solid #cce5cc",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success m-0">🧾 My Orders</h3>

        {orders.length > 0 && (
          <CSVLink
            data={csvData}
            filename={fileName}
            className="btn btn-outline-success btn-sm fw-semibold"
          >
            ⬇️ Export CSV
          </CSVLink>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-light border-success text-center">
          No orders found 🌱
        </div>
      ) : (
        <div className="table-responsive">
          <table
            className="table table-hover align-middle"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <thead style={{ backgroundColor: "#d8f3dc", color: "#1b4332" }}>
              <tr>
                <th>Order ID</th>
                <th>Waste Type</th>
                <th>Quantity (kg)</th>
                <th>Farmer</th>
                <th>Village</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <small className="text-muted">{order._id.slice(-6)}</small>
                  </td>
                  <td>{order.wasteId?.wasteType || "—"}</td>
                  <td>{order.wasteId?.wasteQuantity || "—"}</td>
                  <td>{order.farmerId?.farmerName || "—"}</td>
                  <td>{order.farmerId?.farmerVillage || "—"}</td>
                  <td>
                    <strong>₹{order.price}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        order.orderStatus === "Completed"
                          ? "bg-success"
                          : order.orderStatus === "In Progress"
                          ? "bg-warning text-dark"
                          : order.orderStatus === "Cancelled"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        order.paymentStatus === "Paid"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
