

import Aos from "aos"
import "aos/dist/aos.css"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload, faCode, faDatabase, faServer } from "@fortawesome/free-solid-svg-icons"

function About() {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    })
  }, [])

  const skills = [
    { icon: faCode, title: "Frontend", desc: "React, HTML, CSS, Tailwind" },
    { icon: faServer, title: "Backend", desc: "Express, Node.js" },
    { icon: faDatabase, title: "Database", desc: "MySQL, MongoDB, SQL" },
  ]

  return (
    <section id="about" className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100/50 dark:bg-cyan-900/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Get to know me
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            About <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Me</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6" data-aos="fade-right">
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                Hello, I am <span className="font-semibold text-gray-900 dark:text-white">Bill Jeferson Nababan</span>,
                a passionate web developer with expertise in SQL, Frontend, and Backend development. I graduated from{" "}
                <span className="text-blue-600 dark:text-blue-400">Batam State Polytechnic</span> with a major in
                Informatics Engineering.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                I specialize in backend programming and have strong experience in frameworks like
                <span className="font-medium text-cyan-600 dark:text-cyan-400"> ExpressJS</span> and
                <span className="font-medium text-cyan-600 dark:text-cyan-400"> ReactJS</span>. My approach to
                development focuses on creating scalable and efficient solutions.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                I'm a proactive problem solver and thrive in collaborative environments. I am always eager to learn and
                grow, ready to take on challenges and deliver high-quality results.
              </p>
            </div>

            {/* Download CV Button */}
            <motion.a
              href="./images/CV_BillJeferson.pdf"
              download="CV_BillJeferson.pdf"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
              data-aos="fade-up"
            >
              <FontAwesomeIcon icon={faDownload} className="text-lg" />
              Download My CV
            </motion.a>
          </div>

          {/* Skills Cards */}
          <div className="lg:col-span-2 space-y-4" data-aos="fade-left">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: -5 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <FontAwesomeIcon icon={skill.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{skill.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{skill.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white text-center">
                <div className="text-3xl font-bold">3+</div>
                <div className="text-sm opacity-80">Years Learning</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white text-center">
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm opacity-80">Projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
