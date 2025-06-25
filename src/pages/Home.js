import React from "react";
import Navbar from "../Navbar";
const Home = () => {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-3xl font-bold">Welcome to the Debate Platform!</h1>
        <p className="mt-2">Select an option from the navbar to begin.</p>
      </div>
    </>
  );
};

export default Home;
