// src/pages/Welcome.js
import { Link } from "react-router-dom";


const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to the AI Debate Platform</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded">Login</button>
        </Link>
        <Link to="/register">
          <button className="px-6 py-2 bg-green-600 text-white rounded">Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
