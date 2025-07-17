import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Welcome from "../pages/Welcome";
import Home from "../pages/Home";
import StartDebate from "../pages/StartDebate";
import DebateRoom from "../pages/DebateRoom";
import Feedback from "../pages/Feedback";
import NotFound from "../pages/NotFound";
const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />}/>
      <Route path="/home" element={<Home />} />
      <Route path="/debate" element={<StartDebate />} />
      <Route path="/debate-room" element={<DebateRoom />}  />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/logout" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AllRoutes;
