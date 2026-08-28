import React, { useState } from 'react'

const initialAreas = [
  { id: 1, name: 'Khu A', rows: [{ id: 11, name: 'Dãy A1', boxes: [{ id: 111, name: 'Hộp A1-01', crabs: 4 }, { id: 112, name: 'Hộp A1-02', crabs: 0 }] }] },
  { id: 2, name: 'Khu B', rows: [{ id: 21, name: 'Dãy B1', boxes: [{ id: 211, name: 'Hộp B1-01', crabs: 0 }] }] },
]

const FarmManagement = () => {
  const [areas, setAreas] = useState(initialAreas)
  const [selectedAreaId, setSelectedAreaId] = useState(1)
  const [selectedRowId, setSelectedRowId] = useState(11)
  const [form, setForm] = useState(null)
  const [draft, setDraft] = useState('')

  const area = areas.find((item) => item.id === selectedAreaId)
  const row = area?.rows.find((item) => item.id === selectedRowId) ?? area?.rows[0]

  const addItem = () => {
    if (!draft.trim()) return
    const value = draft.trim()
    setAreas((current) => {
      if (form === 'area') return [...current, { id: Date.now(), name: value, rows: [] }]
      return current.map((item) => {
      if (item.id !== area.id) return item
      if (form === 'row') return { ...item, rows: [...item.rows, { id: Date.now(), name: value, boxes: [] }] }
      return { ...item, rows: item.rows.map((itemRow) => itemRow.id === row.id
        ? { ...itemRow, boxes: [...itemRow.boxes, { id: Date.now(), name: value, crabs: 0 }] }
        : itemRow) }
      })
    })
    setDraft('')
    setForm(null)
  }

  return (
    <section className="farm-management">
      <div className="page-heading">
        <div>
          <h2>Quản lý khu nuôi</h2>
          <p>Quản lý theo cấp Khu → Dãy → Hộp</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => setForm('area')}>+ Thêm khu</button>
      </div>

      <div className="management-columns">
        <div className="management-panel">
          <div className="panel-title"><strong>Khu nuôi</strong><span>{areas.length}</span></div>
          {areas.map((item) => (
            <button className={`tree-item ${item.id === selectedAreaId ? 'selected' : ''}`} key={item.id} type="button" onClick={() => { setSelectedAreaId(item.id); setSelectedRowId(item.rows[0]?.id) }}>
              <span>◈ {item.name}</span><small>{item.rows.length} dãy</small>
            </button>
          ))}
        </div>

        <div className="management-panel">
          <div className="panel-title"><strong>Dãy nuôi</strong><button type="button" className="text-action" onClick={() => setForm('row')}>+ Thêm dãy</button></div>
          {(area?.rows ?? []).map((item) => (
            <button className={`tree-item ${item.id === row?.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedRowId(item.id)}>
              <span>☷ {item.name}</span><small>{item.boxes.length} hộp</small>
            </button>
          ))}
        </div>

        <div className="management-panel boxes-panel">
          <div className="panel-title"><strong>Hộp nuôi · {row?.name ?? 'Chưa có dãy'}</strong><button type="button" className="text-action" onClick={() => setForm('box')} disabled={!row}>+ Thêm hộp</button></div>
          {(row?.boxes ?? []).map((box) => (
            <article className={`box-item ${box.crabs ? 'occupied' : 'empty'} `} key={box.id}>
              <div><strong>{box.name}</strong><small>{box.crabs ? `Có ${box.crabs} con cua` : 'Chưa có cua'}</small></div>
              <span className="box-state">{box.crabs ? 'Đang nuôi' : 'Trống'}</span>
            </article>
          ))}
          {!row?.boxes.length && <p className="empty-copy">Dãy này chưa có hộp nuôi.</p>}
        </div>
      </div>

      {form && <div className="inline-form">
        <strong>{form === 'area' ? 'Thêm khu nuôi' : form === 'row' ? 'Thêm dãy nuôi' : 'Thêm hộp nuôi'}</strong>
        <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhập tên..." onKeyDown={(event) => event.key === 'Enter' && addItem()} />
        <button className="btn-primary" type="button" onClick={addItem}>Lưu</button>
        <button className="btn-secondary" type="button" onClick={() => setForm(null)}>Hủy</button>
      </div>}
    </section>
  )
}

export default FarmManagement