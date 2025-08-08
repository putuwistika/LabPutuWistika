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
        const q = (query || '').toLowerCase()
        if (!containerRef.current) return
        const tables = containerRef.current.querySelectorAll('.table')
        tables.forEach((el) => {
          const text = el.textContent?.toLowerCase() || ''
          el.style.opacity = q && !text.includes(q) ? '0.2' : '1'
        })
        const edges = containerRef.current.querySelectorAll('.edge')
        edges.forEach((el) => {
          const text = el.textContent?.toLowerCase() || ''
          el.style.opacity = q && !text.includes(q) ? '0.1' : '1'
        })
      },
    }))

    return <div ref={containerRef} className="w-full h-full" />
  },
)

export default SQLFlowViewer
