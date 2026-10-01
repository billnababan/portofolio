import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faUpRightFromSquare, faXmark, faArrowRight } from "@fortawesome/free-solid-svg-icons"

const ProjectsStyles = () => (
  <style>{`
    @keyframes projGradShift {
      0%{background-position:0% 50%}
      100%{background-position:200% 50%}
    }
    .proj-grad-shift {
      background: linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);
      background-size: 200%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: projGradShift 5s linear infinite;
    }

    @keyframes projScanLine { 0%{top:-20%} 100%{top:120%} }
    .proj-scan-line {
      animation: projScanLine 3s linear infinite;
      animation-play-state: paused;
      will-change: top;
    }
    .proj-card:hover .proj-scan-line { animation-play-state: running; }

    .proj-card::after {
      content:'';
      position:absolute;inset:0;
      background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.3) 50%,transparent 70%);
      transform:translateX(-100%) skewX(-12deg);
      transition:transform .5s ease;
      pointer-events:none;
    }
    .proj-card:hover::after { transform:translateX(200%) skewX(-12deg); }

    .proj-tag-chip { transition: transform .2s, box-shadow .2s; }
    .proj-tag-chip:hover { transform:translateY(-2px); box-shadow:0 4px 10px rgba(59,130,246,.18); }

    @keyframes projGlowPulse { 0%,100%{opacity:.12;transform:scale(1)} 50%{opacity:.22;transform:scale(1.08)} }
    .proj-glow { animation: projGlowPulse 3.5s ease-in-out infinite; will-change:transform,opacity; }

    @keyframes projFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .proj-float { animation: projFloat 3.2s ease-in-out infinite; will-change:transform; }
  `}</style>
)

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = [
    {
      id: 1,
      title: "Reminders App for Kalimantan Prima Persada",
      description: "A reminder application designed for Kalimantan Prima Persada, helping users manage their daily tasks and sign documents efficiently.",
      image: "/images/dashboardkpp.png",
      technologies: ["React Js", "Express Js", "MySQL", "Tailwind", "Material UI"],
      liveLink: "https://github.com/billnababan/RemindersAppsKppPrima",
      githubLink: "https://github.com/billnababan/RemindersAppsKppPrima",
      gradient: "from-blue-500 to-cyan-500",
      accent: "#3b82f6",
      emoji: "📋",
    },
    {
      id: 2,
      title: "TaskFlow – Task Management System",
      description: "A comprehensive task management platform built for teams. Features real-time updates via WebSocket, role-based access control, task assignment with deadline tracking, and email notifications.",
      image: "/images/livechattaskweb.png",
      technologies: ["React Js", "Express Js", "MySQL", "Tailwind", "Socket.io"],
      liveLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentClient",
      githubLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentClient",
      gradient: "from-purple-500 to-indigo-500",
      accent: "#8b5cf6",
      emoji: "⚡",
    },
    {
      id: 3,
      title: "Trufflehog Scanning",
      description: "Utilizes Trufflehog as a robust scanning tool to detect sensitive information within codebases, enhancing security measures in software development.",
      image: "/images/trufflePage.png",
      technologies: ["React Js", "Express Js", "MySQL", "Tailwind", "Material UI"],
      liveLink: "https://github.com/billnababan/Client-Scan",
      githubLink: "https://github.com/billnababan/Client-Scan",
      gradient: "from-blue-500 to-cyan-500",
      accent: "#06b6d4",
      emoji: "🔍",
    },
    {
      id: 4,
      title: "Web-based Project Collaboration",
      description: "As a Back End developer, I built a management system for tasks and collaboration projects, handling all server-side logic and database architecture.",
      image: "/images/vitemock.png",
      technologies: ["React Js", "Tailwind", "Express Js", "MySQL", "SQL"],
      liveLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
      githubLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
      gradient: "from-purple-500 to-pink-500",
      accent: "#ec4899",
      emoji: "🤝",
    },
    {
      id: 5,
      title: "Simple Management Next.js",
      description: "In a Project-Based Learning group, served as backend developer to create a Minutes Archiving website for the faculty, collaborating effectively with the team.",
      image: "/images/nextjs.png",
      technologies: ["Next.js", "JavaScript", "Tailwind", "MySQL", "SQL"],
      liveLink: "https://github.com/billnababan/next-js-simpel-project",
      githubLink: "https://github.com/billnababan/next-js-simpel-project",
      gradient: "from-emerald-500 to-teal-500",
      accent: "#10b981",
      emoji: "🗂",
    },
    {
      id: 6,
      title: "Depot Management In & Out Full Js",
      description: "A depot management system tracking inventory in and out, built with a full JavaScript stack. Handles real-time stock monitoring and reporting.",
      image: "/images/edepot.png",
      technologies: ["React Js", "JavaScript", "Tailwind", "MySQL", "SQL"],
      liveLink: "https://github.com/billnababan?tab=repositories",
      githubLink: "https://github.com/billnababan?tab=repositories",
      gradient: "from-orange-500 to-amber-500",
      accent: "#f59e0b",
      emoji: "📦",
    },
  ]

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setSelectedProject(null) }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <section
      id="projects"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <ProjectsStyles />

      {/* ── Background orbs ── */}
      <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[380px] h-[380px] rounded-full bg-purple-400/8 blur-3xl pointer-events-none" />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.035]"
        style={{ backgroundImage:"radial-gradient(circle,rgba(59,130,246,.8) 1px,transparent 1px)", backgroundSize:"36px 36px" }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section header ── */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/40">
            🚀 My Work
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Featured{" "}
            <span className="relative inline-block">
              <span className="proj-grad-shift">Projects</span>
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Here are some of my recent projects that showcase my skills and experience.
          </p>
        </div>

        {/* ── Projects grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 180, damping: 18 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="proj-card group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-100/60 dark:border-gray-700/50 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-400"
              style={{ boxShadow: `0 4px 24px ${project.accent}10` }}
            >
              {/* Top gradient bar */}
              <div className={`h-[3px] bg-gradient-to-r ${project.gradient}`} />

              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                {/* Scan line */}
                <div
                  className="proj-scan-line absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                />
                {/* Arrow button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedProject(project)}
                    className="w-12 h-12 rounded-full bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white flex items-center justify-center shadow-xl backdrop-blur-sm border border-gray-100/50"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xl proj-float shrink-0">{project.emoji}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
                    {project.title}
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                {/* Tech chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="proj-tag-chip px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200/60 dark:border-gray-600/40"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500 rounded-full">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex items-center gap-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                  >
                    <FontAwesomeIcon icon={faUpRightFromSquare} className="text-xs" />
                    Live Demo
                  </a>
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faGithub} className="text-xs" />
                      Code
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </section>
  )
}

function ProjectModal({ project, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100/50 dark:border-gray-700/50"
      >
        <div className={`h-[3px] bg-gradient-to-r ${project.gradient}`} />

        <div className="relative h-64">
          <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-35`} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          {/* Emoji badge */}
          <div className="absolute bottom-4 left-4 text-4xl">{project.emoji}</div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h2>
          <p className="text-gray-500 dark:text-gray-300 leading-relaxed mb-6">{project.description}</p>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold border border-gray-200/50 dark:border-gray-600/40"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <motion.a
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r ${project.gradient} text-white font-bold rounded-xl hover:shadow-lg transition-all`}
            >
              <FontAwesomeIcon icon={faUpRightFromSquare} />
              Live Demo
            </motion.a>
            {project.githubLink && (
              <motion.a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} />
                View Code
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Projects