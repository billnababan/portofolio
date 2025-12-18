"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAward, faXmark, faExternalLink } from "@fortawesome/free-solid-svg-icons"
import Aos from "aos"
import "aos/dist/aos.css"

const certifications = [
  {
    id: 1,
    title: "RHCSA",
    issuer: "Red Hat",
    date: "2023",
    image: "/images/rhcsa.jpg",
    link: "https://www.credly.com/badges/175f5a3c-d2a4-4fea-aa0c-ce60edc66ce7/print",
    color: "from-red-500 to-red-600",
  },
  {
    id: 2,
    title: "Junior Web Programmer",
    issuer: "Badan Nasional Sertifikasi Profesi",
    date: "2024",
    image: "/images/JWP.jpg",
    link: "https://drive.google.com/file/d/1O5hIsetlbDPugeD57X8TdJPhrWdSc9WP/view?usp=sharing",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 3,
    title: "Mentor Web",
    issuer: "Infinite Learning",
    date: "2024",
    image: "/images/sertifmentor.jpg",
    color: "from-emerald-500 to-emerald-600",
  },
]

function Certifications() {
  const [selectedCert, setSelectedCert] = useState(null)

  useEffect(() => {
    Aos.init({ duration: 1000, once: false })
  }, [])

  return (
    <section id="certifications" className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/50 dark:bg-amber-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium">
            <FontAwesomeIcon icon={faAward} className="mr-2" />
            Achievements
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            My{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Certifications
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Professional certifications that validate my skills and knowledge.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedCert(cert)}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-xl transition-all duration-300"
            >
              {/* Top Color Bar */}
              <div className={`h-1.5 bg-gradient-to-r ${cert.color}`} />

              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cert.image || "/placeholder.svg"}
                  alt={cert.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* View Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="px-4 py-2 bg-white/90 text-gray-900 rounded-full text-sm font-medium">
                    View Certificate
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cert.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{cert.issuer}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${cert.color} text-white text-sm font-medium`}
                  >
                    {cert.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`h-2 bg-gradient-to-r ${selectedCert.color}`} />

              {/* Image */}
              <div className="relative">
                <img
                  src={selectedCert.image || "/placeholder.svg"}
                  alt={selectedCert.title}
                  className="w-full h-72 object-cover"
                />
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCert.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedCert.issuer}</p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full bg-gradient-to-r ${selectedCert.color} text-white font-medium`}
                  >
                    {selectedCert.date}
                  </div>
                </div>

                {selectedCert.link && (
                  <a
                    href={selectedCert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${selectedCert.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300`}
                  >
                    <FontAwesomeIcon icon={faExternalLink} />
                    View Certificate
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Certifications
