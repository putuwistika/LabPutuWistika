import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Toolbar from '../components/Toolbar'
import SQLFlowViewer from '../components/SQLFlowViewer'

export default function PlaygroundPage() {
  const viewerRef = useRef(null)
  const { theme } = useTheme()
  const [report, setReport] = useState('')
  const [data, setData] = useState(null)

  const zoomIn = () => viewerRef.current?.zoomIn()
  const zoomOut = () => viewerRef.current?.zoomOut()
  const resetZoom = () => viewerRef.current?.resetView()
  const highlight = (q) => viewerRef.current?.highlight(q)

  useEffect(() => {
    if (!report) return
    fetch(`/json/${report}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Failed to load report', err))
  }, [report])

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        onReportChange={setReport}
        onSearch={highlight}
      />
      <div className="flex-1">
        <SQLFlowViewer ref={viewerRef} data={data} theme={theme} />
      </div>
    </div>
  )
}
