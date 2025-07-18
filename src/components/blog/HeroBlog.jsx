import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HeroBlog() {
  const quotes = ['Python', 'Teoria', 'Excel', 'Access']
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section>
      <div className="text-left">
        <div className="mb-4 inline-flex items-center px-4 py-1 rounded-full bg-violet-100 text-primaryBlue font-medium text-sm">
          <span className="w-2 h-2 rounded-full bg-primaryBlue mr-2"></span>
          Innovative Digital Solutions
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
          Transforming Ideas Into <br />
          <span className="inline-block mt-4 bg-gradient-to-br from-secondaryBlue  to-primaryGreen text-white px-6 py-3 rounded-xl shadow-lg text-3xl md:text-6xl">
            <AnimatePresence mode="wait">
              <motion.span
                key={quotes[index]}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
                className="inline-block"
              >
                {quotes[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <p className="mt-8 text-lg text-gray-600 max-w-xl">
          We turn your ideas into powerful digital experiences with cutting-edge technologies.
          Our solutions elevate your brand, drive growth, and leave a lasting impression.
        </p>
      </div>
      
    </section>
  )
}
