import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLinkedin,
  faGithub,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons"
import {
  ArrowUp,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

import Aos from "aos"
import "aos/dist/aos.css"
import Contact from "./Contact"

export default function Footer() {
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const socialLinks = [
    {
      icon: faLinkedin,
      href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/",
      hover: "hover:text-[#0077B5]",
      bg: "hover:bg-[#0077B5]/10",
    },
    {
      icon: faGithub,
      href: "https://github.com/billnababan",
      hover: "hover:text-black dark:hover:text-white",
      bg: "hover:bg-black/10 dark:hover:bg-white/10",
    },
    {
      icon: faInstagram,
      href: "https://www.instagram.com/bill_jeferson/",
      hover: "hover:text-[#E4405F]",
      bg: "hover:bg-[#E4405F]/10",
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
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Background Effects */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle,rgba(59,130,246,.8) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* CONTACT */}
        <div className="py-24">
          <Contact />
        </div>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-gray-700 to-transparent mb-14" />

          {/* Main Footer Card */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl shadow-blue-500/5">
            {/* Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 p-8 lg:p-12">
              {/* Brand */}
              <div data-aos="fade-up">
                <div className="mb-5">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Bill Jeferson
                  </h2>

                  <div className="mt-3 w-20 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                </div>

                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-6">
                  Full Stack Developer focused on building modern, scalable,
                  and user-friendly web applications with clean UI & smooth UX.
                </p>

                {/* Social */}
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-700/70 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-300 ${social.hover} ${social.bg}`}
                    >
                      <FontAwesomeIcon
                        icon={social.icon}
                        className="text-lg"
                      />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div data-aos="fade-up" data-aos-delay="100">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-5">
                  Quick Links
                </h3>

                <ul className="space-y-4">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      >
                        <span className="w-0 group-hover:w-3 h-[2px] bg-blue-500 transition-all duration-300 rounded-full" />
                        <span className="text-sm font-medium">
                          {link.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-5">
                  Contact Info
                </h3>

                <div className="space-y-5">
                  <a
                    href="mailto:billnbbn@gmail.com"
                    className="group flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Mail className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-1">
                        Email
                      </p>

                      <p className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        billnbbn@gmail.com
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-1">
                        Location
                      </p>

                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        Batam, Indonesia
                      </p>
                    </div>
                  </div>

                  <a
                    href="tel:0895383418428"
                    className="group flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Phone className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-1">
                        Phone
                      </p>

                      <p className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        +62 895-3834-18428
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* CTA */}
              <div data-aos="fade-up" data-aos-delay="300">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-5">
                  Let's Build Something
                </h3>

                <div className="h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-6">
                      Got a project idea, freelance work, or startup chaos?
                      Let's turn it into something clean instead of another
                      cursed production deploy jam 2 pagi.
                    </p>
                  </div>

                  <motion.a
                    href="#contact"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    Get In Touch
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-8 lg:px-12 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  © {new Date().getFullYear()} Bill Jeferson. Made with
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  in Indonesia
                </p>

                <p className="text-xs tracking-widest uppercase text-gray-400 dark:text-gray-500">
                  Full Stack Developer
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll To Top */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all duration-300 hover:shadow-blue-500/50 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </section>
  )
}