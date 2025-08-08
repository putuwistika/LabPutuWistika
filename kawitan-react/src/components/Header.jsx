import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-primaryDark text-softGray">
      <h1 className="text-xl font-bold">Kawitan</h1>
      <nav className="space-x-4">
        <Link to="/welcome" className="hover:text-accentBlue">
          Home
        </Link>
        <Link to="/vis-playground" className="hover:text-accentBlue">
          Playground
        </Link>
      </nav>
    </header>
  )
}
