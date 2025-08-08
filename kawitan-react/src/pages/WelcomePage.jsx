import { Link } from 'react-router-dom'

export default function WelcomePage() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20">
      <img src="/logo.png" alt="Kawitan logo" className="w-32 h-32 mb-6" />
      <h2 className="text-3xl font-bold mb-6">
        KAWITAN – Every Data Has a Story
      </h2>
      <Link
        to="/vis-playground"
        className="px-6 py-2 rounded bg-accentBlue text-white hover:bg-accentBlueHover"
      >
        Start Exploring
      </Link>
    </section>
  )
}
