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
  const inputClasses =
    'px-3 py-1 rounded-md border border-mediumGray bg-white focus:outline-none focus:ring-2 focus:ring-accentBlue'

  const containerClasses =
    'bg-softGray border-mediumGray text-textPrimary'

  const buttonClasses =
    'px-3 py-1 rounded-md border border-mediumGray bg-white hover:bg-softGray transition'

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
      </div>
    </div>
  )
}
