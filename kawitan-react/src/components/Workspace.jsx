import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function Workspace({ zoom }) {
  const { theme } = useTheme()
  const classes =
    theme === 'light'
      ? 'bg-white text-textPrimary'
      : 'bg-primaryDark text-softGray'

  return (
    <div className={`flex-1 flex items-center justify-center ${classes}`}>
      <motion.div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `scale(${zoom / 100})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-textSecondary">Workspace Area</p>
      </motion.div>
    </div>
  )
}
