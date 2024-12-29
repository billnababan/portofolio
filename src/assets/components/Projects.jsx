import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faUpRightFromSquare, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    {
      id: 1,
      title: "Trufflehog Scanning",
      description: "This project utilizes Trufflehog as a robust scanning tool to detect sensitive information within codebases, enhancing security measures in software development.",
      image: "/images/trufflePage.png",
      technologies: ["React Js", "Express Js", "Mysql", "Tailwind", "Material UI"],
      liveLink: "https://github.com/billnababan/Client-Scan",
      githubLink: "https://github.com/billnababan/Client-Scan",
      moreInfoLink: "https://drive.google.com/file/d/1vHS4Vojtb6otbtJFhIod-HZgB6_8Nvsq/view?usp=sharing",
    },
    {
      id: 2,
      title: "Web-based Project Collaboration Application Design - Backend",
      description: "As a Back End developer I am in charge behind the scenes of creating a Management system for tasks and collaboration projects for this company.",
      image: "/images/vitemock.png",
      technologies: ["React Js", "Tailwind", "Express Js", "Mysql", "Sql"],
      liveLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
      githubLink: "https://github.com/billnababan/WebBasedProjecAndAssigmentServer",
    },
    {
      id: 3,
      title: "Simple Management Next Js",
      description:
        "In a Project-Based Learning group, I served as a backend developer to create a Minutes Archiving website for the faculty. This experience allowed me to collaborate effectively with the team while enhancing my skills in communication, cooperation, and problem-solving.",
      image: "/images/nextjs.png",
      technologies: ["Next Js", "Javascript", "Tailwind", "Mysql", "Sql"],
      liveLink: "https://github.com/billnababan/next-js-simpel-project",
      githubLink: "https://github.com/billnababan/next-js-simpel-project",
    },
    // {
    //   id: 4,
    //   title: "My Portfolio",
    //   description: "My first portfolio project and also my first project using React JS. I am very happy to be able to create this simple project in a short time.",
    //   image: "/billjeff/images/porto.svg",
    //   technologies: ["React Js", "Tailwind"],
    //   liveLink: "#",
    //   githubLink: "https://github.com/kuncoro-0927/portofolio-react-tailwindcss",
    // },
    // {
    //   id: 5,
    //   title: "UI/UX Design - iTern",
    //   description: "As a Full Stack Web Developer in the previous iTern project, I have created a UI/UX design for iTern. I use Figma as a tool to create designs.",
    //   image: "/portofolio-react-tailwindcss/images/uiux.png",
    //   technologies: ["Figma"],
    //   liveLink:
    //     "https://www.figma.com/proto/aGhSYUx4fXqGVhF69iPlGY/PBL-iTern?page-id=988%3A873&node-id=988-1711&viewport=1284%2C841%2C0.25&t=6oqCWyRvbDxtdeSQ-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=988%3A1711",
    // },
  ];

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <section id="projects" className="bg-gray-100 dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedProject(project)}
            >
              <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between">
                  <a href={project.liveLink} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <FontAwesomeIcon icon={faUpRightFromSquare} className="mr-2" />
                    Live Site
                  </a>
                  {project.githubLink && (
                    <a href={project.githubLink} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                      <FontAwesomeIcon icon={faGithub} className="mr-2" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>{selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}</AnimatePresence>
    </section>
  );
}

function ProjectModal({ project, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full relative"
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold z-10">
          &times;
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{project.title}</h2>
          <img src={project.image} alt={project.title} className="w-full h-64 object-cover rounded-lg mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech, index) => (
              <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                {tech}
              </span>
            ))}
          </div>
          <div className="flex justify-between">
            <a href={project.liveLink} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              <FontAwesomeIcon icon={faUpRightFromSquare} className="mr-2" />
              Live Site
            </a>
            {project.githubLink && (
              <a href={project.githubLink} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                <FontAwesomeIcon icon={faGithub} className="mr-2" />
                GitHub
              </a>
            )}
            {project.moreInfoLink && (
              <a href={project.moreInfoLink} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                <FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
                More Info
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Projects;
