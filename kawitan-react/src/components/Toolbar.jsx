import { useTheme } from '../context/ThemeContext'
import ReportSelector from './ReportSelector'

export default function Toolbar({
  zoomIn,
  zoomOut,
  resetZoom,
  onReportChange,
  query,
  onQueryChange,
  showMinimap,
  onToggleMinimap,
  mode = 'er',
  onModeChange,
}) {
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

  const activeButton = `${buttonClasses} bg-accentBlue text-white`

  return (
    <div className={`h-16 flex items-center justify-between px-4 border-b ${containerClasses}`}>
      <div className="flex items-center space-x-2">
        <ReportSelector className={inputClasses} onChange={onReportChange} />
        <input
          type="text"
          placeholder="Search"
          className={inputClasses}
          value={query}
          onChange={(e) => onQueryChange && onQueryChange(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <span>Mode:</span>
        <button
          onClick={() => onModeChange && onModeChange('er')}
          className={mode === 'er' ? activeButton : buttonClasses}
        >
          ER
        </button>
        <button
          onClick={() => onModeChange && onModeChange('lineage')}
          className={mode === 'lineage' ? activeButton : buttonClasses}
        >
          Lineage
        </button>
        <button onClick={zoomOut} className={buttonClasses}>
          -
        </button>
        <button onClick={zoomIn} className={buttonClasses}>
          +
        </button>
        <button onClick={resetZoom} className={buttonClasses}>
          Reset
        </button>
        <button onClick={onToggleMinimap} className={buttonClasses}>
          {showMinimap ? 'Hide map' : 'Show map'}
        </button>
        <button onClick={toggleTheme} className={buttonClasses}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  )
}
