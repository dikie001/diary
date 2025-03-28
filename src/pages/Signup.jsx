import { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { FaFacebookF, FaGoogle } from "react-icons/fa6";
import { provider } from "../firebase/config";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [signingUp, setSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const signupLoader = toast.loading("Creating account...");
    setSigningUp(true);

    try {
      // 🔥 Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 📌 Store additional user info in Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email,
        username,
        createdAt: new Date(),
      });

      toast.success("Account created successfully!", { id: signupLoader });
      navigate("/");

      // Clear input fields
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error(error);
      toast.error(error.message, { id: signupLoader });
    } finally {
      setSigningUp(false);
    }
  };
  const FacebookSignIn = async () => {
    toast.error("Facebook Login not implemented.");
  };

  const GoogleSignIn = async (e) => {
    e.preventDefault(e);
    setIsLoading(true);
    const loadToast = toast.loading("Loading...");
    try {
      await signInWithPopup(provider, auth);
      toast.success("Signed in Successfully!", { id: loadToast });
    } catch (e) {
      toast.error("Error signing in",{id:loadToast});
      
    } finally {
      setIsLoading(false);
    }
    navigate("/");
  };

  const ForgotPassword = () => {
    setIsClick(true);
    
    toast.error("Sorry, this feature is not implemented.");
    setTimeout(() => {
      setIsClick(false);
    }, 2000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-800 via-blue-600 to-violet-700">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md sm:max-w-lg text-white">
        <img
          src="logo.ico"
          width={80}
          className="rounded-full m-auto shadow-lg shadow-gray-700"
          alt=""
        />
        <h2 className="text-2xl font-bold text-center mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Choose a username"
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
              placeholder="Create a password"
              required
            />

            <div className="gap-2 relative mt-2 flex">
              <input
                type="checkbox"
                id="rem"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />

              <label htmlFor="rem" className="text-gray-300">
                Remember me
              </label>
            
             
            </div>
          </div>

          <button
            type="submit"
            disabled={signingUp}
            className="w-full flex items-center justify-center gap-2  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-md"
          >
            {signingUp ? (
              <>
                <FaSpinner className="animate-spin" /> Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>
        <h1 className="text-gray-300 text-center mt-5">Or sign in using:</h1>
        <div className="flex items-center justify-center mt-2 gap-5">
          <button
            disabled={isLoading}
            onClick={GoogleSignIn}
            className="flex items-center  gap-4 bg-white/10 hover:bg-black/5 rounded-md font-bold active:bg-black/10 py-2 px-5"
          >
            <FaGoogle className="text-lg text-cyan-300" /> {isLoading? <FaSpinner/> : "Google"}
          </button>
          <button
            disabled={isLoading}
            onClick={FacebookSignIn}
            className="bg-white/10 flex items-center gap-4 hover:bg-black/5 rounded-md font-bold active:bg-black/10 py-2 px-5"
          >
            <FaFacebookF className="text-lg text-cyan-300" /> {isLoading? <FaSpinner/> : "Facebook"}
          </button>
        </div>

        <p className="text-sm text-start mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 font-bold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
