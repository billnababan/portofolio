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
import { skillsSection, marqueeList, imgList } from "./assets/data/SkillsSection";
import MarqueeAnimation from "./assets/components/MarqueeAnimation";
import parse from "html-react-parser";
import Certifications from "./assets/components/Certifications";
import "./assets/styles/custom-scrollbar.css";

const App = () => {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <div className="cursor-none">
      <CustomCursor />
      <Navbar />
      <Header />
      <About />
      <section id="skill" className="dark:bg-hitam md:py-10">
        <div className="mx-10 md:mx-20 md:py-10" data-aos="fade-up">
          {parse(skillsSection.content)}
        </div>
        <MarqueeAnimation imgList={imgList} />
      </section>
      {/* <Skills /> */}
      <Projects />
      <Certifications />
      <Footer />
    </div>
  );
};

export default App;
