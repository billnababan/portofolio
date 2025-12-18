"use client"

import { useEffect, useRef } from "react"

const NetworkAnimation = ({ cursorPosition }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId
    const mouse = { x: null, y: null, radius: 350 }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width
        this.y = y || Math.random() * canvas.height
        this.radius = Math.random() * 3 + 2
        this.vx = (Math.random() - 0.5) * 1.5
        this.vy = (Math.random() - 0.5) * 1.5
        this.opacity = Math.random() * 0.5 + 0.3
        // Random color from palette
        const colors = [
          { r: 99, g: 102, b: 241 }, // Indigo
          { r: 139, g: 92, b: 246 }, // Violet
          { r: 59, g: 130, b: 246 }, // Blue
          { r: 14, g: 165, b: 233 }, // Sky
        ]
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update(time) {
        this.x += this.vx
        this.y += this.vy

        // Pulse effect
        this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.15

        // Bounce off edges with smooth transition
        if (this.x < 0 || this.x > canvas.width) {
          this.vx *= -1
          this.x = Math.max(0, Math.min(canvas.width, this.x))
        }
        if (this.y < 0 || this.y > canvas.height) {
          this.vy *= -1
          this.y = Math.max(0, Math.min(canvas.height, this.y))
        }

        // Mouse interaction - smooth repel
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx)
            const force = (mouse.radius - distance) / mouse.radius
            const repelForce = force * 0.3

            this.vx -= Math.cos(angle) * repelForce
            this.vy -= Math.sin(angle) * repelForce
          }
        }

        // Apply friction
        this.vx *= 0.995
        this.vy *= 0.995

        // Maintain minimum speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed < 0.3) {
          this.vx += (Math.random() - 0.5) * 0.5
          this.vy += (Math.random() - 0.5) * 0.5
        }
      }

      draw(time) {
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3)
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`)
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity + 0.3})`
        ctx.fill()
      }
    }

    const particles = Array(150)
      .fill()
      .map(() => new Particle())

    const handleMouseMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    const handleDoubleClick = (event) => {
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(event.clientX, event.clientY))
      }
      // Remove excess particles
      while (particles.length > 200) {
        particles.shift()
      }
    }

    window.addEventListener("dblclick", handleDoubleClick)

    let time = 0
    const animate = () => {
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections first (behind particles)
      particles.forEach((particle, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const otherParticle = particles[j]
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.3
            // Gradient line between two particles
            const gradient = ctx.createLinearGradient(particle.x, particle.y, otherParticle.x, otherParticle.y)
            gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${opacity})`)
            gradient.addColorStop(
              1,
              `rgba(${otherParticle.color.r}, ${otherParticle.color.g}, ${otherParticle.color.b}, ${opacity})`,
            )

            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      })

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update(time)
        particle.draw(time)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("dblclick", handleDoubleClick)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [cursorPosition])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60"
      style={{ zIndex: 0 }}
    />
  )
}

export default NetworkAnimation
