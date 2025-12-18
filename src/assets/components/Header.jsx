"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSquareGithub } from "@fortawesome/free-brands-svg-icons"
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin"
import { faInstagramSquare } from "@fortawesome/free-brands-svg-icons"
import Aos from "aos"
import "aos/dist/aos.css"
import { useEffect, useState, useCallback } from "react"
import { useMediaQuery } from "react-responsive"
// import NetworkAnimation from "./NetworkAnimation"
import CustomCursor from "./CustomCursor"
import { TypeAnimation } from "react-type-animation"
import { motion } from "framer-motion"

const Header = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: null, y: null })

  const handleCursorMove = useCallback((position) => {
    setCursorPosition(position)
  }, [])

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    })
  }, [])

  const isLargeScreen = useMediaQuery({ query: "(min-width: 768px)" })

  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/",
      icon: faLinkedin,
      color: "hover:text-[#0077B5]",
      bgColor: "hover:bg-[#0077B5]/10",
      label: "LinkedIn",
    },
    {
      href: "https://github.com/billnababan",
      icon: faSquareGithub,
      color: "hover:text-gray-900 dark:hover:text-white",
      bgColor: "hover:bg-gray-900/10 dark:hover:bg-white/10",
      label: "GitHub",
    },
    {
      href: "https://www.instagram.com/bill_jeferson/",
      icon: faInstagramSquare,
      color: "hover:text-[#E4405F]",
      bgColor: "hover:bg-[#E4405F]/10",
      label: "Instagram",
    },
  ]

  return (
    <header
      id="header"
      className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden flex items-center"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* {isLargeScreen && <NetworkAnimation cursorPosition={cursorPosition} />} */}
      <CustomCursor onPositionChange={handleCursorMove} />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-8 py-20 md:py-0">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium"
            >
              👋 Welcome to my portfolio
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Hi, I'm{" "}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Bill Jeferson
              </span>
            </h1>

            <div className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 dark:text-gray-300 h-12">
              <TypeAnimation
                sequence={["Frontend Developer", 2000, "Backend Developer", 2000, "SQL Developer", 2000]}
                wrapper="span"
                speed={50}
                repeat={Number.POSITIVE_INFINITY}
                className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
              />
            </div>

            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto md:mx-0">
              Passionate about creating scalable web applications with clean code and modern technologies.
            </p>

            {/* Social Links */}
            <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 text-gray-600 dark:text-gray-400 ${social.color} ${social.bgColor} transition-all duration-300`}
                  aria-label={social.label}
                >
                  <FontAwesomeIcon icon={social.icon} className="text-2xl" />
                </motion.a>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-4"
            >
              <a
                href="#contact"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
              >
                Let's Connect
              </a>
              <a
                href="#projects"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:scale-105 transition-all duration-300"
              >
                View Projects
              </a>
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              {/* Decorative rings */}
              <div
                className="absolute inset-0 -m-4 rounded-full border-2 border-dashed border-blue-300/50 dark:border-blue-600/30 animate-spin-slow"
                style={{ animationDuration: "20s" }}
              />
              <div
                className="absolute inset-0 -m-8 rounded-full border-2 border-dashed border-cyan-300/30 dark:border-cyan-600/20 animate-spin-slow"
                style={{ animationDuration: "30s", animationDirection: "reverse" }}
              />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-30 scale-110" />

              {/* Image container */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl"
              >
                <img src="/images/FotoProfil.jpeg" alt="Bill Jeferson Nababan" className="w-full h-full object-cover" />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="absolute -top-4 -right-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <span className="text-2xl">💻</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY }}
                className="absolute -bottom-4 -left-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <span className="text-2xl">🚀</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 flex justify-center pt-2">
          <div className="w-1 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
        </div>
      </motion.div>
    </header>
  )
}

export default Header
