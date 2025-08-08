import { useEffect, useState } from 'react'

export default function ReportSelector({ onChange, className }) {
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState('')

  useEffect(() => {
    fetch('/json/index.json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.files)) {
          setReports(data.files)
        }
      })
      .catch((err) => {
        console.error('Failed to load report list', err)
      })
  }, [])

  const handleChange = (e) => {
    const value = e.target.value
    setSelected(value)
    if (onChange) onChange(value)
  }

  return (
    <select value={selected} onChange={handleChange} className={className}>
      <option value="" disabled>
        Select report
      </option>
      {reports.map((file) => (
        <option key={file} value={file}>
          {file}
        </option>
      ))}
    </select>
  )
}
