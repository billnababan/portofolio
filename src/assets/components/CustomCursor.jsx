import { useState, useEffect, useRef } from "react"

const CustomCursor = () => {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let dotX = 0
    let dotY = 0

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animateCursor = () => {
      // Smooth follow for outer ring
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15

      // Faster follow for inner dot
      dotX += (mouseX - dotX) * 0.35
      dotY += (mouseY - dotY) * 0.35

      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorX}px`
        cursorRef.current.style.top = `${cursorY}px`
      }

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${dotX}px`
        cursorDotRef.current.style.top = `${dotY}px`
      }

      requestAnimationFrame(animateCursor)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer")
      ) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseover", handleMouseOver)
    window.addEventListener("mouseout", handleMouseOut)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    const animationId = requestAnimationFrame(animateCursor)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseover", handleMouseOver)
      window.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      {/* Outer ring cursor */}
      <div
        ref={cursorRef}
        className={`fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${
          isHovering ? "scale-150" : "scale-100"
        } ${isClicking ? "scale-75" : ""}`}
        style={{ left: "-100px", top: "-100px" }}
      >
        <div
          className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
            isHovering ? "border-indigo-500 bg-indigo-500/10" : "border-gray-800 dark:border-white/80"
          }`}
        />
      </div>

      {/* Inner dot cursor */}
      <div
        ref={cursorDotRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ left: "-100px", top: "-100px" }}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHovering ? "w-2 h-2 bg-indigo-500" : "w-2 h-2 bg-gray-800 dark:bg-white"
          } ${isClicking ? "scale-150 bg-indigo-600" : ""}`}
        />
      </div>
    </>
  )
}

export default CustomCursor
