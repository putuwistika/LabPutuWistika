import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Toolbar from '../components/Toolbar'
import SQLFlowViewer from '../components/SQLFlowViewer'

export default function PlaygroundPage() {
  const viewerRef = useRef(null)
  const { theme } = useTheme()

  const [selectedReport, setSelectedReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [mode] = useState('er')

  const zoomIn = () => viewerRef.current?.zoomIn()
  const zoomOut = () => viewerRef.current?.zoomOut()
  const resetZoom = () => viewerRef.current?.resetView()
  const highlight = (q) => viewerRef.current?.highlight(q)

  const loadReport = () => {
    if (!selectedReport) return
    setLoading(true)
    setError(null)
    fetch(`/json/${selectedReport}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load report', err)
        setError('Failed to load report')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadReport()
  }, [selectedReport])

  const summary = data?.data?.summary
  const hasSummary =
    summary &&
    (summary.schema != null ||
      summary.process != null ||
      summary.database != null)

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        onReportChange={setSelectedReport}
        onSearch={highlight}
      />
      {!loading && !error && hasSummary && (
        <div className="px-4 py-2 text-sm flex space-x-4 border-b">
          {summary.schema != null && <span>Schemas: {summary.schema}</span>}
          {summary.process != null && <span>Processes: {summary.process}</span>}
          {summary.database != null && (
            <span>Databases: {summary.database}</span>
          )}
        </div>
      )}
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-200" />
        ) : error ? (
          <div className="p-4 text-red-600">
            {error}{' '}
            <button className="underline" onClick={loadReport}>
              Retry
            </button>
          </div>
        ) : (
          <SQLFlowViewer
            ref={viewerRef}
            data={data}
            mode={mode}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
