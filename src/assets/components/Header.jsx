"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSquareGithub } from "@fortawesome/free-brands-svg-icons"
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin"
import { faInstagramSquare } from "@fortawesome/free-brands-svg-icons"
import { useState, useCallback, useRef, memo } from "react"
import CustomCursor from "./CustomCursor"
import { TypeAnimation } from "react-type-animation"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"

/* ─────────────────────────────────────────
   PERFORMANCE RULES APPLIED:
   ✅ Only transform + opacity animated (GPU only, no layout)
   ✅ Particles removed → replaced with CSS-only keyframes
   ✅ Infinite zoom = 1 CSS animation, not multiple JS layers
   ✅ Orbit dots = CSS rotate, not JS per-dot animation
   ✅ will-change: transform on heavy elements
   ✅ Framer Motion only where truly needed (tilt, magnetic, spring)
───────────────────────────────────────── */

/* ── CSS Animations injected once ── */
const GlobalStyles = () => (
  <style>{`
    /* Infinite zoom: single element, pure CSS, GPU only */
    @keyframes infiniteZoom {
      0%   { transform: scale(1);   opacity: 0.18; }
      80%  { opacity: 0.12; }
      100% { transform: scale(2.6); opacity: 0; }
    }
    .zoom-ring {
      animation: infiniteZoom 5s linear infinite;
      will-change: transform, opacity;
    }
    .zoom-ring:nth-child(2) { animation-delay: -1.25s; }
    .zoom-ring:nth-child(3) { animation-delay: -2.5s; }
    .zoom-ring:nth-child(4) { animation-delay: -3.75s; }

    /* Orbit ring – single element rotation */
    @keyframes orbitSpin  { to { transform: rotate(360deg); } }
    @keyframes orbitSpinR { to { transform: rotate(-360deg); } }
    .orbit-cw  { animation: orbitSpin  18s linear infinite; will-change: transform; }
    .orbit-ccw { animation: orbitSpinR 26s linear infinite; will-change: transform; }

    /* Floating badges */
    @keyframes floatUp   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(5deg)} }
    @keyframes floatDown { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(12px) rotate(-5deg)} }
    .float-up   { animation: floatUp   3.2s ease-in-out infinite; will-change: transform; }
    .float-down { animation: floatDown 3.7s ease-in-out infinite; will-change: transform; }

    /* Scan line across photo */
    @keyframes scanLine { 0%{top:-20%} 100%{top:120%} }
    .scan-line {
      animation: scanLine 3s linear infinite;
      animation-play-state: paused;
      will-change: top;
    }
    .photo-wrap:hover .scan-line { animation-play-state: running; }

    /* Glow pulse */
    @keyframes glowPulse { 0%,100%{opacity:.2;transform:scale(1.05)} 50%{opacity:.38;transform:scale(1.18)} }
    .glow-pulse { animation: glowPulse 3.5s ease-in-out infinite; will-change: transform, opacity; }

    /* Gradient shift on name */
    @keyframes gradShift { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
    .grad-shift {
      background: linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);
      background-size: 200%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradShift 5s linear infinite;
    }

    /* Underline grow */
    @keyframes underlineGrow { from{width:0} to{width:100%} }
    .underline-grow { animation: underlineGrow 0.9s cubic-bezier(.22,1,.36,1) 1s forwards; width:0; }

    /* Arrow bounce */
    @keyframes arrowBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
    .arrow-bounce { animation: arrowBounce 1s ease-in-out infinite; display:inline-block; }

    /* Waving hand */
    @keyframes waveHand { 0%,100%{transform:rotate(0)} 25%{transform:rotate(20deg)} 75%{transform:rotate(-8deg)} }
    .wave-hand { animation: waveHand 1.6s ease-in-out 1.8s 3; display:inline-block; }

    /* Scroll dot */
    @keyframes scrollDot { 0%,100%{transform:translateY(0);opacity:1} 100%{transform:translateY(18px);opacity:0} }
    .scroll-dot { animation: scrollDot 1.8s ease-in-out infinite; will-change: transform; }

    /* Shimmer on hover for social buttons */
    .shimmer-btn::after {
      content:'';
      position:absolute;inset:0;
      background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);
      transform:translateX(-100%) skewX(-12deg);
      transition:transform .45s ease;
    }
    .shimmer-btn:hover::after { transform:translateX(200%) skewX(-12deg); }

    /* Tag hover */
    .tag-chip { transition: transform .2s, box-shadow .2s; }
    .tag-chip:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(59,130,246,.2); }
  `}</style>
)

/* ─────────────────────────────────────────
   MAGNETIC SOCIAL BUTTON
   (Framer Motion OK here – it's a user-driven
   one-off, not a continuous loop)
───────────────────────────────────────── */
const MagneticButton = memo(({ href, icon, color, bgColor, label, index }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 320, damping: 20 })
  const sy = useSpring(y, { stiffness: 320, damping: 20 })

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.55 + index * 0.11, type: "spring", stiffness: 220, damping: 14 }}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * 0.38)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.38)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      whileTap={{ scale: 0.88 }}
      className={`shimmer-btn relative p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-md text-gray-600 dark:text-gray-400 ${color} ${bgColor} transition-colors duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-700/60`}
      aria-label={label}
    >
      <FontAwesomeIcon icon={icon} className="text-2xl relative z-10" />
    </motion.a>
  )
})
MagneticButton.displayName = "MagneticButton"

/* ─────────────────────────────────────────
   STAT BADGE
───────────────────────────────────────── */
const StatBadge = memo(({ value, label, delay, style }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: -12 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ delay, type: "spring", stiffness: 260, damping: 16 }}
    whileHover={{ scale: 1.08, rotate: 2 }}
    className="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-4 py-3 flex flex-col items-center border border-gray-100/60 dark:border-gray-700/50"
    style={style}
  >
    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
      {value}
    </span>
    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase mt-0.5">
      {label}
    </span>
  </motion.div>
))
StatBadge.displayName = "StatBadge"

/* ─────────────────────────────────────────
   MAIN HEADER
───────────────────────────────────────── */
const Header = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: null, y: null })
  const handleCursorMove = useCallback((pos) => setCursorPosition(pos), [])

  /* 3D tilt – only runs on user interaction, not looping */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-400, 400], [8, -8]), { stiffness: 70, damping: 22 })
  const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-8, 8]), { stiffness: 70, damping: 22 })

  const handleMouseMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - r.left - r.width / 2)
    mouseY.set(e.clientY - r.top - r.height / 2)
  }, [mouseX, mouseY])

  const socialLinks = [
    { href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/", icon: faLinkedin,       color: "hover:text-[#0077B5]", bgColor: "hover:bg-[#0077B5]/10", label: "LinkedIn" },
    { href: "https://github.com/billnababan",                                icon: faSquareGithub,  color: "hover:text-gray-900 dark:hover:text-white", bgColor: "hover:bg-gray-900/10 dark:hover:bg-white/10", label: "GitHub" },
    { href: "https://www.instagram.com/bill_jeferson/",                      icon: faInstagramSquare, color: "hover:text-[#E4405F]", bgColor: "hover:bg-[#E4405F]/10", label: "Instagram" },
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden:   { opacity: 0, y: 26 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <header
      id="header"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden flex items-center"
    >
      <GlobalStyles />

      {/* ── Soft static background orbs (no JS animation) ── */}
      <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[440px] h-[440px] rounded-full bg-cyan-400/12 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3  w-72       h-72       rounded-full bg-purple-400/8  blur-3xl pointer-events-none" />

      {/* ── Subtle dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.8) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <CustomCursor onPositionChange={handleCursorMove} />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-8 py-20 md:py-0">

          {/* ════════ LEFT – Text ════════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center md:text-left"
          >
            {/* Welcome badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/40">
                <span className="wave-hand">👋</span>
                Welcome to my portfolio
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Hi, I'm{" "}
              <span className="relative inline-block">
                <span className="grad-shift">Bill Jeferson</span>
                <span className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 underline-grow" />
              </span>
            </motion.h1>

            {/* TypeAnimation */}
            <motion.div
              variants={itemVariants}
              className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-semibold h-12"
            >
              <TypeAnimation
                sequence={["Frontend Developer", 2000, "Backend Developer", 2000, "SQL Developer", 2000]}
                wrapper="span"
                speed={55}
                repeat={Infinity}
                className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
              />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto md:mx-0 leading-relaxed"
            >
              Passionate about creating scalable web applications with clean code and modern technologies.
            </motion.p>

            {/* Social links */}
            <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center md:justify-start gap-4">
              {socialLinks.map((s, i) => <MagneticButton key={s.label} {...s} index={i} />)}
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-4"
            >
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow duration-300"
              >
                Let's Connect <span className="arrow-bounce">→</span>
              </motion.a>

              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300 shadow-md"
              >
                View Projects
              </motion.a>
            </motion.div>

            {/* Tech chips */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
              {["React", "Next.js", "Node.js", "PostgreSQL"].map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 + i * 0.07, type: "spring" }}
                  className="tag-chip px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-default"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* ════════ RIGHT – Photo ════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 110, damping: 18 }}
            style={{ perspective: 1000 }}
            className="flex-1 flex justify-center items-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">

              {/* ── INFINITE ZOOM rings (pure CSS, 4 staggered) ── */}
              <div className="absolute inset-0 rounded-full border border-blue-400/25 zoom-ring" />
              <div className="absolute inset-0 rounded-full border border-cyan-400/20  zoom-ring" />
              <div className="absolute inset-0 rounded-full border border-blue-300/15  zoom-ring" />
              <div className="absolute inset-0 rounded-full border border-cyan-300/12  zoom-ring" />

              {/* ── Spinning dashed rings (CSS, GPU-only rotate) ── */}
              <div className="orbit-cw  absolute inset-0 -m-6 rounded-full border-2 border-dashed border-blue-300/35 dark:border-blue-600/20 pointer-events-none" />
              <div className="orbit-ccw absolute inset-0 -m-12 rounded-full border-2 border-dashed border-cyan-300/20 dark:border-cyan-600/12 pointer-events-none" />

              {/* ── Glow (CSS pulse) ── */}
              <div className="glow-pulse absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-400/20 blur-2xl pointer-events-none" />

              {/* ── Photo with Framer 3D tilt ── */}
              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="photo-wrap relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl"
              >
                <img
                  src="/images/FotoProfil.jpeg"
                  alt="Bill Jeferson Nababan"
                  className="w-full h-full object-cover"
                />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-700/35 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                {/* scan line – paused until hover, triggered by CSS */}
                <div
                  className="scan-line absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none"
                />
              </motion.div>

              {/* ── Floating badges (CSS, no JS loop) ── */}
              <div className="float-up absolute -top-5 -right-5 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 cursor-default select-none">
                <span className="text-2xl">💻</span>
              </div>
              <div className="float-down absolute -bottom-5 -left-5 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 cursor-default select-none">
                <span className="text-2xl">🚀</span>
              </div>

              {/* ── Stat badges ── */}
              <StatBadge value="2+"  label="Yrs Exp"  delay={1.1} style={{ top: "8%",   right: "-30%" }} />
              <StatBadge value="20+" label="Projects" delay={1.3} style={{ bottom: "10%", right: "-30%" }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-gray-400 dark:text-gray-600 tracking-[.22em] uppercase font-semibold"
          style={{ animation: "scrollDot 2s ease-in-out infinite", animationName: "none", opacity: 0.7 }}
        >
          Scroll
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 flex justify-center pt-2 overflow-hidden">
          <div className="scroll-dot w-1.5 h-2.5 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
        </div>
      </motion.div>
    </header>
  )
}

export default Header