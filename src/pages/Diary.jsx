import React from 'react';

const Diary = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-blue-700 to-violet-800 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-md">
        <h1 className="text-2xl font-bold">WhisperNote</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/home" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 overflow-y-auto">
        {/* Diary Entry Form */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">New Entry</h2>
          <form className="bg-white/10 p-4 rounded-lg shadow-md">
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
              className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Save Entry
            </button>
          </form>
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

      {/* Footer */}
      <footer className="p-4 bg-black/30 backdrop-blur-md text-center">
        <p className="text-sm text-white/80">&copy; 2025 WhisperNote. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Diary;
