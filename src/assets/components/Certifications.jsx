import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Aos from "aos";
import "aos/dist/aos.css";
const certifications = [
  {
    id: 1,
    title: "RHCSA",
    issuer: "Red Hat",
    date: "2023",
    image: "/portofolio-react-tailwindcss/images/rhcsa.jpg",
    link: "https://www.credly.com/badges/175f5a3c-d2a4-4fea-aa0c-ce60edc66ce7/print",
  },
  {
    id: 2,
    title: "Junior Web Programmer",
    issuer: "Badan Nasional Sertifikasi Profesi",
    date: "2024",
    image: "/portofolio-react-tailwindcss/images/JWP.jpg",
    link: "https://drive.google.com/file/d/1O5hIsetlbDPugeD57X8TdZPhrWdSc9WP/view?usp=sharing",
  },
  {
    id: 3,
    title: "Mentor Web",
    issuer: "Infinite Learning",
    date: "2024",
    image: "/portofolio-react-tailwindcss/images/sertifmentor.jpg",
    // link: "https://www.example.com/cert/fullstack",
  },
  // Add more certifications as needed
];

function Certifications() {
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    Aos.init({ duration: 1000, once: false });
  }, []);

  return (
    <section id="certifications" className="bg-white dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert) => (
            <motion.div key={cert.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} onClick={() => setSelectedCert(cert)}>
              <img src={cert.image} alt={cert.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{cert.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{cert.issuer}</p>
                <p className="text-gray-500 dark:text-gray-400">{cert.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selectedCert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCert(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={selectedCert.image} alt={selectedCert.title} className="w-full h-64 object-cover rounded-t-lg" />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{selectedCert.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-1">{selectedCert.issuer}</p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{selectedCert.date}</p>
                <a href={selectedCert.link} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  View Certificate
                </a>
              </div>
              <button onClick={() => setSelectedCert(null)} className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center">
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Certifications;
