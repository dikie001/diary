import { useState } from "react";
import { auth, provider, db } from "../firebase/config";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { FaFacebookF, FaSpinner } from "react-icons/fa6";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const loginLoader = toast.loading("Logging in...");

    try {
      let userEmail = username;

      // 🔍 Fetch email if username is used
      if (!username.includes("@")) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          userEmail = querySnapshot.docs[0].data().email;
        } else {
          toast.error("Username not found!", { id: loginLoader });
          return;
        }
      }
      await signInWithEmailAndPassword(auth, userEmail, password);
      toast.success("Logged in Successfully!", { id: loginLoader });
      navigate("/");

      // Clear fields
      setUsername("");
      setPassword("");
    } catch (e) {
      console.log(e);
      toast.error("Invalid login credentials", { id: loginLoader });
    } finally {
      setLoggingIn(false);
    }
  };

  const GoogleSignIn = async (e) => {
    const loadingToast = toast.loading("Signing in...");

    e.preventDefault();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in Successfully...", { id: loadingToast });
    } catch (e) {
      console.log(e);
      toast.error("Error logging in", { id: loadingToast });
    }
    navigate("/");
  };

  const FacebookSignIn = async (e) => {
    e.preventDefault();
    toast.error("Facebook login not impemented.", { id: "notImplemented" });
  };
  const [isClick, setIsClick] = useState(false);
  const ForgotPassword = () => {
    setIsClick(true);
    
    setTimeout(() => {
      setIsClick(false);
      toast.error("Feature not implemented.");
    }, 2000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-800 via-blue-600 to-violet-700">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl text-white">
        <img
          src="logo.ico"
          alt="logo"
          className="mx-auto rounded-full"
          width={90}
        />
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username or email"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-md"
          >
            {loggingIn ? (
              <>
                <FaSpinner className="animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <h1 className="text-gray-300 text-center mt-5">Or sign in using:</h1>
        <div className="flex items-center justify-center mt-2 gap-5">
          <button
            onClick={GoogleSignIn}
            className="flex items-center  gap-4 bg-white/10 hover:bg-black/5 rounded-md font-bold active:bg-black/10 py-2 px-5"
          >
            <FaGoogle className="text-lg text-cyan-300" /> Google
          </button>
          <button
            onClick={FacebookSignIn}
            className="bg-white/10 flex items-center gap-4 hover:bg-black/5 rounded-md font-bold active:bg-black/10 py-2 px-5"
          >
            <FaFacebookF className="text-lg text-cyan-300" /> Facebook
          </button>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-start mt-5">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-green-400 font-bold hover:underline"
            >
              Sign up
            </a>
          </p>
          <p
            className=" right-2 text-sm mt-5 text-gray-300 underline cursor-pointer  active:text-cyan-400"
            onClick={ForgotPassword}
            disabled={isClick}
          >
            {isClick ? (
              <FaSpinner className="text-cyan-400 text-2xl absolute right-10 animate-spin" />
            ) : (
              "Forgot password?"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
