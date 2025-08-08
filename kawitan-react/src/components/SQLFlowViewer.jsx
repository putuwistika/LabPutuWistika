import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  init,
  renderER,
  renderLineage,
  zoomIn as libZoomIn,
  zoomOut as libZoomOut,
  resetView as libResetView,
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
    },
    ref,
  ) => {
    const containerRef = useRef(null)

    // initialise on mount and when theme/options or callbacks change
    useEffect(() => {
      if (!containerRef.current) return
      init(containerRef.current, {
        theme,
        minimap: options.minimap !== false,
        zoomControls: options.zoomControls !== false,
        onNodeClick,
        onEdgeClick,
      })
    }, [theme, options.minimap, options.zoomControls, onNodeClick, onEdgeClick])

    // re-render when data or mode changes
    useEffect(() => {
      if (!data) return
      if (mode === 'lineage') {
        const lineage = data?.data?.sqlflow ?? data.sqlflow ?? data
        renderLineage(lineage)
      } else {
        const graph = data?.data?.graph ?? data.graph ?? data
        renderER(graph)
      }
    }, [data, mode])

    // expose imperative handlers
    useImperativeHandle(ref, () => ({
      zoomIn: () => libZoomIn(),
      zoomOut: () => libZoomOut(),
      resetView: () => libResetView(),
      highlight: (query) => {
        if (!containerRef.current) return
        const q = (query || '').trim().toLowerCase()
        const nodes = Array.from(
          containerRef.current.querySelectorAll('.table')
        )
        const edges = Array.from(
          containerRef.current.querySelectorAll('.edge')
        )

        if (!q) {
          nodes.forEach((n) => (n.style.opacity = '1'))
          edges.forEach((e) => (e.style.opacity = '1'))
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
      },
    }))

    return <div ref={containerRef} className="w-full h-full" />
  },
)

export default SQLFlowViewer
