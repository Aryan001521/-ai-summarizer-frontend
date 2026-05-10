import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

interface LoginHistoryItem {
  username: string;
  email: string;
  login_time: string;
}

interface DashboardData {
  total_users: number;
  total_logins: number;
  login_history: LoginHistoryItem[];
}

function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("TOKEN:", token); // debug

      if (!token) {
        setError("Please login first");
        return;
      }

      const res = await axios.get(
        "http://127.0.0.1:8000/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Not authorized (Admin only)");
      } else if (err.response?.status === 401) {
        setError("Token missing / invalid");
      } else {
        setError("Failed to load dashboard");
      }
    }
  };

  if (error) {
    return <h2 className="error">{error}</h2>;
  }

  if (!data) {
    return <h2 className="loading">Loading Dashboard...</h2>;
  }

  return (
    <div className="dashboard-container">
      <h1>🚀 Admin Analytics Dashboard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Total Users</h2>
          <p>{data.total_users}</p>
        </div>

        <div className="dashboard-card">
          <h2>Total Logins</h2>
          <p>{data.total_logins}</p>
        </div>
      </div>

      <h2 className="section-title">📊 Login History</h2>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Login Time</th>
          </tr>
        </thead>

        <tbody>
          {data.login_history?.map((item, index) => (
            <tr key={index}>
              <td>{item.username}</td>
              <td>{item.email}</td>
              <td>{item.login_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;