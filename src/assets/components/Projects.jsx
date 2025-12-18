"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faUpRightFromSquare, faCircleInfo, faXmark, faArrowRight } from "@fortawesome/free-solid-svg-icons"

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = [
    {
      id: 1,
      title: "Reminders App for Kalimantan Prima Persada",
      description:
        "This project is a reminder application designed for Kalimantan Prima Persada, helping users manage their daily tasks and Sign document.",
      image: "/images/dashboardkpp.png",
      technologies: ["React Js", "Express Js", "Mysql", "Tailwind", "Material UI"],
      liveLink: "https://github.com/billnababan/RemindersAppsKppPrima",
      githubLink: "https://github.com/billnababan/RemindersAppsKppPrima",
      color: "from-blue-500 to-cyan-500",
    },
 {
  id: 2,
  title: "TaskFlow - Task Management System",
  description:
    "A comprehensive task management platform built for teams to collaborate efficiently. Features real-time updates via WebSocket, role-based access control (Admin/Manager/Employee), task assignment with deadline tracking, progress monitoring with visual analytics, and email notifications for important updates. Streamlines workflow management from task creation to completion.",
  image: "/images/livechattaskweb.png",
  technologies: ["React Js", "Express Js", "Mysql", "Tailwind", "Socket.io"],
  liveLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentClient",
  githubLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentClient",
  color: "from-purple-500 to-indigo-500",
},
    {
      id: 3,
      title: "Trufflehog Scanning",
      description:
        "This project utilizes Trufflehog as a robust scanning tool to detect sensitive information within codebases, enhancing security measures in software development.",
      image: "/images/trufflePage.png",
      technologies: ["React Js", "Express Js", "Mysql", "Tailwind", "Material UI"],
      liveLink: "https://github.com/billnababan/Client-Scan",
      githubLink: "https://github.com/billnababan/Client-Scan",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 4,
      title: "Web-based Project Collaboration",
      description:
        "As a Back End developer I am in charge behind the scenes of creating a Management system for tasks and collaboration projects for this company.",
      image: "/images/vitemock.png",
      technologies: ["React Js", "Tailwind", "Express Js", "Mysql", "Sql"],
      liveLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
      githubLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 5,
      title: "Simple Management Next Js",
      description:
        "In a Project-Based Learning group, I served as a backend developer to create a Minutes Archiving website for the faculty. This experience allowed me to collaborate effectively with the team.",
      image: "/images/nextjs.png",
      technologies: ["Next Js", "Javascript", "Tailwind", "Mysql", "Sql"],
      liveLink: "https://github.com/billnababan/next-js-simpel-project",
      githubLink: "https://github.com/billnababan/next-js-simpel-project",
      color: "from-emerald-500 to-teal-500",
    },
  ]

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <section id="projects" className="relative py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
            My Work
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Featured{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Here are some of my recent projects that showcase my skills and experience.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-xl transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedProject(project)}
                    className="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={faUpRightFromSquare} />
                    Live Demo
                  </a>
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faGithub} />
                      Code
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header with Image */}
        <div className="relative h-64">
          <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-40`} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{project.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{project.description}</p>

          {/* Technologies */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <a
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <FontAwesomeIcon icon={faUpRightFromSquare} />
              Live Demo
            </a>
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} />
                View Code
              </a>
            )}
            {project.moreInfoLink && (
              <a
                href={project.moreInfoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                More Info
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Projects
