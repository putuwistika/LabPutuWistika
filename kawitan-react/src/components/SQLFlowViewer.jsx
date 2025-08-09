import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  init,
  renderER,
  renderLineage,
  zoomIn as libZoomIn,
  zoomOut as libZoomOut,
  resetView as libResetView,
  setTransformLookup,
  getTransformLookup,
} from '../lib/sqlflow'

/**
 * React wrapper around the SQLFlow ESM engine.
 * @param {Object} props
 * @param {any} props.data - SQLFlow compatible JSON graph
 * @param {'er'|'lineage'} [props.mode='er']
 * @param {'light'|'dark'} [props.theme='light']
 * @param {{minimap?:boolean,zoomControls?:boolean}} [props.options]
 * @param {(node:any)=>void} [props.onNodeClick]
 * @param {(edge:any)=>void} [props.onEdgeClick]
 */
const SQLFlowViewer = forwardRef(
  (
    {
      data,
      mode = 'er',
      theme = 'light',
      options = {},
      onNodeClick,
      onEdgeClick,
      transformLookup,
    },
    ref,
  ) => {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [bar, setBar] = useState(null)
    const [panelTable, setPanelTable] = useState(null)

    // initialise on mount and when theme/options or callbacks change
    useEffect(() => {
      if (!canvasRef.current) return
      init(canvasRef.current, {
        theme,
        minimap: options.minimap !== false,
        zoomControls: options.zoomControls !== false,
        onNodeClick,
        onEdgeClick,
        onTransformToggle: (id) => setPanelTable(id),
      })
    }, [theme, options.minimap, options.zoomControls, onNodeClick, onEdgeClick])

    // re-render when data, mode or options change
    useEffect(() => {
      if (!data) return
      if (mode === 'lineage') {
        const lineage = data?.data?.sqlflow ?? data.sqlflow ?? data
        renderLineage(lineage)
      } else {
        const graph = data?.data?.graph ?? data.graph ?? data
        renderER(graph)
      }
    }, [data, mode, options.minimap, options.zoomControls])

    // set transform lookup
    useEffect(() => {
      setTransformLookup(transformLookup || { edges: {}, columns: {} })
    }, [transformLookup])

    // attach hover listeners for edges and columns
    useEffect(() => {
      if (!canvasRef.current) return
      const root = canvasRef.current

      const handleEdgeEnter = (e) => {
        const id = e.currentTarget.getAttribute('data-edge-id')
        showTransformFor(id)
      }
      const handleColEnter = (e) => {
        const id = e.currentTarget.getAttribute('data-column-id')
        showTransformFor(id)
      }
      const hide = () => setBar(null)

      const edges = Array.from(root.querySelectorAll('.edge'))
      const cols = Array.from(root.querySelectorAll('[data-column-id]'))

      edges.forEach((el) => {
        el.addEventListener('mouseenter', handleEdgeEnter)
        el.addEventListener('mouseleave', hide)
      })
      cols.forEach((el) => {
        el.addEventListener('mouseenter', handleColEnter)
        el.addEventListener('mouseleave', hide)
      })

      return () => {
        edges.forEach((el) => {
          el.removeEventListener('mouseenter', handleEdgeEnter)
          el.removeEventListener('mouseleave', hide)
        })
        cols.forEach((el) => {
          el.removeEventListener('mouseenter', handleColEnter)
          el.removeEventListener('mouseleave', hide)
        })
      }
    }, [data, mode, transformLookup])

    const showTransformFor = (id) => {
      if (!id) return
      const lookup = getTransformLookup()
      const info = lookup.columns[id] || lookup.edges[id]
      if (info) setBar({ id, ...info })
    }

    const copyExpression = () => {
      if (bar?.expression) navigator.clipboard?.writeText(bar.expression)
    }

    // expose imperative handlers
    useImperativeHandle(ref, () => ({
      zoomIn: () => libZoomIn(),
      zoomOut: () => libZoomOut(),
      resetView: () => libResetView(),
      showTransformFor,
      highlight: (query) => {
        if (!canvasRef.current) return
        const q = (query || '').trim().toLowerCase()
        const nodes = Array.from(canvasRef.current.querySelectorAll('.table'))
        const edges = Array.from(canvasRef.current.querySelectorAll('.edge'))

        if (!q) {
          nodes.forEach((n) => (n.style.opacity = '1'))
          edges.forEach((e) => (e.style.opacity = '1'))
          setBar(null)
          return
        }

        /** @type {{x:number,y:number,width:number,height:number}[]} */
        const boxes = []
        nodes.forEach((el) => {
          const label =
            el.querySelector('text')?.textContent?.toLowerCase() || ''
          const match = label.includes(q)
          el.style.opacity = match ? '1' : '0.2'
          if (match) {
            const transform = el.getAttribute('transform') || ''
            const m = transform.match(/translate\(([-\d.]+),([-\d.]+)\)/)
            const x = m ? parseFloat(m[1]) : 0
            const y = m ? parseFloat(m[2]) : 0
            const rect = el.querySelector('rect')
            const width = rect ? parseFloat(rect.getAttribute('width') || '0') : 0
            const height = rect ? parseFloat(rect.getAttribute('height') || '0') : 0
            boxes.push({ x, y, width, height })
          }
        })

        edges.forEach((el) => {
          const path = el.querySelector('path')
          let connected = false
          if (path) {
            const d = path.getAttribute('d') || ''
            const m = d.match(
              /M([-\d.]+),([-\d.]+) Q([-\d.]+),([-\d.]+) ([-\d.]+),([-\d.]+)/,
            )
            if (m) {
              const sx = parseFloat(m[1])
              const sy = parseFloat(m[2])
              const ex = parseFloat(m[5])
              const ey = parseFloat(m[6])
              connected = boxes.some(
                (b) =>
                  pointInBox(sx, sy, b) || pointInBox(ex, ey, b),
              )
            }
          }
          el.style.opacity = connected ? '1' : '0.1'
        })

        function pointInBox(x, y, b) {
          return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
        }
        // show transform if column name matches
        const lookup = getTransformLookup()
        const match = Object.entries(lookup.columns).find(([, v]) =>
          v.targetColumn?.toLowerCase().includes(q),
        )
        if (match) showTransformFor(match[0])
      },
    }))

    const lookup = getTransformLookup()
    const panelCols = panelTable
      ? Object.values(lookup.columns).filter((c) => c.tableId === panelTable)
      : []

    return (
      <div ref={containerRef} className="w-full h-full relative">
        <div ref={canvasRef} className="w-full h-full" />
        {bar && (
          <div className="transform-bar show flex items-center gap-2 text-sm">
            <span className="font-semibold">{bar.targetColumn || bar.target}</span>
            <code className="flex-1 whitespace-pre overflow-x-auto text-xs">
              {bar.expression}
            </code>
            <button
              className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300"
              onClick={copyExpression}
            >
              📋
            </button>
          </div>
        )}
        {panelTable && (
          <div className="transform-panel show">
            <button
              className="absolute top-2 right-2 text-sm"
              onClick={() => setPanelTable(null)}
            >
              ✕
            </button>
            <h3 className="font-semibold mb-2">Transforms</h3>
            {panelCols.length === 0 && (
              <div className="text-sm text-gray-500">No transform metadata</div>
            )}
            {panelCols.map((c) => (
              <div key={c.id} className="mb-4">
                <div className="font-medium">{c.targetColumn}</div>
                <code className="block text-xs whitespace-pre overflow-x-auto bg-gray-100 rounded p-1">
                  {c.expression}
                </code>
                {c.sources?.length ? (
                  <div className="text-xs mt-1 text-gray-500">
                    Sources: {c.sources.join(', ')}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
)

export default SQLFlowViewer
