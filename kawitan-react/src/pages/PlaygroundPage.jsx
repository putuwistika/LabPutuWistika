import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PlaygroundPage() {
  const [zoom, setZoom] = useState(100)
  const [dark, setDark] = useState(false)

  const zoomIn = () => setZoom((z) => z + 10)
  const zoomOut = () => setZoom((z) => Math.max(10, z - 10))
  const resetZoom = () => setZoom(100)
  const toggleTheme = () => setDark((d) => !d)

  const inputClasses =
    'px-3 py-1 rounded-md border border-mediumGray bg-white focus:outline-none focus:ring-2 focus:ring-accentBlue'

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 bg-softGray border-b border-mediumGray">
        <input type="text" placeholder="Search" className={inputClasses} />
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 rounded-md border border-mediumGray bg-white hover:bg-softGray transition"
          >
            -
          </button>
          <button
            onClick={zoomIn}
            className="px-3 py-1 rounded-md border border-mediumGray bg-white hover:bg-softGray transition"
          >
            +
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 rounded-md border border-mediumGray bg-white hover:bg-softGray transition"
          >
            Reset
          </button>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-md border border-mediumGray bg-white hover:bg-softGray transition"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      <div
        className={`flex-1 flex items-center justify-center ${
          dark ? 'bg-primaryDark text-softGray' : 'bg-white text-textPrimary'
        }`}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center"
          style={{ transform: `scale(${zoom / 100})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-textSecondary">Workspace Area</p>
        </motion.div>
      </div>
    </div>
  )
}
