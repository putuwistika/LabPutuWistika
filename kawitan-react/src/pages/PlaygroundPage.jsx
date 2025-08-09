import { useEffect, useMemo, useRef, useState } from 'react'
import SQLFlowViewer from '../components/SQLFlowViewer'
import DetailsPanel from '../components/DetailsPanel'

function buildTransformLookup(json) {
  const lookup = { edges: {}, columns: {} }
  const tables =
    json?.data?.graph?.elements?.tables || json?.graph?.elements?.tables || []
  tables.forEach((t) => {
    const cols = t.columns || []
    cols.forEach((c) => {
      const tx = c.transform
      if (tx) {
        lookup.columns[c.id] = {
          id: c.id,
          tableId: t.id,
          targetColumn:
            (c.label && typeof c.label === 'object' ? c.label.content : c.label) ||
            c.id,
          expression:
            (typeof tx === 'string' ? tx : tx.code || tx.expression || '') || '',
          sources:
            (c.sources || []).map((s) =>
              [s.parentName || s.table, s.column].filter(Boolean).join('.'),
            ),
        }
      }
    })
  })

  const edges =
    json?.data?.graph?.elements?.edges || json?.graph?.elements?.edges || []
  edges.forEach((e) => {
    const tx = e.meta?.transform || e.transform
    if (tx) {
      lookup.edges[e.id] = {
        id: e.id,
        expression:
          (typeof tx === 'string' ? tx : tx.code || tx.expression || '') || '',
      }
    }
  })

  const top =
    json?.data?.sqlflow?.transforms ||
    json?.data?.graph?.transforms ||
    json?.data?.transforms ||
    json?.transforms
  if (Array.isArray(top)) {
    top.forEach((t) => {
      if (!t) return
      if (t.edgeId) {
        lookup.edges[t.edgeId] = {
          id: t.edgeId,
          expression: t.expression || t.code || '',
        }
      } else if (t.targetColumnId) {
        lookup.columns[t.targetColumnId] = {
          id: t.targetColumnId,
          tableId: t.targetTableId,
          targetColumn: t.targetColumn,
          expression: t.expression || t.code || '',
          sources: t.sources || [],
        }
      }
    })
  }

  return lookup
}

export default function PlaygroundPage() {
  const viewerRef = useRef(null)

  const [reportInput, setReportInput] = useState('')
  const [selectedReport, setSelectedReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [transformLookup, setTransformLookup] = useState({ edges: {}, columns: {} })

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
        setTransformLookup(buildTransformLookup(json))
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

  useEffect(() => {
    const t = setTimeout(() => {
      viewerRef.current?.highlight(reportInput)
    }, 300)
    return () => clearTimeout(t)
  }, [reportInput])

  const graph = data?.data?.graph ?? data?.graph ?? data
  const nodes = graph?.elements?.tables || []
  const edges = graph?.elements?.edges || []
  const nodesById = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  )

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/70 backdrop-blur border-b">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">KAWITAN</span>
            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">v1.0</span>
          </div>
          <span className="text-xs text-gray-500">Every Data Has a Story</span>
        </div>
        <div className="flex-1 flex justify-center px-4">
          <input
            type="text"
            placeholder="Search data sources…"
            value={reportInput}
            onChange={(e) => setReportInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSelectedReport(reportInput)
            }}
            className="w-full max-w-md px-4 py-1.5 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-full border hover:bg-gray-100">Scan</button>
          <button
            className="px-3 py-1.5 rounded-full border hover:bg-gray-100"
            onClick={loadReport}
          >
            Refresh
          </button>
          <button
            className="px-3 py-1.5 rounded-full border hover:bg-gray-100"
            onClick={() => viewerRef.current?.resetView()}
          >
            Expand
          </button>
        </div>
      </div>

      {/* Active Data Source Chip */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-white/80 backdrop-blur shadow">
          <span role="img" aria-label="database">🗄️</span>
          <span className="text-sm">
            Active Data Source: {selectedReport || 'No source selected'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto gradient-apple p-4">
        <div className="w-full h-full rounded-2xl shadow-lg bg-white flex overflow-hidden">
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
              mode="er"
              options={{ minimap: true }}
              onNodeClick={setSelectedNode}
              transformLookup={transformLookup}
            />
          )}
          <DetailsPanel
            node={selectedNode}
            edges={edges}
            nodesById={nodesById}
          />
        </div>
      </div>
    </div>
  )
}
