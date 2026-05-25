"use client"

import Aos from "aos"
import "aos/dist/aos.css"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload, faCode, faDatabase, faServer, faGraduationCap, faLightbulb } from "@fortawesome/free-solid-svg-icons"

/* ── CSS Animations – same system as Header ── */
const AboutStyles = () => (
  <style>{`
    @keyframes aboutGradShift {
      0%{background-position:0% 50%}
      100%{background-position:200% 50%}
    }
    .about-grad-shift {
      background: linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);
      background-size: 200%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: aboutGradShift 5s linear infinite;
    }

    @keyframes aboutUnderlineGrow { from{width:0} to{width:100%} }
    .about-underline-grow {
      animation: aboutUnderlineGrow 0.9s cubic-bezier(.22,1,.36,1) 0.6s forwards;
      width: 0;
    }

    @keyframes aboutFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(4deg)} }
    @keyframes aboutFloatAlt { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(10px) rotate(-4deg)} }
    .about-float     { animation: aboutFloat    3.4s ease-in-out infinite; will-change:transform; }
    .about-float-alt { animation: aboutFloatAlt 3.9s ease-in-out infinite; will-change:transform; }

    .about-card-shimmer { position:relative; overflow:hidden; }
    .about-card-shimmer::after {
      content:'';
      position:absolute;inset:0;
      background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.3) 50%,transparent 70%);
      transform:translateX(-100%) skewX(-12deg);
      transition:transform .5s ease;
      pointer-events:none;
    }
    .about-card-shimmer:hover::after { transform:translateX(200%) skewX(-12deg); }

    .about-tag-chip { transition: transform .2s, box-shadow .2s; }
    .about-tag-chip:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(59,130,246,.2); }

    @keyframes aboutBarFill { from{width:0%} to{width:var(--target-w)} }
    .about-skill-bar {
      animation: aboutBarFill 1.2s cubic-bezier(.22,1,.36,1) forwards;
      width: 0%;
    }

    @keyframes aboutPulseRing {
      0%   { transform: scale(1);   opacity: 0.6 }
      100% { transform: scale(1.8); opacity: 0 }
    }
    .about-pulse-ring { animation: aboutPulseRing 2.2s ease-out infinite; will-change:transform,opacity; }
    .about-pulse-ring:nth-child(2) { animation-delay: 0.7s; }

    @keyframes aboutGlowPulse { 0%,100%{opacity:.1;transform:scale(1)} 50%{opacity:.2;transform:scale(1.1)} }
    .about-glow { animation: aboutGlowPulse 3.5s ease-in-out infinite; will-change:transform,opacity; }
  `}</style>
)

function About() {
  useEffect(() => {
    Aos.init({ duration: 1000, once: false })
  }, [])

  const skills = [
    { icon: faCode,     title: "Frontend",  desc: "React, Next.js, HTML, CSS, Tailwind", level: 85, color: "from-blue-500 to-cyan-400" },
    { icon: faServer,   title: "Backend",   desc: "Express.js, Node.js, REST API",       level: 90, color: "from-blue-600 to-blue-400" },
    { icon: faDatabase, title: "Database",  desc: "MySQL, MongoDB, PostgreSQL, SQL",     level: 80, color: "from-cyan-500 to-teal-400" },
  ]

  const highlights = [
    { icon: faGraduationCap, label: "Batam State Polytechnic", sub: "Informatics Engineering", color: "from-blue-600 to-cyan-500" },
    { icon: faLightbulb,     label: "Proactive Problem Solver", sub: "Always eager to learn",   color: "from-cyan-500 to-teal-400" },
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }
  const itemVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section
      id="about"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <AboutStyles />

      {/* ── Background orbs (same as Header) ── */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-blue-400/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-400/5 blur-3xl pointer-events-none" />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.038]"
        style={{ backgroundImage:"radial-gradient(circle,rgba(59,130,246,.8) 1px,transparent 1px)", backgroundSize:"36px 36px" }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section badge + heading ── */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/40">
            👤 Get to know me
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            About{" "}
            <span className="relative inline-block">
              <span className="about-grad-shift">Me</span>
              <span className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 about-underline-grow" />
            </span>
          </h2>
        </div>

        {/* ── Main grid: bio left, skills right ── */}
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* ══ LEFT – Bio + Highlights (3 cols) ══ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Bio card */}
            <motion.div
              variants={itemVariants}
              className="about-card-shimmer p-8 bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative"
            >
              {/* top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />

              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                Hello, I am{" "}
                <span className="font-bold text-gray-900 dark:text-white">Bill Jeferson Nababan</span>, a passionate
                web developer with expertise in SQL, Frontend, and Backend development. I graduated from{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">Batam State Polytechnic</span> with a
                major in Informatics Engineering.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                I specialize in backend programming and have strong experience in frameworks like{" "}
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">ExpressJS</span> and{" "}
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">ReactJS</span>. My approach focuses
                on creating scalable and efficient solutions.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                I'm a proactive problem solver and thrive in collaborative environments — always eager to learn, grow,
                and deliver high-quality results.
              </p>
            </motion.div>

            {/* Highlight cards row */}
            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="about-card-shimmer flex items-center gap-4 p-5 bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative"
                >
                  <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br ${h.color} text-white shadow-md`}>
                    <FontAwesomeIcon icon={h.icon} className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{h.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Tech chips */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              {["React", "Next.js", "Node.js", "Express.js", "PostgreSQL", "MySQL", "Tailwind", "MongoDB"].map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 + i * 0.05, type: "spring" }}
                  viewport={{ once: true }}
                  className="about-tag-chip px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-default"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 items-center">
              <motion.a
                href="./images/CV_BillJeferson.pdf"
                download="CV_BillJeferson.pdf"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow duration-300"
              >
                <FontAwesomeIcon icon={faDownload} className="text-lg" />
                Download CV
              </motion.a>
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300 shadow-md"
              >
                View Projects
                <span className="inline-block" style={{animation:"arrowBounce 1s ease-in-out infinite"}}>→</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ══ RIGHT – Skill bars + Stat badges (2 cols) ══ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Skill bar cards */}
            {skills.map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12, type: "spring", stiffness: 200, damping: 18 }}
                viewport={{ once: true }}
                whileHover={{ x: -4 }}
                className="about-card-shimmer p-6 bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br ${skill.color} text-white shadow-md shadow-blue-500/20`}>
                    <FontAwesomeIcon icon={skill.icon} className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-gray-900 dark:text-white">{skill.title}</h3>
                      <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        {skill.level}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{skill.desc}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color} about-skill-bar`}
                    style={{ "--target-w": `${skill.level}%`, animationDelay: `${0.3 + index * 0.15}s` }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Stat badges grid – matches Header StatBadge style */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { v: "3+",  l: "Yrs Learning", emoji: "📚" },
                { v: "10+", l: "Projects",     emoji: "🚀" },
                { v: "2+",  l: "Yrs Exp",      emoji: "💼" },
                { v: "5+",  l: "Tech Stacks",  emoji: "⚙️" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, scale: 0, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 260, damping: 16 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06, rotate: 1 }}
                  className="flex flex-col items-center gap-1.5 py-5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100/60 dark:border-gray-700/50"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {s.v}
                  </span>
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase">
                    {s.l}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About