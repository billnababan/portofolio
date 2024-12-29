import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareGithub } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
import { faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect, useState, useCallback } from "react";
import { useMediaQuery } from "react-responsive"; // Import react-responsive
import NetworkAnimation from "./NetworkAnimation";
import CustomCursor from "./CustomCursor";
import { TypeAnimation } from "react-type-animation";

const Header = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: null, y: null });

  const handleCursorMove = useCallback((position) => {
    setCursorPosition(position);
  }, []);

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    });
  }, []);

  // Cek ukuran layar besar (tablet atau lebih besar)
  const isLargeScreen = useMediaQuery({ query: "(min-width: 768px)" });

  return (
    <header className="relative bg-background dark:bg-hitam py-20 md:py-44 overflow-hidden flex flex-col items-center justify-center">
      {/* Tampilkan animasi hanya jika ukuran layar besar */}
      {isLargeScreen && <NetworkAnimation cursorPosition={cursorPosition} />}
      <CustomCursor onPositionChange={handleCursorMove} />
      <div className="md:flex flex-col md:flex-row items-center justify-center relative z-10">
        <div className="mx-10 text-center md:text-left md:mx-10 lg:mx-28 mt-10 md:mr-auto">
          <p className="text-xl text-hitam sm:text-4xl md:text-2xl lg:text-4xl dark:text-background font-space" data-aos="fade-right">
            Hi, I`m{" "}
            <span className="text-xl font-semibold md:text-2xl sm:text-4xl lg:text-4xl dark:text-background" data-aos="fade-right">
              Bill Jeferson Nababan
            </span>
          </p>
          <p className="text-xl mt-3 sm:text-4xl text-kuning font-semibold md:text-2xl lg:text-4xl" data-aos="fade-right">
            <TypeAnimation sequence={["Frontend Developer", 1, "Backend Developer", 1, "SQL Developer", 1]} wrapper="span" speed={20} repeat={Infinity} className="text-kuning" />
          </p>
          <p className="text-xl sm:text-4xl text-hitam mt-3 font-semibold md:text-2xl dark:text-background" data-aos="fade-right">
            Let`s Connect!
          </p>
          <div className="mt-5 sm:mt-16 md:mt-20 space-x-3 md:space-x-5" data-aos="fade-up">
            <a href="https://www.linkedin.com/in/bill-jeferson-nababan-4878a9244/" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLinkedin} className="text-[#0077B5] text-2xl sm:text-4xl md:text-5xl hover:brightness-125 transition-colors duration-300" />
            </a>
            <a href="https://github.com/billnababan" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faSquareGithub} className="text-[#181717] text-2xl sm:text-4xl md:text-5xl hover:brightness-125 transition-colors duration-300" />
            </a>
            <a href="https://www.instagram.com/bill_jeferson/" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagramSquare} className="text-[#E4405F] text-2xl sm:text-4xl md:text-5xl hover:brightness-125 transition-colors duration-300" />
            </a>
          </div>
        </div>

        <div className="mx-10 md:mr-10 lg:mr-36 sm:mx-auto md:w-96 lg:w-96 mt-10 md:mt-0" data-aos="fade-left">
          <img
            src="/portofolio-react-tailwindcss/images/FotoProfil.jpeg"
            alt="Profile"
            className="relative z-10 rounded-full border-4 border-black transition-transform duration-300 hover:scale-110 hover:rounded-full hover:border-kuning"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
