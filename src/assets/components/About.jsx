import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

function About() {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <section id="about" className="dark:bg-gray-900 bg-gray-50 py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white" data-aos="fade-up">
            About Me
          </h2>
          <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 text-justify" data-aos="fade-up">
            Hello, I am Bill Jeferson Nababan, a passionate web developer with expertise in SQL, Frontend, and Backend development. I graduated from Batam State Polytechnic with a major in Informatics Engineering. I specialize in
            backend programming and have strong experience in frameworks like ExpressJS and ReactJS. My approach to development focuses on creating scalable and efficient solutions. I'm a proactive problem solver and thrive in
            collaborative environments. I am always eager to learn and grow, and I'm ready to take on challenges and deliver high-quality results.
          </p>
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="./images/CV_BillJeferson.pdf" // Updated path
            download="CV_BillJeferson.pdf"
            className="inline-block px-6 py-3 mt-6 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            data-aos="fade-up"
          >
            Download My CV
          </a>
        </div>

        {/* <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed" data-aos="fade-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> SQL
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> Frontend Development (HTML, CSS, JavaScript, ReactJS)
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> Backend Development (ExpressJS, NodeJS)
              </li>
            </ul>
          </div>
          <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed" data-aos="fade-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Technologies I Work With</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> ExpressJS
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> ReactJS
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> NodeJS
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="material-icons mr-2">check_circle</span> MongoDB
              </li>
            </ul>
          </div>
        </div> */}
      </div>
    </section>
  );
}

export default About;
