import { useAuth } from "../contexts/AuthContext";
import React from 'react'

const Dashboard = () => {
  const {user,logout}=useAuth();
  return (
    <div>
      <h1>Welcome, {user?.username || "Guest"}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Dashboard
