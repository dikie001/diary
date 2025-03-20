import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Diary from "./pages/Diary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const App = () => {

  return (
    <>
      <Router>
        <Toaster position="top-right " />
        <Routes>
         <Route path="/" element={<Diary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />{" "}
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
