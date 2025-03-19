import { useState } from 'react';
import { auth, provider, db } from '../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginLoader = toast.loading('Logging in...');

    try {
      let userEmail = username;

      // 🔍 Fetch email if username is used
      if (!username.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          userEmail = querySnapshot.docs[0].data().email;
        } else {
          toast.error('Username not found!', { id: loginLoader });
          return;
        }
      }
     navigate('/')
      await signInWithEmailAndPassword(auth, userEmail, password);
      toast.success('Logged in Successfully!', { id: loginLoader });

      // Clear fields
      setUsername('');
      setPassword('');
    } catch (e) {
      console.log(e);
      toast.error('Invalid login credentials', { id: loginLoader });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-800 via-blue-600 to-violet-700">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-white">
        <img src="logo.ico" alt="logo" className="mx-auto rounded-full" width={90} />
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
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-md"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-fuchsia-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
