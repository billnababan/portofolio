import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperPlane, faEnvelope, faMapMarkerAlt, faPhone } from "@fortawesome/free-solid-svg-icons"
import { faLinkedin, faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons"
import Swal from "sweetalert2"
import { motion } from "framer-motion"
import axios from "axios"

const ContactStyles = () => (
  <style>{`
    @keyframes contactGradShift {
      0%{background-position:0% 50%}
      100%{background-position:200% 50%}
    }
    .contact-grad-shift {
      background: linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);
      background-size: 200%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: contactGradShift 5s linear infinite;
    }

    @keyframes contactGlowPulse { 0%,100%{opacity:.12;transform:scale(1)} 50%{opacity:.22;transform:scale(1.08)} }
    .contact-glow { animation: contactGlowPulse 3.5s ease-in-out infinite; will-change:transform,opacity; }

    .contact-input {
      width: 100%;
      padding: 0.875rem 1.125rem;
      border-radius: 0.875rem;
      border: 1.5px solid;
      outline: none;
      font-size: 0.9375rem;
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .contact-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,.15);
    }

    .contact-card-shimmer::after {
      content:'';
      position:absolute;inset:0;
      background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%);
      transform:translateX(-100%) skewX(-12deg);
      transition:transform .5s ease;
      pointer-events:none;
      border-radius: inherit;
    }
    .contact-card-shimmer:hover::after { transform:translateX(200%) skewX(-12deg); }

    @keyframes contactFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    .contact-float { animation: contactFloat 3.3s ease-in-out infinite; will-change:transform; }

    @keyframes arrowBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
    .arrow-bounce { animation: arrowBounce 1s ease-in-out infinite; display:inline-block; }
  `}</style>
)

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      Swal.fire({ icon:"error", title:"Invalid Email", text:"Please enter a valid email address", background:"#1f2937", color:"#fff", confirmButtonColor:"#3b82f6" })
      return
    }
    if (!name || !email || !message) {
      Swal.fire({ icon:"error", title:"Incomplete Form", text:"Please fill in all fields", background:"#1f2937", color:"#fff", confirmButtonColor:"#3b82f6" })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await axios.post("https://api.web3forms.com/submit", {
        access_key: "585659b1-8cdb-48dc-94e7-7ce98b392c96",
        name, email, message,
      })
      if (response.data.success) {
        Swal.fire({ icon:"success", title:"Message Sent!", text:"Thank you for reaching out. I'll get back to you soon!", background:"#1f2937", color:"#fff", confirmButtonColor:"#3b82f6" })
        setName(""); setEmail(""); setMessage("")
      } else {
        throw new Error(response.data.message || "Failed")
      }
    } catch {
      Swal.fire({ icon:"error", title:"Error!", text:"There was an error sending your message. Please try again.", background:"#1f2937", color:"#fff", confirmButtonColor:"#3b82f6" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: faEnvelope,      label: "Email",    value: "billnbbn@gmail.com",    href: "mailto:billnbbn@gmail.com" },
    { icon: faMapMarkerAlt,  label: "Location", value: "Batam, Indonesia",       href: null },
    { icon: faPhone,         label: "Phone",    value: "+62 895-3834-18428",     href: "tel:0895383418428" },
  ]

  const socialLinks = [
    { icon: faLinkedin,  href: "https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/", color:"hover:text-[#0077B5]",   bg:"hover:bg-[#0077B5]/10" },
    { icon: faGithub,    href: "https://github.com/billnababan",                                color:"hover:text-gray-900 dark:hover:text-white", bg:"hover:bg-gray-900/10 dark:hover:bg-white/10" },
    { icon: faInstagram, href: "https://www.instagram.com/bill_jeferson/",                      color:"hover:text-[#E4405F]",   bg:"hover:bg-[#E4405F]/10" },
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section
      id="contact"
      className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden"
    >
      <ContactStyles />

      {/* ── Background orbs ── */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-blue-400/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage:"radial-gradient(circle,rgba(59,130,246,.8) 1px,transparent 1px)", backgroundSize:"36px 36px" }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section header ── */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/40">
            ✉️ Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Let's{" "}
            <span className="relative inline-block">
              <span className="contact-grad-shift">Connect</span>
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Have a project in mind or just want to say hi? Feel free to reach out!
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* ══ LEFT – Contact info ══ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Info card */}
            <motion.div
              variants={itemVariants}
              className="contact-card-shimmer relative overflow-hidden p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>

              <div className="space-y-5">
                {contactInfo.map((info) => (
                  <motion.div
                    key={info.label}
                    variants={itemVariants}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                      <FontAwesomeIcon icon={info.icon} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest mb-0.5">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a href={info.href} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <p className="font-semibold text-gray-900 dark:text-white">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social links */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest mb-4">
                  Follow me on
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${social.color} ${social.bg} border border-gray-200/50 dark:border-gray-600/40 transition-all duration-200`}
                    >
                      <FontAwesomeIcon icon={social.icon} className="text-lg" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating stat badge */}
            <motion.div
              variants={itemVariants}
              className="contact-float flex items-center gap-4 p-5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/60 dark:border-gray-700/50"
            >
              <span className="text-3xl">📬</span>
              <div>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  24h
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase">
                  Avg. Response Time
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ══ RIGHT – Form ══ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={onSubmit}
              className="relative overflow-hidden p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="contact-input border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="contact-input border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Tell me about your project..."
                  className="contact-input border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-300 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span className="arrow-bounce">→</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}