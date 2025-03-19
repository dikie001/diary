import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const Logout = () => {
    setIsOpen(false); // Fix: Close menu on logout
  };

  return (
    <div
    className="w-full relative sticky top-0 left-0 right-0 z-10 drop-shadow-2xl items-center flex justify-center border-b-2 border-b-indigo-600 h-16 bg-gradient-to-r from-indigo-700 to-blue-950"

    >
      <div className="hidden lg:block space-x-5 text-white font-bold lg:space-x-7">
        <Link to="/login">Login</Link>
        <Link to="/signup">SignUp</Link>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } flex flex-col w-60 md:w-80 items-center absolute top-5 right-5 text-white font-semibold pt-4 bg-black/50 backdrop-blur-3xl p-2 rounded-2xl shadow-lg shadow-gray-700`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="text-2xl w-10 h-10 flex items-center justify-center"
        >
          <FiX className="right-5 top-3 text-2xl absolute" />
        </button>

        <p
          onClick={() => {
            setIsOpen(false);
            navigate("/");
          }}
          className="border-b cursor-pointer rounded-md shadow-lg shadow-gray-900 py-2 w-full focus:bg-blue-500 active:bg-blue-500 hover:bg-blue-600 text-center border-b-transparent"
        >
          Home
        </p>
        <p
          onClick={() => {
            setIsOpen(false);
            navigate("/about");
          }}
          className="border-b cursor-pointer rounded-md shadow-lg shadow-gray-900 py-2 w-full focus:bg-blue-500 active:bg-blue-500 hover:bg-blue-600 text-center border-b-transparent"
        >
          About
        </p>
        <p
          onClick={() => {
            setIsOpen(false);
            navigate("/contact");
          }}
          className="cursor-pointer rounded-md shadow-lg shadow-gray-900 py-2 w-full focus:bg-blue-500 active:bg-blue-500 hover:bg-blue-600 text-center border-b-blue-800"
        >
          Contact
        </p>
        <p
          onClick={Logout}
          className="rounded-md cursor-pointer shadow-lg shadow-gray-900 py-2 w-full focus:bg-blue-500 active:bg-blue-500 hover:bg-blue-600 text-center border-b-blue-800"
        >
          Log out
        </p>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden absolute text-white text-3xl font-extrabold py-2 top-3 right-5"
      >
        {!isOpen ? <FiMenu />: null}
      </button>
    </div>
  );
};

export default Navbar;
