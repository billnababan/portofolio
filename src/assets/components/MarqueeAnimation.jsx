"use client"

/* eslint-disable react/prop-types */
import Marquee from "react-fast-marquee"
import Aos from "aos"
import "aos/dist/aos.css"
import { useEffect } from "react"

function MarqueeAnimation({ imgList }) {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    })
  }, [])

  return (
    <div className="relative py-8 overflow-hidden" data-aos="fade-up">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-white dark:from-hitam to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-white dark:from-hitam to-transparent z-10 pointer-events-none" />

      <Marquee speed={40} gradient={false} pauseOnHover={true} className="py-4">
        {imgList.map((item, index) => (
          <div key={index} className="mx-6 md:mx-12 flex items-center justify-center group">
            <div className="p-4 md:p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/50">
              <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 [&>svg]:w-full [&>svg]:h-full">
                {item.img}
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  )
}

export default MarqueeAnimation
