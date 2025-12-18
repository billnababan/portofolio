/* eslint-disable no-unused-vars */
import Navbar from "./assets/components/Navbar";
import Header from "./assets/components/Header";
import About from "./assets/components/About";
import CustomCursor from "./assets/components/CustomCursor";
// import Skills from "./assets/components/Skills";
import Projects from "./assets/components/Projects";
import Footer from "./assets/components/Footer";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Skills from "./assets/components/Skills";
import { skillsSection, marqueeList, imgList } from "./assets/data/SkillsSection";
import MarqueeAnimation from "./assets/components/MarqueeAnimation";
import parse from "html-react-parser";
import Certifications from "./assets/components/Certifications";
import "./assets/styles/custom-scrollbar.css";

const App = () => {
  useEffect(() => {
    Aos.init({
      duration: 800,
      once: false,
      easing: "ease-out-cubic",
    })
  }, [])

  return (
    <div className="cursor-none scroll-smooth">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <Header />

        {/* About Section */}
        <About />

        {/* Skills Section */}
        <Skills />

        {/* Projects Section */}
        <Projects />

        {/* Certifications Section */}
        <Certifications />

        {/* Footer with Contact */}
        <Footer />
      </main>
    </div>
  )
}


export default App;
