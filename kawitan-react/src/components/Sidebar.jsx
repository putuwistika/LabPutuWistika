import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar() {
  const { theme } = useTheme()

  const containerClasses =
    theme === 'light'
      ? 'bg-softGray border-mediumGray text-textPrimary'
      : 'bg-primaryDark border-softGray text-softGray'

  return (
    <div className="w-64 flex-shrink-0">
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-screen w-64 border-r p-6 flex flex-col space-y-6 ${containerClasses}`}
      >
        <nav className="flex flex-col space-y-4">
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
