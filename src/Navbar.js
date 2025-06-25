// src/components/Navbar.js
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/debate">Start Debate</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
