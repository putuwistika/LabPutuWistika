import { motion } from 'framer-motion'

export default function PlaygroundPage() {
  return (
    <div className="p-4">
      <motion.h2
        className="text-2xl font-semibold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Playground
      </motion.h2>
      <p className="text-textSecondary">Experiment with animations here.</p>
    </div>
  )
}
