import { getCurrentUser, logout } from "../../../utils/auth";
import { Link } from "react-router-dom";

export default function Home() {
  const user = getCurrentUser();

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>
        {user ? `Hi, ${user}!` : "Hello, User!"}
      </h1>

      {!user && (
        <div style={{ marginTop: "20px" }}>
          <Link to="/login">
            <button style={{ marginRight: "10px" }}>Login</button>
          </Link>

          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      )}

      {user && (
        <button
          onClick={logout}
          style={{
            marginTop: "20px",
            backgroundColor: "red",
            color: "white",
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
}
