import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import {db} from "../firebase/config.js"
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, Clock, Edit, Save, Trash, Moon, Sun, Search, X, Tag, AlertTriangle, Camera, Lock, ChevronDown, Bookmark, Unlock, Image } from "lucide-react";

const Diary = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [bookmarkedEntries, setBookmarkedEntries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [tagSuggestions] = useState(["personal", "work", "health", "travel", "family", "goals", "gratitude", "memories"]);
  const textareaRef = useRef(null);
  
  const auth = getAuth();
  const navigate = useNavigate();

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
  const fetchEntries = async (userId) => {
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
      showAlert("Failed to load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save entry to Firestore
  const saveEntry = async () => {
    if (!title.trim() || !text.trim()) {
      showAlert("Please provide both title and content for your entry.");
      return;
    }
    
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
        showAlert("Entry updated successfully!", "success");
      } else {
        // Create new entry
        entryData.createdAt = serverTimestamp();
        await addDoc(collection(db, "diaryEntries"), entryData);
        showAlert("New entry saved!", "success");
      }
      
      // Reset form and refresh entries
      resetForm();
      fetchEntries(loggedInUser.uid);
    } catch (error) {
      console.error("Error saving entry:", error);
      showAlert("Failed to save your entry. Please try again.");
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
      showAlert("Entry deleted successfully!", "success");
      fetchEntries(loggedInUser.uid);
    } catch (error) {
      console.error("Error deleting entry:", error);
      showAlert("Failed to delete entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle bookmark status
  const toggleBookmark = async (entryId) => {
    try {
      const entry = entries.find(e => e.id === entryId);
      const isCurrentlyBookmarked = bookmarkedEntries.includes(entryId);
      
      const entryRef = doc(db, "diaryEntries", entryId);
      await updateDoc(entryRef, {
        bookmarked: !isCurrentlyBookmarked
      });
      
      if (isCurrentlyBookmarked) {
        setBookmarkedEntries(bookmarkedEntries.filter(id => id !== entryId));
      } else {
        setBookmarkedEntries([...bookmarkedEntries, entryId]);
      }
      
      // Update entries array to reflect changes
      setEntries(entries.map(e => 
        e.id === entryId ? {...e, bookmarked: !isCurrentlyBookmarked} : e
      ));
      
      showAlert(
        isCurrentlyBookmarked ? "Entry removed from bookmarks" : "Entry bookmarked!", 
        "success"
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      showAlert("Failed to update bookmark status.");
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
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

  // Show alert
  const showAlert = (message, type = "error") => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Filter entries based on search term and filters
  const filteredEntries = entries.filter(entry => {
    // Search term filter
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Category filter
    if (filter === "all") return matchesSearch;
    if (filter === "bookmarked") return matchesSearch && bookmarkedEntries.includes(entry.id);
    if (filter === "private") return matchesSearch && entry.isPrivate;
    if (filter === "mood") return matchesSearch && entry.mood === mood;
    
    return matchesSearch;
  });

  const getMoodEmoji = (mood) => {
    switch(mood) {
      case "happy": return "😊";
      case "sad": return "😢";
      case "excited": return "🎉";
      case "angry": return "😠";
      case "anxious": return "😰";
      default: return "😐";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-blue-700 to-violet-800 text-white ${darkMode ? 'brightness-75' : ''}`}>
      <Navbar />

      {/* Main Content */}
      <main className="p-4 w-full md:w-[80%] lg:w-[60%] mx-auto pb-20">
        {/* Alert Message */}
        {alertMessage && (
          <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ${
            alertMessage.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
            {alertMessage.type === "success" ? 
              <Check size={18} /> : 
              <AlertTriangle size={18} />
            }
            <span>{alertMessage.message}</span>
          </div>
        )}

        {/* Header with welcome and theme toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-gray-200 font-bold text-xl">
            {`Welcome ${loggedInUser?.displayName || "User"}`}
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Diary Entry Form */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {selectedEntry ? "Edit Entry" : "New Entry"}
          </h2>
          <div className="bg-white/10 p-4 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              {/* Preserved original input styling */}
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-transparent border-b border-gray-400 focus:outline-none"
                required
              />
              
              {/* Private Toggle */}
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className="ml-2 p-2 rounded-full"
                title={isPrivate ? "Private entry" : "Public entry"}
              >
                {isPrivate ? 
                  <Lock size={18} className="text-violet-300" /> : 
                  <Unlock size={18} className="text-gray-300" />
                }
              </button>
            </div>
            
            {/* Mood Selection with 3D-style emoji buttons */}
            <div className="mb-4">
              <label className="block mb-2 text-sm">How are you feeling?</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { name: "neutral", emoji: "😐" },
                  { name: "happy", emoji: "😊" },
                  { name: "sad", emoji: "😢" },
                  { name: "excited", emoji: "🎉" },
                  { name: "angry", emoji: "😠" },
                  { name: "anxious", emoji: "😰" }
                ].map((option) => (
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
              <label className="block mb-2 text-sm">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-violet-700/50 px-3 py-1 rounded-full text-sm flex items-center">
                    #{tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-1 p-1 hover:text-red-300"
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
                  className="flex-1 p-2 bg-transparent border-b border-gray-400 focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="ml-2 px-3 py-1 bg-violet-700/50 rounded"
                >
                  Add
                </button>
              </div>
              
              {/* Tag suggestions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {tagSuggestions
                  .filter(tag => !tags.includes(tag) && (currentTag === "" || tag.includes(currentTag)))
                  .slice(0, 5)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setTags([...tags, tag]);
                      }}
                      className="px-2 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20"
                    >
                      #{tag}
                    </button>
                  ))
                }
              </div>
            </div>
            
            {/* Preserved original textarea styling */}
            <textarea
              ref={textareaRef}
              placeholder="Write your thoughts..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 h-40 bg-transparent border-b border-gray-400 focus:outline-none"
              required
            ></textarea>
            
            {/* Action buttons */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                type="submit"
                onClick={saveEntry}
                disabled={loading}
                className="px-4 py-2 bg-violet-800 rounded font-bold active:bg-violet-600 hover:bg-violet-700 transition flex items-center gap-2"
              >
                <Save size={18} />
                {loading ? "Saving..." : (selectedEntry ? "Update Entry" : "Save Entry")}
              </button>
              
              {selectedEntry && (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(selectedEntry)}
                    className="px-4 py-2 bg-red-700 rounded font-bold hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Trash size={18} />
                    Delete
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-white/10 rounded font-bold hover:bg-white/20 transition"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-indigo-900 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-2">Delete Entry</h3>
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
              className={`px-3 py-2 rounded-lg whitespace-nowrap ${filter === "all" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"}`}
            >
              All Entries
            </button>
            <button
              onClick={() => setFilter("bookmarked")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap ${filter === "bookmarked" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"}`}
            >
              <Bookmark size={16} /> Bookmarked
            </button>
            <button
              onClick={() => setFilter("private")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap ${filter === "private" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"}`}
            >
              <Lock size={16} /> Private
            </button>
            <button
              onClick={() => setFilter("mood")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap ${filter === "mood" ? "bg-violet-600" : "bg-white/10 hover:bg-white/20"}`}
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
              className="w-full pl-10 p-3 bg-white/5 rounded-lg focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>
        </div>

        {/* Diary Entries List */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Entries</h2>
          
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
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <article 
                  key={entry.id} 
                  className="bg-white/10 p-4 rounded-lg shadow-md hover:shadow-xl transition group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          {entry.title} 
                          {entry.mood && (
                            <span className="inline-block transform scale-110 text-xl" style={{ 
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {getMoodEmoji(entry.mood)}
                            </span>
                          )}
                        </h3>
                        {entry.isPrivate && (
                          <Lock size={14} className="ml-2 text-violet-300" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-300 mt-1 flex-wrap">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(entry.createdAt)}
                        {entry.createdAt && (
                          <>
                            <Clock size={14} className="ml-3 mr-1" />
                            {new Date(entry.createdAt.toDate()).toLocaleTimeString('en-US', {
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </>
                        )}
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <span className="ml-3 flex items-center flex-wrap">
                            <Tag size={14} className="mr-1" />
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
                      >
                        <Bookmark size={16} fill={bookmarkedEntries.includes(entry.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => editEntry(entry)}
                        className="p-1 rounded hover:bg-white/10 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(entry.id)}
                        className="p-1 rounded hover:bg-white/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={expandedEntry === entry.id ? "" : "line-clamp-3"}>
                    <p className="mt-2 text-white/80">
                      {entry.content}
                    </p>
                  </div>
                  
                  {/* Read more / less toggle */}
                  {entry.content.length > 200 && (
                    <button 
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                      className="mt-1 text-sm text-violet-300 hover:text-violet-200 flex items-center"
                    >
                      {expandedEntry === entry.id ? "Show less" : "Read more"}
                      <ChevronDown 
                        size={16} 
                        className={`ml-1 transition-transform ${expandedEntry === entry.id ? "rotate-180" : ""}`} 
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

// Manually define a Check icon since it wasn't imported
const Check = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Diary;