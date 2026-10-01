import Aos from "aos"
import "aos/dist/aos.css"
import { useEffect, useState } from "react"

/* ── CSS Animations – same system as Header ── */
const SkillsStyles = () => (
  <style>{`
    @keyframes skillsGradShift {
      0%{background-position:0% 50%}
      100%{background-position:200% 50%}
    }
    .skills-grad-shift {
      background: linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);
      background-size: 200%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: skillsGradShift 5s linear infinite;
    }

    @keyframes skillsGlowPulse {
      0%,100%{opacity:.12;transform:scale(1)}
      50%{opacity:.22;transform:scale(1.1)}
    }
    .skills-glow { animation: skillsGlowPulse 3.5s ease-in-out infinite; will-change:transform,opacity; }

    /* Card hover bottom accent grow */
    .skill-card .accent-line { width:0%; transition:width .3s ease; }
    .skill-card:hover .accent-line { width:60%; }

    /* Floating badge */
    @keyframes skillsFloat {
      0%,100%{transform:translateY(0)}
      50%{transform:translateY(-6px)}
    }
    .skills-float { animation: skillsFloat 3.2s ease-in-out infinite; will-change:transform; }

    /* Shimmer */
    .skill-card::after {
      content:'';
      position:absolute;inset:0;
      background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.3) 50%,transparent 70%);
      transform:translateX(-100%) skewX(-12deg);
      transition:transform .45s ease;
      pointer-events:none;
    }
    .skill-card:hover::after { transform:translateX(200%) skewX(-12deg); }
  `}</style>
)

function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState(null)

  useEffect(() => {
    Aos.init({ duration: 1000, once: false })
  }, [])

  const skills = [
    {
      name: "HTML",
      category: "Frontend",
      color: "#E65100",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#E65100" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"/>
          <path fill="#FF6D00" d="M24 8L24 39.9 35.2 36.7 37.7 8z"/>
          <path fill="#FFF" d="M24,25v-4h8.6l-0.7,11.5L24,35.1v-4.2l4.1-1.4l0.3-4.5H24z M32.9,17l0.3-4H24v4H32.9z"/>
          <path fill="#EEE" d="M24,30.9v4.2l-7.9-2.6L15.7,27h4l0.2,2.5L24,30.9z M19.1,17H24v-4h-9.1l0.7,12H24v-4h-4.6L19.1,17z"/>
        </svg>
      ),
    },
    {
      name: "CSS",
      category: "Frontend",
      color: "#0277BD",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#0277BD" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"/>
          <path fill="#039BE5" d="M24 8L24 39.9 35.2 36.7 37.7 8z"/>
          <path fill="#FFF" d="M33.1 13L24 13 24 17 28.9 17 28.6 21 24 21 24 25 28.4 25 28.1 29.5 24 30.9 24 35.1 31.9 32.5 32.6 21 32.6 21z"/>
          <path fill="#EEE" d="M24,13v4h-8.9l-0.3-4H24z M19.4,21l0.2,4H24v-4H19.4z M19.8,27h-4l0.3,5.5l7.9,2.6v-4.2l-4.1-1.4L19.8,27z"/>
        </svg>
      ),
    },
    {
      name: "JavaScript",
      category: "Frontend",
      color: "#F7DF1E",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#ffd600" d="M6,42V6h36v36H6z"/>
          <path fill="#000001" d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"/>
        </svg>
      ),
    },
    {
      name: "React",
      category: "Frontend",
      color: "#61DAFB",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 228" className="w-full h-full">
          <path fill="#00D8FF" d="M210.483 73.824a172 172 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171 171 0 0 0-6.375 5.848a156 156 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a171 171 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a146 146 0 0 0 6.921 2.165a168 168 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a146 146 0 0 0 5.342-4.923a168 168 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145 145 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844"/>
          <path fill="#FFF" d="M128.001 90.775c12.997 0 23.531 10.535 23.531 23.531c0 12.997-10.534 23.531-23.531 23.531c-12.997 0-23.531-10.534-23.531-23.531c0-12.996 10.534-23.531 23.531-23.531"/>
        </svg>
      ),
    },
    {
      name: "Next.js",
      category: "Frontend",
      color: "#000000",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="w-full h-full">
          <path fill="#000" d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6H36.7V40.4h13.1l55.4 79.4C114.9 106 128 86.5 128 64c0-35.3-28.7-64-64-64z"/>
          <path fill="#fff" d="M88.5 40.4h13v55.4L88.5 80V40.4zm-23.5 0h13v39.2l-13-18.6V40.4z"/>
        </svg>
      ),
    },
    {
      name: "Express Js",
      category: "Backend",
      color: "#212121",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="w-full h-full">
          <path d="M126.67 98.44c-4.56 1.16-7.38.05-9.91-3.75-5.68-8.51-11.95-16.63-18-24.9-.78-1.07-1.59-2.12-2.6-3.45C89 76 81.85 85.2 75.14 94.77c-2.4 3.42-4.92 4.91-9.4 3.7l26.92-36.13L67.6 29.71c4.31-.84 7.29-.41 9.93 3.45 5.83 8.52 12.26 16.63 18.67 25.21 6.45-8.55 12.8-16.67 18.8-25.11 2.41-3.42 5-4.72 9.33-3.46-3.28 4.35-6.49 8.63-9.72 12.88-4.36 5.73-8.64 11.53-13.16 17.14-1.61 2-1.35 3.3.09 5.19C109.9 76 118.16 87.1 126.67 98.44zM1.33 61.74c.72-3.61 1.2-7.29 2.2-10.83 6-21.43 30.6-30.34 47.5-17.06C60.93 41.64 63.39 52.62 62.9 65H7.1c-.84 22.21 15.15 35.62 35.53 28.78 7.15-2.4 11.36-8 13.47-15 1.07-3.51 2.84-4.06 6.14-3.06-1.69 8.76-5.52 16.08-13.52 20.66-12 6.86-29.13 4.64-38.14-4.89C5.26 85.89 3 78.92 2 71.39c-.15-1.2-.46-2.38-.7-3.57q.03-3.04.03-6.08zm5.87-1.49h50.43c-.33-16.06-10.33-27.47-24-27.57-15-.12-25.78 11.02-26.43 27.57z"/>
        </svg>
      ),
    },
    {
      name: "Tailwind",
      category: "Frontend",
      color: "#06B6D4",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#00acc1" d="M24,9.604c-6.4,0-10.4,3.199-12,9.597c2.4-3.199,5.2-4.398,8.4-3.599c1.826,0.456,3.131,1.781,4.576,3.247C27.328,21.236,30.051,24,36,24c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.6c-1.825-0.456-3.13-1.781-4.575-3.247C32.672,12.367,29.948,9.604,24,9.604L24,9.604z M12,24c-6.4,0-10.4,3.199-12,9.598c2.4-3.199,5.2-4.399,8.4-3.599c1.825,0.457,3.13,1.781,4.575,3.246c2.353,2.388,5.077,5.152,11.025,5.152c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.599c-1.826-0.456-3.131-1.781-4.576-3.246C20.672,26.764,17.949,24,12,24L12,24z"/>
        </svg>
      ),
    },
    {
      name: "Bootstrap",
      category: "Frontend",
      color: "#7952B3",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#673ab7" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"/>
          <path fill="#fff" d="M33.03,25.6c-0.65-0.9-1.59-1.52-2.8-1.85c0,0,1.02-0.37,1.94-1.75c0.55-0.88,0.83-1.94,0.83-3.18c0-2.15-0.78-3.8-2.34-4.93C29.1,12.76,27.34,12,24.35,12H15v24h10.43c2.83-0.02,4.96-0.63,6.41-1.8c1.44-1.19,2.16-2.95,2.16-5.3C34,27.6,33.68,26.5,33.03,25.6z M21,16c0,0,4.17,0,4.25,0c1.52,0,2.75,1.23,2.75,2.75c0,1.52-1.23,2.75-2.75,2.75c-0.08,0-4.25,0-4.25,0V16z M26,32h-5v-6h5c1.66,0,3,1.34,3,3C29,30.66,27.66,32,26,32z"/>
        </svg>
      ),
    },
    {
      name: "PHP",
      category: "Backend",
      color: "#777BB4",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 135" className="w-full h-full">
          <ellipse cx="128" cy="67.3" fill="#6181B6" rx="128" ry="67.3"/>
          <path fill="#FFF" d="m152.9 87.5l6.1-31.4c1.4-7.1.2-12.4-3.4-15.7c-3.5-3.2-9.5-4.8-18.3-4.8h-10.6l3-15.6c.1-.6 0-1.2-.4-1.7s-.9-.7-1.5-.7h-14.6c-1 0-1.8.7-2 1.6l-6.5 33.3c-.6-3.8-2-7-4.4-9.6c-4.3-4.9-11-7.4-20.1-7.4H52.1c-1 0-1.8.7-2 1.6L37 104.7c-.1.6 0 1.2.4 1.7s.9.7 1.5.7h14.7c1 0 1.8-.7 2-1.6l3.2-16.3h10.9c5.7 0 10.6-.6 14.3-1.8q5.85-1.95 10.5-6.3c2.5-2.3 4.6-4.9 6.2-7.7l-2.6 13.5c-.1.6 0 1.2.4 1.7s.9.7 1.5.7h14.6c1 0 1.8-.7 2-1.6l7.2-37h10c4.3 0 5.5.8 5.9 1.2c.3.3.9 1.5.2 5.2L134.1 87c-.1.6 0 1.2.4 1.7s.9.7 1.5.7h15c.9-.3 1.7-1 1.9-1.9m-67.6-26c-.9 4.7-2.6 8.1-5.1 10s-6.6 2.9-12 2.9h-6.5l4.7-24.2h8.4c6.2 0 8.7 1.3 9.7 2.4c1.3 1.6 1.6 4.7.8 8.9m130-18.6c-4.3-4.9-11-7.4-20.1-7.4h-28.3c-1 0-1.8.7-2 1.6l-13.1 67.5c-.1.6 0 1.2.4 1.7s.9.7 1.5.7h14.7c1 0 1.8-.7 2-1.6l3.2-16.3h10.9c5.7 0 10.6-.6 14.3-1.8q5.85-1.95 10.5-6.3c2.6-2.4 4.8-5.1 6.4-8s2.8-6.1 3.5-9.6c1.7-8.7.4-15.5-3.9-20.5M200 61.5c-.9 4.7-2.6 8.1-5.1 10s-6.6 2.9-12 2.9h-6.5l4.7-24.2h8.4c6.2 0 8.7 1.3 9.7 2.4c1.4 1.6 1.7 4.7.8 8.9"/>
        </svg>
      ),
    },
    {
      name: "Laravel",
      category: "Backend",
      color: "#FF2D20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 264" className="w-full h-full">
          <path fill="#FF2D20" d="M255.856 59.62c.095.351.144.713.144 1.077v56.568c0 1.478-.79 2.843-2.073 3.578L206.45 148.18v54.18a4.14 4.14 0 0 1-2.062 3.579l-99.108 57.053c-.227.128-.474.21-.722.299c-.093.03-.18.087-.278.113a4.15 4.15 0 0 1-2.114 0c-.114-.03-.217-.093-.325-.134c-.227-.083-.464-.155-.68-.278L2.073 205.938A4.13 4.13 0 0 1 0 202.36V32.656c0-.372.052-.733.144-1.083c.031-.119.103-.227.145-.346c.077-.216.15-.438.263-.639c.077-.134.19-.242.283-.366c.119-.165.227-.335.366-.48c.119-.118.274-.206.408-.309c.15-.124.283-.258.453-.356h.005L51.613.551a4.14 4.14 0 0 1 4.125 0l49.546 28.526h.01c.165.104.305.232.454.351c.134.103.284.196.402.31c.145.149.248.32.371.484c.088.124.207.232.279.366c.118.206.185.423.268.64c.041.118.113.226.144.35c.095.351.144.714.145 1.078V138.65l41.286-23.773V60.692c0-.36.052-.727.145-1.072c.036-.124.103-.232.144-.35c.083-.217.155-.44.268-.64c.077-.134.19-.242.279-.366c.123-.165.226-.335.37-.48c.12-.118.269-.206.403-.309c.155-.124.289-.258.454-.356h.005l49.551-28.526a4.13 4.13 0 0 1 4.125 0l49.546 28.526c.175.103.309.232.464.35c.128.104.278.197.397.31c.144.15.247.32.37.485c.094.124.207.232.28.366c.118.2.185.423.267.64c.047.118.114.226.145.35"/>
        </svg>
      ),
    },
    {
      name: "VS Code",
      category: "Tools",
      color: "#007ACC",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#29b6f6" d="M44,11.11v25.78c0,1.27-0.79,2.4-1.98,2.82l-8.82,4.14L34,33V15L33.2,4.15l8.82,4.14C43.21,8.71,44,9.84,44,11.11z"/>
          <path fill="#0277bd" d="M9,33.896L34,15V5.353c0-1.198-1.482-1.758-2.275-0.86L4.658,29.239c-0.9,0.83-0.849,2.267,0.107,3.032c0,0,1.324,1.232,1.803,1.574C7.304,34.37,8.271,34.43,9,33.896z"/>
          <path fill="#0288d1" d="M9,14.104L34,33v9.647c0,1.198-1.482,1.758-2.275,0.86L4.658,18.761c-0.9-0.83-0.849-2.267,0.107-3.032c0,0,1.324-1.232,1.803-1.574C7.304,13.63,8.271,13.57,9,14.104z"/>
        </svg>
      ),
    },
  ]

  return (
    <section
      id="skill"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <SkillsStyles />

      {/* ── Background orbs ── */}
      <div className="absolute -top-28 -left-28 w-[380px] h-[380px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-[360px] h-[360px] rounded-full bg-cyan-400/8 blur-3xl pointer-events-none" />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.035]"
        style={{ backgroundImage:"radial-gradient(circle,rgba(59,130,246,.8) 1px,transparent 1px)", backgroundSize:"36px 36px" }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section header ── */}
        <div className="text-center mb-14" data-aos="fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/40">
            🛠 Tech Stack
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Skills &{" "}
            <span className="relative inline-block">
              <span className="skills-grad-shift">Technologies</span>
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
        </div>

        {/* ── Skills grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className="group relative"
              data-aos="fade-up"
              data-aos-delay={index * 45}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div
                className={`skill-card relative overflow-hidden p-5 md:p-6 rounded-2xl border bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                  hoveredSkill === skill.name
                    ? "border-transparent shadow-xl scale-105"
                    : "border-gray-200/70 dark:border-gray-700/50"
                }`}
                style={
                  hoveredSkill === skill.name
                    ? {
                        backgroundColor: `${skill.color}10`,
                        borderColor: `${skill.color}45`,
                        boxShadow: `0 12px 32px ${skill.color}18`,
                      }
                    : {}
                }
              >
                {/* Top accent bar (appears on hover) */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${skill.color}, ${skill.color}80)`,
                    opacity: hoveredSkill === skill.name ? 1 : 0,
                  }}
                />

                {/* Radial glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at center, ${skill.color}14 0%, transparent 70%)` }}
                />

                {/* Icon */}
                <div className="relative w-10 h-10 md:w-14 md:h-14 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110">
                  {skill.icon}
                </div>

                {/* Name */}
                <h3 className="relative text-center text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                  {skill.name}
                </h3>

                {/* Category badge */}
                <div className="mt-2 flex justify-center">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all duration-300"
                    style={{
                      backgroundColor: hoveredSkill === skill.name ? `${skill.color}18` : undefined,
                      color: hoveredSkill === skill.name ? skill.color : undefined,
                    }}
                  >
                    <span className={hoveredSkill === skill.name ? "" : "text-gray-400 dark:text-gray-500"}>
                      {skill.category}
                    </span>
                  </span>
                </div>

                {/* Bottom accent line (CSS-driven) */}
                <div
                  className="accent-line absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-full"
                  style={{ backgroundColor: skill.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Floating stat badges (match Header StatBadge style) ── */}
        <div className="mt-14 flex flex-wrap justify-center gap-4" data-aos="fade-up">
          {[
            { v: "10+", l: "Skills Mastered", emoji: "🚀" },
            { v: "3",   l: "Skill Categories", emoji: "📚" },
            { v: "2+",  l: "Years Coding",     emoji: "💻" },
          ].map((s) => (
            <div
              key={s.l}
              className="skills-float flex items-center gap-3 px-6 py-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/60 dark:border-gray-700/50"
            >
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {s.v}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase">
                  {s.l}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills