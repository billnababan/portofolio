import { useEffect, useRef } from "react";

const NetworkAnimation = ({ cursorPosition }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let mouse = { x: null, y: null, radius: 400 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.radius = Math.random() * 4 + 3;
        this.vx = (Math.random() - 0.4) * 6;
        this.vy = (Math.random() - 0.4) * 6;
        this.opacity = 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // buuat ngatur pantulan dari samping
        if (this.x < 0 || this.x > canvas.width) {
          this.vx *= -5;
          this.x = this.x < 0 ? 0 : canvas.width;
        }
        // buuat ngatur pantulan dari atas ke bawah
        if (this.y < 0 || this.y > canvas.height) {
          this.vy *= -5;
          this.y = this.y < 0 ? 0 : canvas.height;
        }

        // Mouse interaction - Slowly repel particles
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - distance) / mouse.radius;
            const repelForce = force * 0.5;

            this.vx += (Math.cos(angle) * repelForce - this.vx) * 20;
            this.vy += (Math.sin(angle) * repelForce - this.vy) * 20;
          }
        }

        // Apply friction
        this.vx *= 0.99; // Gesekan lebih kecil untuk memperlambat laju penurunan kecepatan
        this.vy *= 0.99;

        // Revive slow particles
        const minSpeed = 1;
        if (Math.abs(this.vx) < minSpeed) {
          this.vx += (Math.random() - 0.5) * 2; // Tambahkan kecepatan acak
        }
        if (Math.abs(this.vy) < minSpeed) {
          this.vy += (Math.random() - 0.5) * 2; // Tambahkan kecepatan acak
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(128, 128, 128, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize particles
    const particles = Array(300)
      .fill()
      .map(() => new Particle());

    const spawnParticle = (x, y) => {
      particles.push(new Particle(x, y));
    };

    // Handle double-click to spawn new particles
    const handleDoubleClick = (event) => {
      for (let i = 0; i < 10; i++) {
        spawnParticle(event.clientX, event.clientY);
      }
    };

    window.addEventListener("dblclick", handleDoubleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        // Remove particles that go completely transparent
        if (particle.opacity <= 0) {
          particles.splice(i, 1);
        }
      });

      // Draw connections
      particles.forEach((particle, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const otherParticle = particles[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (1 - distance / 130) * 0.5;
            ctx.strokeStyle = `rgba(128, 128, 128, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("dblclick", handleDoubleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursorPosition]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

export default NetworkAnimation;
