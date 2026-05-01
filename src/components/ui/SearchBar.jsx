import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

function SearchBar({
  placeholder = "Search notes, papers, syllabus...",
  onSearch,
  autoFocus = false,
  delay = 400,          // 🔥 debounce delay
  loading = false,      // 🔥 show loading
  value = ""            // 🔥 controlled support
}) {

  const [query, setQuery] = useState(value);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  /* 🔄 SYNC CONTROLLED VALUE */
  useEffect(() => {
    setQuery(value);
  }, [value]);

  /* 🔍 DEBOUNCE SEARCH */
  useEffect(() => {

    if (!onSearch) return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = query.trim();
      onSearch(trimmed);
    }, delay);

    return () => clearTimeout(debounceRef.current);

  }, [query, delay, onSearch]);

  /* ⌨️ ENTER SEARCH */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(debounceRef.current);
      onSearch && onSearch(query.trim());
    }
  };

  /* ❌ CLEAR */
  const clearSearch = () => {
    setQuery("");
    onSearch && onSearch("");
    inputRef.current?.focus();
  };

  /* 🎯 AUTO FOCUS */
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (

    <div
      className="bg-white shadow-md border rounded-full flex items-center px-4 py-2 w-full"
      role="search"
    >

      <Search size={18} className="text-gray-400 mr-2" />

      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search"
        className="flex-1 bg-transparent outline-none text-sm text-gray-700"
      />

      {/* 🔄 LOADING */}
      {loading && (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
      )}

      {/* ❌ CLEAR */}
      {query && !loading && (
        <button
          onClick={clearSearch}
          aria-label="Clear search"
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      )}

    </div>

  );

}

export default SearchBar;