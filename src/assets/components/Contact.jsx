// "use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import axios from "axios";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        background: "#1a1a1a",
        color: "#fff",
      });
      return;
    }

    if (!name || !email || !message) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill in all fields",
        background: "#1a1a1a",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("https://api.web3forms.com/submit", {
        access_key: "585659b1-8cdb-48dc-94e7-7ce98b392c96", // Ganti sesuai akses key Anda
        name,
        email,
        message,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Your message has been sent",
          background: "#1a1a1a",
          color: "#fff",
        });
        setName("");
        setEmail("");
        setMessage("");
      } else {
        throw new Error(response.data.message || "Failed to submit form");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an error sending your message",
        background: "#1a1a1a",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full border-2 border-blue-500 rounded-lg shadow-lg p-6 dark:border-gray-700">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name Field */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full border-b border-gray-300 bg-transparent pt-4 pb-1.5 text-gray-900 dark:text-white placeholder-transparent focus:border-blue-600 focus:outline-none"
                placeholder="Name"
              />
              <label
                htmlFor="name"
                className="absolute left-0 -top-1 text-gray-600 dark:text-gray-400 text-sm transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
                peer-focus:-top-1 peer-focus:text-blue-600 peer-focus:text-sm"
              >
                Name
              </label>
            </div>
          </motion.div>

          {/* Email Field */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full border-b border-gray-300 bg-transparent pt-4 pb-1.5 text-gray-900 dark:text-white placeholder-transparent focus:border-blue-600 focus:outline-none"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-1 text-gray-600 dark:text-gray-400 text-sm transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
                peer-focus:-top-1 peer-focus:text-blue-600 peer-focus:text-sm"
              >
                Email
              </label>
            </div>
          </motion.div>

          {/* Message Field */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
            <div className="relative">
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="peer w-full border-b border-gray-300 bg-transparent pt-4 pb-1.5 text-gray-900 dark:text-white placeholder-transparent focus:border-blue-600 focus:outline-none resize-none"
                placeholder="Message"
              />
              <label
                htmlFor="message"
                className="absolute left-0 -top-1 text-gray-600 dark:text-gray-400 text-sm transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
                peer-focus:-top-1 peer-focus:text-blue-600 peer-focus:text-sm"
              >
                Message
              </label>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }} className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  Send Message
                  <FontAwesomeIcon icon={faPaperPlane} className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
