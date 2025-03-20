import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, Clock, Edit, Save, Trash, Moon, Sun, Search, X, Tag, AlertTriangle, Lock, ChevronDown, Bookmark, Unlock, Image } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MOODS = [
  { name: "neutral", emoji: "😐" },
  { name: "happy", emoji: "😊" },
  { name: "sad", emoji: "😢" },
  { name: "excited", emoji: "🎉" },
  { name: "angry", emoji: "😠" },
  { name: "anxious", emoji: "😰" }
];

const TAG_SUGGESTIONS = ["personal", "work", "health", "travel", "family", "goals", "gratitude", "memories"];

const Diary = () => {
  // User state
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  // Entry form state
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Entries state
  const [entries, setEntries] = useState([]);
  const [bookmarkedEntries, setBookmarkedEntries] = useState([]);
  const [expandedEntry, setExpandedEntry] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const textareaRef = useRef(null);
  const auth = getAuth();
  const navigate = useNavigate();

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(user);
        fetchEntries(user.uid);
      } else {
        setLoggedInUser(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Fetch entries from Firestore
  const fetchEntries = useCallback(async (userId) => {
    try {
      setLoading(true);
      const entriesRef = collection(db, "diaryEntries");
      const q = query(
        entriesRef, 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const entriesList = [];
      const bookmarkedIds = [];
      
      querySnapshot.forEach((doc) => {
        const entryData = { id: doc.id, ...doc.data() };
        entriesList.push(entryData);
        if (entryData.bookmarked) {
          bookmarkedIds.push(doc.id);
        }
      });
      
      setEntries(entriesList);
      setBookmarkedEntries(bookmarkedIds);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Form validation
  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please provide a title for your entry.");
      return false;
    }
    
    if (!text.trim()) {
      toast.error("Please provide content for your entry.");
      return false;
    }
    
    return true;
  };

  // Save entry to Firestore
  const saveEntry = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const entryData = {
        title,
        content: text,
        mood,
        tags,
        isPrivate,
        userId: loggedInUser.uid,
        bookmarked: selectedEntry ? entries.find(e => e.id === selectedEntry)?.bookmarked || false : false,
        updatedAt: serverTimestamp()
      };
      
      if (selectedEntry) {
        // Update existing entry
        const entryRef = doc(db, "diaryEntries", selectedEntry);
        await updateDoc(entryRef, entryData);
        toast.success("Entry updated successfully!");
      } else {
        // Create new entry
        entryData.createdAt = serverTimestamp();
        await addDoc(collection(db, "diaryEntries"), entryData);
        toast.success("New entry saved!");
      }
      
      // Reset form and refresh entries
      resetForm();
      fetchEntries(loggedInUser.uid);
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save your entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete entry
  const deleteEntry = async (entryId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "diaryEntries", entryId));
      
      // Reset selected entry if it was the one deleted
      if (selectedEntry === entryId) {
        resetForm();
      }
      
      setShowDeleteConfirm(null);
      toast.success("Entry deleted successfully!");
      fetchEntries(loggedInUser.uid);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle bookmark status
  const toggleBookmark = async (entryId) => {
    try {
      const isCurrentlyBookmarked = bookmarkedEntries.includes(entryId);
      
      const entryRef = doc(db, "diaryEntries", entryId);
      await updateDoc(entryRef, {
        bookmarked: !isCurrentlyBookmarked
      });
      
      setBookmarkedEntries(prevState => {
        if (isCurrentlyBookmarked) {
          return prevState.filter(id => id !== entryId);
        } else {
          return [...prevState, entryId];
        }
      });
      
      // Update entries array to reflect changes
      setEntries(prevEntries => prevEntries.map(e => 
        e.id === entryId ? {...e, bookmarked: !isCurrentlyBookmarked} : e
      ));
      
      toast.success(
        isCurrentlyBookmarked ? "Entry removed from bookmarks" : "Entry bookmarked!"
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark status.");
    }
  };

  // Edit entry
  const editEntry = (entry) => {
    setSelectedEntry(entry.id);
    setTitle(entry.title);
    setText(entry.content);
    setMood(entry.mood || "neutral");
    setTags(entry.tags || []);
    setIsPrivate(entry.isPrivate || false);
    
    // Focus and scroll to form
    window.scrollTo({top: 0, behavior: 'smooth'});
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 500);
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prevTags => [...prevTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  // Add tag from suggestions
  const addTagFromSuggestion = (tagName) => {
    if (!tags.includes(tagName)) {
      setTags(prevTags => [...prevTags, tagName]);
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };

  // Reset form
  const resetForm = () => {
    setSelectedEntry(null);
    setTitle("");
    setText("");
    setMood("neutral");
    setTags([]);
    setCurrentTag("");
    setIsPrivate(false);
  };

  // Filter entries based on search term and filters
  const filteredEntries = entries.filter(entry => {
    // Search term filter
    const matchesSearch = 
      entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Category filter
    if (filter === "all") return matchesSearch;
    if (filter === "bookmarked") return matchesSearch && bookmarkedEntries.includes(entry.id);
    if (filter === "private") return matchesSearch && entry.isPrivate;
    if (filter === "mood") return matchesSearch && entry.mood === mood;
    
    return matchesSearch;
  });

  const getMoodEmoji = (moodName) => {
    const moodObj = MOODS.find(m => m.name === moodName);
    return moodObj ? moodObj.emoji : "😐";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp.toDate());
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.toDate());
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-blue-700 to-violet-800 text-white ${darkMode ? 'brightness-75' : ''}`}>
      <Navbar />
      
      {/* Toast notifications container */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />

      {/* Main Content */}
      <main className="p-4 w-full md:w-[80%] lg:w-[60%] mx-auto pb-20">
        {/* Header with welcome and theme toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-gray-200 font-bold text-xl">
            {`Welcome ${loggedInUser?.displayName || "User"}`}
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Diary Entry Form */}
        <section className="mb-8" aria-labelledby="entry-form-heading">
          <h2 id="entry-form-heading" className="text-xl font-semibold mb-4">
            {selectedEntry ? "Edit Entry" : "New Entry"}
          </h2>
          <div className="bg-white/10 p-4 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-violet-400"
                required
                aria-label="Entry title"
              />
              
              {/* Private Toggle */}
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className="ml-2 p-2 rounded-full hover:bg-white/10 transition"
                title={isPrivate ? "Private entry" : "Public entry"}
                aria-label={isPrivate ? "Mark as public" : "Mark as private"}
              >
                {isPrivate ? 
                  <Lock size={18} className="text-violet-300" /> : 
                  <Unlock size={18} className="text-gray-300" />
                }
              </button>
            </div>
            
            {/* Mood Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">How are you feeling?</label>
              <div className="flex gap-3 flex-wrap">
                {MOODS.map((option) => (
                  <button
                    key={option.name}
                    className={`w-12 h-12 text-xl flex items-center justify-center rounded-full transition-all transform 
                      ${mood === option.name ? 'bg-violet-600 scale-110 shadow-lg' : 'bg-white/20 hover:bg-white/30'} 
                      shadow-md hover:shadow-lg active:scale-95 relative overflow-hidden`}
                    onClick={() => setMood(option.name)}
                    style={{
                      boxShadow: mood === option.name ? 
                        'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)' : 
                        'inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 3px rgba(0,0,0,0.2)'
                    }}
                    aria-label={`Set mood to ${option.name}`}
                    aria-pressed={mood === option.name}
                  >
                    <span className="transform" style={{ fontSize: '1.5rem' }}>
                      {option.emoji}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tags Input */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-violet-700/50 px-3 py-1 rounded-full text-sm flex items-center">
                    #{tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-1 p-1 hover:text-red-300"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add tags..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 p-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-violet-400"
                  aria-label="Tag input"
                />
                <button
                  onClick={addTag}
                  className="ml-2 px-3 py-1 bg-violet-700/50 rounded hover:bg-violet-700/70 transition"
                  disabled={!currentTag.trim()}
                >
                  Add
                </button>
              </div>
              
              {/* Tag suggestions */}
              {TAG_SUGGESTIONS
                .filter(tag => !tags.includes(tag) && (currentTag === "" || tag.includes(currentTag)))
                .length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-300 mb-1">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {TAG_SUGGESTIONS
                      .filter(tag => !tags.includes(tag) && (currentTag === "" || tag.includes(currentTag)))
                      .slice(0, 5)
                      .map(tag => (
                        <button
                          key={tag}
                          onClick={() => addTagFromSuggestion(tag)}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition"
                          aria-label={`Add ${tag} tag`}
                        >
                          #{tag}
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            {/* Content textarea */}
            <textarea
              ref={textareaRef}
              placeholder="Write your thoughts..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 h-40 bg-transparent border-b border-gray-400 focus:outline-none focus:border-violet-400 resize-y"
              required
              aria-label="Entry content"
            ></textarea>
            
            {/* Action buttons */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                type="submit"
                onClick={saveEntry}
                disabled={loading}
                className="px-4 py-2 bg-violet-800 rounded font-bold active:bg-violet-600 hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading}
              >
                <Save size={18} />
                {loading ? "Saving..." : (selectedEntry ? "Update Entry" : "Save Entry")}
              </button>
              
              {selectedEntry && (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(selectedEntry)}
                    className="px-4 py-2 bg-red-700 rounded font-bold hover:bg-red-600 transition flex items-center gap-2"
                    aria-label="Delete entry"
                  >
                    <Trash size={18} />
                    Delete
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-white/10 rounded font-bold hover:bg-white/20 transition"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-labelledby="delete-modal-title">
            <div className="bg-indigo-900 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 id="delete-modal-title" className="text-xl font-bold mb-2">Delete Entry</h3>
              <p className="mb-4">Are you sure you want to delete this entry? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteEntry(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-700 rounded font-bold hover:bg-red-600 transition flex items-center gap-2"
                >
                  <Trash size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtering and Search */}
        <div className="mb-6 space-y-3">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-lg whitespace-nowrap ${filter === "all" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"} transition`}
              aria-pressed={filter === "all"}
            >
              All Entries
            </button>
            <button
              onClick={() => setFilter("bookmarked")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap ${filter === "bookmarked" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"} transition`}
              aria-pressed={filter === "bookmarked"}
            >
              <Bookmark size={16} /> Bookmarked
            </button>
            <button
              onClick={() => setFilter("private")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap ${filter === "private" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"} transition`}
              aria-pressed={filter === "private"}
            >
              <Lock size={16} /> Private
            </button>
            <button
              onClick={() => setFilter("mood")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap ${filter === "mood" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"} transition`}
              aria-pressed={filter === "mood"}
            >
              {getMoodEmoji(mood)} By Mood
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Search entries by title, content or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 bg-white/5 rounded-lg border-2 border-transparent outline-none focus:border-violet-400 transition"
              aria-label="Search entries"
            />
            {searchTerm && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={18} className="text-gray-300 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Diary Entries List */}
        <section aria-labelledby="entries-heading">
          <h2 id="entries-heading" className="text-xl font-semibold mb-4">Your Entries</h2>
          
          {loading && entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-pulse bg-white/10 h-6 w-24 mx-auto rounded"></div>
              <p className="mt-2 text-gray-300">Loading your entries...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-lg">
              <p className="text-gray-300">
                {searchTerm || filter !== "all" ? "No entries match your search" : "Start writing your first entry!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4" role="list">
              {filteredEntries.map((entry) => (
                <article 
                  key={entry.id} 
                  className="bg-white/10 p-4 rounded-lg shadow-md hover:shadow-xl transition group"
                  role="listitem"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          {entry.title || "Untitled"} 
                          {entry.mood && (
                            <span className="inline-block transform scale-110 text-xl" style={{ 
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                            aria-label={`Mood: ${entry.mood}`}
                            >
                              {getMoodEmoji(entry.mood)}
                            </span>
                          )}
                        </h3>
                        {entry.isPrivate && (
                          <Lock size={14} className="ml-2 text-violet-300" aria-label="Private entry" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-300 mt-1 flex-wrap">
                        <Calendar size={14} className="mr-1" aria-hidden="true" />
                        <span>{formatDate(entry.createdAt)}</span>
                        {entry.createdAt && (
                          <>
                            <Clock size={14} className="ml-3 mr-1" aria-hidden="true" />
                            <span>{formatTime(entry.createdAt)}</span>
                          </>
                        )}
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <span className="ml-3 flex items-center flex-wrap" aria-label="Tags">
                            <Tag size={14} className="mr-1" aria-hidden="true" />
                            {entry.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="mr-2 text-violet-300">#{tag}</span>
                            ))}
                            {entry.tags.length > 3 && <span>+{entry.tags.length - 3}</span>}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <button 
                        onClick={() => toggleBookmark(entry.id)}
                        className={`p-1 rounded hover:bg-white/10 ${
                          bookmarkedEntries.includes(entry.id) ? 'text-yellow-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                        aria-label={bookmarkedEntries.includes(entry.id) ? "Remove bookmark" : "Add bookmark"}
                        aria-pressed={bookmarkedEntries.includes(entry.id)}
                      >
                        <Bookmark size={16} fill={bookmarkedEntries.includes(entry.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => editEntry(entry)}
                        className="p-1 rounded hover:bg-white/10 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Edit entry"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(entry.id)}
                        className="p-1 rounded hover:bg-white/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete entry"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={expandedEntry === entry.id ? "" : "line-clamp-3"}>
                    <p className="mt-2 text-white/80">
                      {entry.content || "No content"}
                    </p>
                  </div>
                  
                  {/* Read more / less toggle */}
                  {entry.content && entry.content.length > 200 && (
                    <button 
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                      className="mt-1 text-sm text-violet-300 hover:text-violet-200 flex items-center"
                      aria-expanded={expandedEntry === entry.id}
                    >
                      {expandedEntry === entry.id ? "Show less" : "Read more"}
                      <ChevronDown 
                        size={16} 
                        className={`ml-1 transition-transform ${expandedEntry === entry.id ? "rotate-180" : ""}`} 
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Diary;