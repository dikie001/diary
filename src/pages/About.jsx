import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <>
      <Navbar />

      <div className="flex-grow  p-6 overflow-y-auto h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 via-blue-600 to-violet-700 px-6">
        <div className="max-w-lg inset-0   text-center text-white bg-black/20 backdrop-blur-md p-6  rounded-lg shadow-lg">
          <h2 className="text-3xl font-extrabold tracking-wide">
            About WhisperNote
          </h2>
          <p className="mt-6 text-lg  leading-relaxed font-light">
            WhisperNote is a modern, secure, and intuitive digital diary
            designed to help you document your thoughts, ideas, and reflections
            effortlessly. With a sleek interface and seamless experience, it’s
            built for those who value privacy, simplicity, and self-expression.
          </p>
          <p className="mt-4 text-lg leading-relaxed font-light">
            Whether you're journaling your day, capturing creative insights, or
            setting personal goals, WhisperNote keeps your words safe and
            beautifully organized—anytime, anywhere.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
