import { useMemo } from 'react'

export default function DetailsPanel({ node, nodesById = {}, edges = [] }) {
  const incoming = useMemo(() => {
    if (!node) return []
    const prefix = node.id + '::'
    return edges.filter((e) => e.targetId?.startsWith(prefix))
  }, [node, edges])

  const outgoing = useMemo(() => {
    if (!node) return []
    const prefix = node.id + '::'
    return edges.filter((e) => e.sourceId?.startsWith(prefix))
  }, [node, edges])

  const getLabel = (n) => {
    if (!n) return ''
    return typeof n.label === 'object' ? n.label.content : n.label
  }

  const renderList = (list, type) => (
    <div className="mt-2">
      <h4 className="font-semibold text-sm capitalize">{type}</h4>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">None</p>
      ) : (
        <ul className="list-disc list-inside text-sm">
          {list.map((e) => {
            const otherId =
              type === 'incoming'
                ? e.sourceId.split('::')[0]
                : e.targetId.split('::')[0]
            const otherLabel = getLabel(nodesById[otherId]) || otherId
            return <li key={e.id}>{otherLabel}</li>
          })}
        </ul>
      )}
    </div>
  )

  const content = (
    <div>
      {node ? (
        <div>
          <h3 className="font-bold">{getLabel(node)}</h3>
          <p className="text-xs text-gray-500">ID: {node.id}</p>
          {renderList(incoming, 'incoming')}
          {renderList(outgoing, 'outgoing')}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Select a node</p>
      )}
    </div>
  )

  return (
    <div className="md:w-64 md:border-l md:block">
      <div className="hidden md:block h-full overflow-y-auto p-4 bg-white">
        {content}
      </div>
      <details className="md:hidden border-t">
        <summary className="p-2 cursor-pointer select-none">Details</summary>
        <div className="p-4 bg-white border-t">{content}</div>
      </details>
    </div>
  )
}

