import React from "react";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/debate");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight mb-4">
          Welcome to <span className="text-blue-600">DebateSphere</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">
          Step into a world of intellectual battles and persuasive reasoning. Practice with AI debaters, improve your skills, and become a master of arguments.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition-transform transform hover:scale-105 shadow-md"
        >
          Get Started
        </button>

        <div className="mt-10 text-sm text-gray-500">
          Built for Asian & British Parliamentary formats | AI vs Human | Beginner to Advanced
        </div>

        <div className="mt-12 max-w-4xl">
          
        </div>
      </div>
    </>
  );
};

export default Home;
