import React from "react";
import "../styles/AdminDashboard.css";

export const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">

      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div>
            <h3>Total Revenue</h3>
            <p className="kpi-value">$45,231</p>
            <p className="kpi-change positive">+12.5%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📦</div>
          <div>
            <h3>Active Orders</h3>
            <p className="kpi-value">89</p>
            <p className="kpi-change negative">-2.4%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div>
            <h3>Total Clients</h3>
            <p className="kpi-value">1,247</p>
            <p className="kpi-change positive">+8.1%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✔️</div>
          <div>
            <h3>Completion Rate</h3>
            <p className="kpi-value">94%</p>
            <p className="kpi-change positive">+5.3%</p>
          </div>
        </div>
      </div>

    </div>
  );
};
