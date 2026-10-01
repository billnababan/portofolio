import { useEffect } from "react";
import { setupReveal } from "./reveal.js";
import Navbar from "./assets/components/Navbar";
import Hero from "./assets/components/Hero";
import Projects from "./assets/components/Projects";
import Skills from "./assets/components/Skills";
import About from "./assets/components/About";
import Certifications from "./assets/components/Certifications";
import Contact from "./assets/components/Contact";
import Footer from "./assets/components/Footer";

// Order: reviewers look at projects first.
export default function App() {
  // After hydration, so classes added to the DOM never race React.
  useEffect(setupReveal, []);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Projects />
        <Skills />
        <About />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
