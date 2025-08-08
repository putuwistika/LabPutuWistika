import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-full bg-softGray p-4 space-y-2"
    >
      <nav className="flex flex-col space-y-2">
        <Link to="/" className="hover:text-accentBlue">
          Home
        </Link>
        <Link to="/play" className="hover:text-accentBlue">
          Playground
        </Link>
      </nav>
    </motion.aside>
  )
}
