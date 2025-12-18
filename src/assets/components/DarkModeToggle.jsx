"use client"

import { useState, useEffect } from "react"

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem("dark-mode")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (savedMode === "true" || (!savedMode && prefersDark)) {
      setIsDarkMode(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("dark-mode", isDarkMode)
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const handleToggle = () => {
    setIsAnimating(true)
    setIsDarkMode(!isDarkMode)
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden group transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-indigo-900/20 to-purple-900/20"
            : "bg-gradient-to-br from-amber-100 to-orange-100"
        }`}
      />

      {/* Sun icon */}
      <div
        className={`absolute transition-all duration-500 ease-out ${
          isDarkMode ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
        }`}
      >
        <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path
            strokeLinecap="round"
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
        {/* Sun rays animation */}
        <div className={`absolute inset-0 ${isAnimating && !isDarkMode ? "animate-ping" : ""}`}>
          <svg
            className="w-7 h-7 text-amber-400/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
        </div>
      </div>

      {/* Moon icon */}
      <div
        className={`absolute transition-all duration-500 ease-out ${
          isDarkMode ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
        }`}
      >
        <svg className="w-6 h-6 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        {/* Stars */}
        <div
          className={`absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full transition-all duration-300 ${
            isDarkMode ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
          style={{ animationDelay: "100ms" }}
        />
        <div
          className={`absolute top-1 -left-2 w-1.5 h-1.5 bg-yellow-200 rounded-full transition-all duration-300 ${
            isDarkMode ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
          style={{ animationDelay: "200ms" }}
        />
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-indigo-400/30 transition-all duration-300" />
    </button>
  )
}

export default DarkModeToggle
