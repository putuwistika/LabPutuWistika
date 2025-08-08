import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import WelcomePage from './pages/WelcomePage'
import PlaygroundPage from './pages/PlaygroundPage'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/vis-playground" element={<PlaygroundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  )
}
