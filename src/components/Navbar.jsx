import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import {auth} from '../firebase/config';
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const Logout =async () => {
    const loader = toast.loading("logging out...")
    setIsOpen(false); // Fix: Close menu on logout
    try{
    await signOut(auth);
    toast.success("Logged out!", {id:loader})
    navigate('/login')
    }catch(e){
      toast.error("Network error!")
      console.log(e)
    }
    
  };

 

  return (
    <div
    className="w-full sticky top-0 relative z-100 flex justify-between items-center h-16 p-2 bg-gradient-to-r from-indigo-700 via-blue-500 to-violet-600  backdrop-blur-lg shadow-md shadow-gray-800 "

    >
      
      <h1 className="lg:ml-20 text-2xl text-white font-extrabold text-">WhisperNote</h1>
      <div className="hidden lg:block lg:mr-20 space-x-5 text-white font-bold lg:space-x-7">

        <Link className='hover:border-b-cyan-500 border-b-3 border-b-transparent transition-all duration-300 hover:text-fuchsia-400 active:border-b-cyan-500 active:text-fuchsia-900' to="/">Home</Link>
        <Link className='hover:border-b-cyan-500 border-b-3 border-b-transparent transition-all duration-300 hover:text-fuchsia-400 active:border-b-cyan-500 active:text-fuchsia-900' to="/about">About</Link>
        <Link className='hover:border-b-cyan-500 border-b-3 border-b-transparent transition-all duration-300 hover:text-fuchsia-500 active:border-b-cyan-500 active:text-fuchsia-900' to="/contact">Contact</Link>
        <Link onClick={Logout} className=' transition-all duration-300 bg-black/50 px-4 py-2 rounded-full hover:text-fuchsia-500 active:border-b-cyan-500 hover:bg-black/60 active:bg-black/70' to="/contact">Logout</Link>
      </div>


      {/* Mobile Menu */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } flex flex-col w-80 md:w-90 items-center  z-30 absolute top-5 right-5 text-white font-semibold pt-4 bg-black/65 backdrop-blur-3xl p-2 rounded-2xl shadow-lg shadow-gray-700`}
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
