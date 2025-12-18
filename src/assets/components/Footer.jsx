"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSquareGithub, faLinkedin, faInstagramSquare } from "@fortawesome/free-brands-svg-icons"
import { motion } from "framer-motion"
import { MapPin, Mail, Phone, ArrowUp, Heart, ExternalLink } from "lucide-react"
import Aos from "aos"
import "aos/dist/aos.css"
import { useEffect, useState } from "react"
import Contact from "./Contact"

function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    })

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/",
      icon: faLinkedin,
      color: "#0077B5",
      hoverBg: "hover:bg-[#0077B5]/10",
      label: "LinkedIn",
    },
    {
      href: "https://github.com/billnababan",
      icon: faSquareGithub,
      color: "#181717",
      darkColor: "#ffffff",
      hoverBg: "hover:bg-gray-500/10",
      label: "GitHub",
    },
    {
      href: "https://www.instagram.com/bill_jeferson/",
      icon: faInstagramSquare,
      color: "#E4405F",
      hoverBg: "hover:bg-[#E4405F]/10",
      label: "Instagram",
    },
  ]

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skill" },
    { name: "Projects", href: "#projects" },
    { name: "Certifications", href: "#certifications" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <section id="contact" className="bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10 py-16">
        {/* Contact Section Header */}
        {/* <div className="text-center mb-12" data-aos="fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Contact Me</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a project in mind or want to collaborate? Feel free to reach out!
          </p>
        </div> */}

        {/* Contact Form */}
        <div className="mb-20">
          <Contact />
        </div>

        {/* Footer Content */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-12" />

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1" data-aos="fade-up">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Bill Jeferson
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                A passionate Full Stack Developer dedicated to creating beautiful and functional web experiences.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${social.hoverBg} border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-lg`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FontAwesomeIcon
                      icon={social.icon}
                      className="text-xl transition-colors duration-300"
                      style={{ color: social.darkColor ? undefined : social.color }}
                    />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div data-aos="fade-up" data-aos-delay="100">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-500 transition-all duration-200" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div data-aos="fade-up" data-aos-delay="200">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Contact Info
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:billnbbn@gmail.com"
                    className="flex items-start gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group"
                  >
                    <Mail className="w-5 h-5 mt-0.5 text-indigo-500" />
                    <span className="text-sm">billnbbn@gmail.com</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <span className="text-sm">Batam, Indonesia</span>
                </li>
                <li>
                  <a
                    href="tel:0895383418428"
                    className="flex items-start gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                  >
                    <Phone className="w-5 h-5 mt-0.5 text-indigo-500" />
                    <span className="text-sm">+62 895-3834-18428</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter / CTA */}
            <div data-aos="fade-up" data-aos-delay="300">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Let's Work Together
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Ready to start your next project?</p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get in Touch
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                © {new Date().getFullYear()} Bill Jeferson. Made with
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                in Indonesia
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">All rights reserved.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 z-50 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </section>
  )
}

export default Footer
