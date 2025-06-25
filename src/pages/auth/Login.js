import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Add Link
import { loginUser } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(form);
      login(data.user);
      navigate("/home");
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10 shadow-lg border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>

      {/* ✅ Register Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
