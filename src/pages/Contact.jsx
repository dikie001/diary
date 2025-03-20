import React from "react";
import Navbar from "../components/Navbar";

const Contact = () => {
  return (
    <>
          <header className="flex sticky z-40 top-0 left-0 right-0 justify-between items-center p-2 bg-gradient-to-r from-indigo-700 via-blue-500 to-violet-600  backdrop-blur-lg shadow-lg shadow-gray-800">
        <h1 className="text-2xl text-white font-bold">WhisperNote</h1>
        <nav>
        <Navbar/>
        </nav>
      </header>
      <div className="h-dvh flex  flex-col items-center bg-gradient-to-r from-indigo-700 via-blue-500 to-violet-600 px-6 pt-1">
     
 
        <div className="bg-black/30 z-20 mt-5 backdrop-blur-lg p-8 rounded-2xl shadow-lg shadow-gray-700 w-full max-w-lg text-white">
          <h2 className="text-3xl font-bold text-center mb-4">Get in Touch</h2>
          <p className="text-center text-white/80 mb-3">
            Have questions? Fill out the form below and we’ll get back to you.
          </p>

          <form className="space-y-4">
            <div>
              <label className="block mb-2">Your Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Your Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Message</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg resize-none bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Write your message..."
                rows="4"
                required
              ></textarea>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
              Send Message
            </button>
          </form>

          <p className="text-center text-white/80 mt-4">
            Or email us directly at{" "}
            <a
              href="mailto:omondidickens255@gmail.com"
              className="text-lime-950 hover:underline"
            >
              omondidickens255@gmail.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Contact;
