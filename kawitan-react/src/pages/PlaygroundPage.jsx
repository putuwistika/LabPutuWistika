import { useState } from 'react'
import Toolbar from '../components/Toolbar'
import Workspace from '../components/Workspace'

export default function PlaygroundPage() {
  const [zoom, setZoom] = useState(100)
  const [report, setReport] = useState('')

  const zoomIn = () => setZoom((z) => z + 10)
  const zoomOut = () => setZoom((z) => Math.max(10, z - 10))
  const resetZoom = () => setZoom(100)

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        onReportChange={setReport}
      />
      <Workspace zoom={zoom} />
    </div>
  )
}
