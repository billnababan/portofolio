import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAward, faXmark, faExternalLink } from "@fortawesome/free-solid-svg-icons"
import Aos from "aos"
import "aos/dist/aos.css"

const CertStyles = () => (
  <style>{`
    @keyframes certGradShift {
      0%{background-position:0% 50%}
      100%{background-position:200% 50%}
    }
    .cert-grad-shift {
      background: linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);
      background-size: 200%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: certGradShift 5s linear infinite;
    }

    @keyframes certGlowPulse { 0%,100%{opacity:.13;transform:scale(1)} 50%{opacity:.25;transform:scale(1.1)} }
    .cert-glow { animation: certGlowPulse 3.5s ease-in-out infinite; will-change:transform,opacity; }

    @keyframes certFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
    .cert-float { animation: certFloat 3.6s ease-in-out infinite; will-change:transform; }

    .cert-card::after {
      content:'';
      position:absolute;inset:0;
      background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);
      transform:translateX(-100%) skewX(-12deg);
      transition:transform .5s ease;
      pointer-events:none;
    }
    .cert-card:hover::after { transform:translateX(200%) skewX(-12deg); }

    @keyframes certScanLine { 0%{top:-20%} 100%{top:120%} }
    .cert-scan-line {
      animation: certScanLine 3s linear infinite;
      animation-play-state: paused;
      will-change: top;
    }
    .cert-card:hover .cert-scan-line { animation-play-state: running; }
  `}</style>
)

const certifications = [
  {
    id: 1,
    title: "RHCSA",
    issuer: "Red Hat",
    date: "2023",
    image: "/images/rhcsa.jpg",
    link: "https://www.credly.com/badges/175f5a3c-d2a4-4fea-aa0c-ce60edc66ce7/print",
    gradient: "from-red-500 to-orange-500",
    accent: "#ef4444",
    emoji: "🔴",
  },
  {
    id: 2,
    title: "Junior Web Programmer",
    issuer: "Badan Nasional Sertifikasi Profesi",
    date: "2024",
    image: "/images/JWP.jpg",
    link: "https://drive.google.com/file/d/1O5hIsetlbDPugeD57X8TdJPhrWdSc9WP/view?usp=sharing",
    gradient: "from-blue-500 to-cyan-500",
    accent: "#3b82f6",
    emoji: "💻",
  },
  {
    id: 3,
    title: "Mentor Web",
    issuer: "Infinite Learning",
    date: "2024",
    image: "/images/sertifmentor.jpg",
    gradient: "from-emerald-500 to-teal-500",
    accent: "#10b981",
    emoji: "🏆",
  },
]

function Certifications() {
  const [selectedCert, setSelectedCert] = useState(null)

  useEffect(() => {
    Aos.init({ duration: 1000, once: false })
    const handleEsc = (e) => { if (e.key === "Escape") setSelectedCert(null) }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <section
      id="certifications"
      className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden"
    >
      <CertStyles />

      {/* ── Background orbs ── */}
      <div className="absolute -top-32 right-0  w-[420px] h-[420px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-0 w-[380px] h-[380px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage:"radial-gradient(circle,rgba(59,130,246,.8) 1px,transparent 1px)", backgroundSize:"36px 36px" }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section header ── */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold border border-amber-200/50 dark:border-amber-700/40">
            <FontAwesomeIcon icon={faAward} />
            Achievements
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            My{" "}
            <span className="relative inline-block">
              <span className="cert-grad-shift">Certifications</span>
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Professional certifications that validate my skills and knowledge.
          </p>
        </div>

        {/* ── Certs grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, type: "spring", stiffness: 180, damping: 18 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedCert(cert)}
              className="cert-card group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-gray-100/60 dark:border-gray-700/50 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-400"
              style={{ boxShadow: `0 4px 24px ${cert.accent}12` }}
            >
              {/* Top gradient bar */}
              <div className={`h-[3px] bg-gradient-to-r ${cert.gradient}`} />

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cert.image || "/placeholder.svg"}
                  alt={cert.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                {/* Scan line */}
                <div
                  className="cert-scan-line absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* View overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="px-5 py-2.5 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border border-gray-100/50">
                    View Certificate
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl cert-float">{cert.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{cert.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cert.issuer}</p>
                    </div>
                  </div>
                  {/* Year badge – matches Header StatBadge style */}
                  <div className="shrink-0 px-3 py-1.5 bg-white/95 dark:bg-gray-700/95 rounded-xl shadow border border-gray-100/50 dark:border-gray-600/50 flex flex-col items-center">
                    <span className={`text-sm font-bold bg-gradient-to-r ${cert.gradient} bg-clip-text text-transparent`}>
                      {cert.date}
                    </span>
                    <span className="text-[8px] text-gray-400 font-semibold tracking-widest uppercase">year</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
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
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-[3px] bg-gradient-to-r ${selectedCert.gradient}`} />

              <div className="relative">
                <img
                  src={selectedCert.image || "/placeholder.svg"}
                  alt={selectedCert.title}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCert.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedCert.issuer}</p>
                  </div>
                  {/* Year badge */}
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/80 rounded-2xl shadow border border-gray-100/50 dark:border-gray-600/50 text-center">
                    <p className={`text-lg font-bold bg-gradient-to-r ${selectedCert.gradient} bg-clip-text text-transparent`}>
                      {selectedCert.date}
                    </p>
                    <p className="text-[9px] text-gray-400 font-semibold tracking-widest uppercase">year</p>
                  </div>
                </div>

                {selectedCert.link && (
                  <motion.a
                    href={selectedCert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${selectedCert.gradient} text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300`}
                  >
                    <FontAwesomeIcon icon={faExternalLink} />
                    View Certificate
                  </motion.a>
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