import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import AdminDashboard from "./Pages/AdminDashboard";

const BASE_URL =
  "https://ai-summarizer-backend-1bo1.onrender.com";

function MainApp() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [savedEmail] = useState<string | null>(
    localStorage.getItem("email")
  );

  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // LOGIN
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.access_token
      );

      localStorage.setItem(
        "email",
        email
      );

      setToken(res.data.access_token);

      alert("Login successful");

      window.location.reload();
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.detail ||
          "Login failed"
      );
    }
  };

  // SIGNUP
  const handleSignup = async () => {
    try {
      await axios.post(
        `${BASE_URL}/signup`,
        {
          username,
          email,
          password,
        }
      );

      alert("Signup successful");
      setIsSignup(false);
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.detail ||
          "Signup failed"
      );
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    setToken(null);

    window.location.reload();
  };

  // SUMMARIZE
  const handleSummarize = async () => {
    if (!text && !file) {
      alert("Enter text or upload PDF");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (text) {
        formData.append("text", text);
      }

      if (file) {
        formData.append("file", file);
      }

      const response = await axios.post(
        `${BASE_URL}/summarize`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(response.data.summary);
      setKeywords(response.data.keywords);
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.detail ||
          err?.message ||
          "Error while summarizing"
      );
    }

    setLoading(false);
  };

  // DOWNLOAD PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);

    doc.text(
      "AI Text Summarizer Result",
      20,
      20
    );

    doc.setFontSize(12);

    doc.text("Summary:", 20, 40);

    const splitSummary =
      doc.splitTextToSize(
        summary,
        170
      );

    doc.text(
      splitSummary,
      20,
      50
    );

    doc.text(
      "Keywords:",
      20,
      120
    );

    doc.text(
      keywords.join(", "),
      20,
      130
    );

    doc.save("summary.pdf");
  };

  // LOGIN PAGE
  if (!token) {
    return (
      <div className="app auth-page">
        <h1>
          {isSignup
            ? "Create Account"
            : "Welcome Back"}
        </h1>

        <div className="card">
          {isSignup && (
            <input
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
            />
          )}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button
            onClick={
              isSignup
                ? handleSignup
                : handleLogin
            }
          >
            {isSignup
              ? "Signup"
              : "Login"}
          </button>

          <p
            className="toggle-text"
            onClick={() =>
              setIsSignup(
                !isSignup
              )
            }
          >
            {isSignup
              ? "Already have account? Login"
              : "New user? Signup"}
          </p>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="app">
      <h1>
        ✨ AI Text Summarizer
      </h1>

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        {savedEmail ===
          "admin@gmail.com" && (
          <Link to="/admin">
            <button>
              Open Admin Dashboard
            </button>
          </Link>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginLeft: "10px",
          }}
        >
          Logout
        </button>
      </div>

      <div className="card">
        <textarea
          placeholder="Paste text here..."
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
        />

        <input
          type="file"
          accept=".pdf"
          onChange={
            handleFileChange
          }
        />

        {file && (
          <p>
            📄 {file.name}
          </p>
        )}

        <button
          onClick={
            handleSummarize
          }
        >
          {loading
            ? "Generating..."
            : "Generate Summary"}
        </button>

        {summary && (
          <div className="result-box">
            <h3>
              Summary
            </h3>

            <p>
              {summary}
            </p>

            <h3>
              Keywords
            </h3>

            <ul>
              {keywords.map(
                (
                  word,
                  i
                ) => (
                  <li key={i}>
                    {word}
                  </li>
                )
              )}
            </ul>

            <button
              onClick={
                downloadPDF
              }
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainApp />}
        />

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
