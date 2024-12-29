// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-50"
      style={{
        left: `-100px`,
        top: `-100px`,
        // transform: "translate(-50%, -50%)",
        transition: "left 0.1s ease, top 0.1s ease",
      }}
    >
      <div className="w-6 h-6 bg-black rounded-full"></div>
    </div>
  );
};

export default CustomCursor;
