import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Toolbar from '../components/Toolbar'
import SQLFlowViewer from '../components/SQLFlowViewer'
import DetailsPanel from '../components/DetailsPanel'

export default function PlaygroundPage() {
  const viewerRef = useRef(null)
  const { theme } = useTheme()

  const [selectedReport, setSelectedReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [mode, setMode] = useState('er')
  const [query, setQuery] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [showMinimap, setShowMinimap] = useState(true)

  const zoomIn = () => viewerRef.current?.zoomIn()
  const zoomOut = () => viewerRef.current?.zoomOut()
  const resetZoom = () => viewerRef.current?.resetView()

  useEffect(() => {
    const t = setTimeout(() => {
      viewerRef.current?.highlight(query)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

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

  const graph = data?.data?.graph ?? data?.graph ?? data
  const nodes = graph?.elements?.tables || []
  const edges = graph?.elements?.edges || []
  const nodesById = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  )

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        onReportChange={setSelectedReport}
        query={query}
        onQueryChange={setQuery}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((v) => !v)}
        mode={mode}
        onModeChange={setMode}
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
      <div className="flex-1 flex overflow-hidden">
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
            options={{ minimap: showMinimap }}
            onNodeClick={setSelectedNode}
          />
        )}
        <DetailsPanel
          node={selectedNode}
          edges={edges}
          nodesById={nodesById}
        />
      </div>
    </div>
  )
}
