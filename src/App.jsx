import { useEffect } from "react";
import { setupReveal } from "./reveal.js";
import { setupTracking } from "./track.js";
import Navbar from "./assets/components/Navbar";
import Hero from "./assets/components/Hero";
import Marquee from "./assets/components/Marquee";
import Story from "./assets/components/Story";
import CaseStudies from "./assets/components/CaseStudies";
import MoreWork from "./assets/components/MoreWork";
import Skills from "./assets/components/Skills";
import Certifications from "./assets/components/Certifications";
import Contact from "./assets/components/Contact";
import Footer from "./assets/components/Footer";

// Read top to bottom as one story: who he is, how he got here, two projects told
// in full, the rest of the work, the skills in the order a request travels, proof,
// and an invitation that follows from the stories.
export default function App() {
  // After hydration, so classes added to the DOM never race React.
  useEffect(setupReveal, []);
  useEffect(setupTracking, []);

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Marquee />
        <Story />
        <CaseStudies />
        <MoreWork />
        <Skills />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
