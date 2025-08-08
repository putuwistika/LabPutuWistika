import { useTheme } from '../context/ThemeContext'
import ReportSelector from './ReportSelector'

export default function Toolbar({ zoomIn, zoomOut, resetZoom, onReportChange }) {
  const { theme, toggleTheme } = useTheme()
  const inputClasses =
    theme === 'light'
      ? 'px-3 py-1 rounded-md border border-mediumGray bg-white focus:outline-none focus:ring-2 focus:ring-accentBlue'
      : 'px-3 py-1 rounded-md border border-softGray bg-primaryDark text-softGray focus:outline-none focus:ring-2 focus:ring-accentBlue'

  const containerClasses =
    theme === 'light'
      ? 'bg-softGray border-mediumGray text-textPrimary'
      : 'bg-primaryDark border-softGray text-softGray'

  const buttonClasses =
    theme === 'light'
      ? 'px-3 py-1 rounded-md border border-mediumGray bg-white hover:bg-softGray transition'
      : 'px-3 py-1 rounded-md border border-softGray bg-primaryDark hover:bg-textPrimary hover:text-primaryDark transition'

  return (
    <div className={`h-16 flex items-center justify-between px-4 border-b ${containerClasses}`}>
      <div className="flex items-center space-x-2">
        <ReportSelector className={inputClasses} onChange={onReportChange} />
        <input type="text" placeholder="Search" className={inputClasses} />
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={zoomOut} className={buttonClasses}>
          -
        </button>
        <button onClick={zoomIn} className={buttonClasses}>
          +
        </button>
        <button onClick={resetZoom} className={buttonClasses}>
          Reset
        </button>
        <button onClick={toggleTheme} className={buttonClasses}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  )
}
