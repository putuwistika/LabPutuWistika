import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div className="w-64 flex-shrink-0">
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-screen w-64 bg-softGray border-r border-mediumGray p-6 flex flex-col space-y-6"
      >
        <nav className="flex flex-col space-y-4 text-textPrimary">
          <Link to="/welcome" className="hover:text-accentBlue">
            Home
          </Link>
          <Link to="/reports" className="hover:text-accentBlue">
            Reports
          </Link>
          <Link to="/settings" className="hover:text-accentBlue">
            Settings
          </Link>
        </nav>
      </motion.aside>
    </div>
  )
}
