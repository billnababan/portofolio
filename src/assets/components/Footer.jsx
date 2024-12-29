import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareGithub } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
import { faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Contact from "./Contact";

function Footer() {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <section id="contact" className="dark:bg-hitam py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-hitam text-xl sm:text-2xl md:text-4xl font-bold dark:text-background">Contact Me</h2>
        </div>

        <div className="mt-10">
          <Contact />
        </div>

        <motion.div className="mt-16 md:mt-20 relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Thank You Message Section */}
          <motion.div className="text-center mb-12 p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <motion.p
              className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%"],
                color: ["#a855f7", "#ec4899"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              Thank you for visiting my portfolio!
            </motion.p>
            <motion.p className="text-sm sm:text-lg md:text-xl mt-2 text-gray-600 dark:text-gray-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Stay tuned for exciting updates and new projects coming soon!
            </motion.p>
          </motion.div>

          {/* Footer Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-gray-800 pt-8">
            {/* Contact Information */}
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <h3 className="text-lg font-semibold dark:text-background mb-4">Get in Touch</h3>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="text-sm sm:text-base dark:text-background hover:text-blue-600 transition-colors duration-300">billnbbn@gmail.com</p>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <p className="text-sm sm:text-base dark:text-background">Batam</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <motion.p className="text-sm sm:text-base dark:text-background hover:text-kuning transition-colors duration-300" whileHover={{ scale: 1.05 }}>
                  0895383418428
                </motion.p>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <h3 className="text-lg font-semibold dark:text-background mb-4">Connect With Me</h3>
              <div className="flex space-x-4">
                {[
                  { href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/", icon: faLinkedin, color: "#0077B5", label: "LinkedIn" },
                  { href: "https://github.com/billnababan", icon: faSquareGithub, color: "#181717", label: "GitHub" },
                  { href: "https://www.instagram.com/bill_jeferson/", icon: faInstagramSquare, color: "#E4405F", label: "Instagram" },
                ].map((social) => (
                  <motion.a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FontAwesomeIcon icon={social.icon} className="text-2xl sm:text-3xl transition-all duration-300" style={{ color: social.color }} />
                    <span className="text-xs mt-1 dark:text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300">{social.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <h3 className="text-lg font-semibold dark:text-background mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Home", "About", "Projects", "Skills"].map((link) => (
                  <motion.a key={link} href={`#${link.toLowerCase()}`} className="text-sm sm:text-base dark:text-background hover:text-blue-600 transition-colors duration-300" whileHover={{ x: 5 }}>
                    {link}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.div className="text-center mt-8 pt-8 border-t border-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <p className="text-sm sm:text-base text-blue-600 hover:text-blue-700">© 2024 - Developed by Bill Jeferson</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Footer;
