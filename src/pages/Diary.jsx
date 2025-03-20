import React from 'react';
import Navbar from '../components/Navbar';

const Diary = () => {
  return (
    <div className="h-screen flex overflow-y-auto flex-col bg-gradient-to-br from-indigo-900 via-blue-700 to-violet-800 text-white">
    <Navbar/>
      {/* Main Content */}
      <main className="p-4 w-full md:w-[80%] h-dvh lg:w-[60%] m-auto ">
        {/* Diary Entry Form */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">New Entry</h2>
          <div className="bg-white/10 p-4 rounded-lg shadow-md">
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 mb-4 bg-transparent border-b border-gray-400 focus:outline-none"
              required
            />
            <textarea
              placeholder="Write your thoughts..."
              className="w-full p-2 h-40 bg-transparent border-b border-gray-400 focus:outline-none"
              required
            ></textarea>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-violet-800 rounded font-bold active:bg-violet-600 hover:bg-violet-700 transition"
            >
              Save Entry
            </button>
          </div>
        </section>

        {/* Diary Entries List */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Entries</h2>
          <div className="space-y-4">
            {/* Example Entry */}
            <article className="bg-white/10 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">Entry Title</h3>
              <p className="text-sm text-gray-300">March 19, 2025</p>
              <p className="mt-2 text-white/80">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                nisl eros, pulvinar facilisis justo mollis, auctor consequat
                urna.
              </p>
            </article>
            {/* Additional entries would be mapped here */}
          </div>
        </section>
      </main>

      
    </div>
  );
};

export default Diary;
